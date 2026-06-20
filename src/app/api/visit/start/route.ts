import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { detectFraud, isDuplicateVisit } from "@/lib/services/fraud-detector";
import { generateToken } from "@/lib/tokens";
import { getClientIp } from "@/lib/security";
import { parseUserAgent } from "@/lib/device";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") || "";
  const { device, browser, os } = parseUserAgent(userAgent);

  try {
    const body = await req.json();
    const { slug, password, fingerprint, webdriver, headless } = body;

    // 1. Check link
    const link = await prisma.link.findUnique({
      where: { slug },
    });

    if (!link || link.status === "DELETED") {
      return NextResponse.json({ error: "Liên kết không tồn tại." }, { status: 404 });
    }

    if (link.status === "PAUSED") {
      return NextResponse.json({ error: "Liên kết đã bị tạm dừng." }, { status: 403 });
    }

    // Check password
    if (link.password && link.password !== password) {
      return NextResponse.json({ error: "Mật khẩu liên kết không chính xác." }, { status: 401 });
    }

    // 2. Load site configuration settings
    const settings = await prisma.siteSettings.findFirst();
    const duplicateTime = 1440; // 24 hours (1440 minutes)

    // 3. Fraud Detection
    const fraudCheck = await detectFraud({
      ip,
      fingerprint,
      userAgent,
      webdriver,
      headless,
    });

    // 4. Duplicate Check
    const duplicate = await isDuplicateVisit(ip, fingerprint || null, link.id, duplicateTime);

    // Initial status
    let visitStatus = "VALID";
    let reason = null;

    if (fraudCheck.isFraud) {
      visitStatus = "FRAUD";
      reason = fraudCheck.reason.join(", ");
      
      // Log fraud
      await prisma.fraudLog.create({
        data: {
          reason: reason,
          fingerprint: fingerprint || null,
          vpn: fraudCheck.vpn,
          proxy: fraudCheck.proxy,
          bot: fraudCheck.bot,
          emulator: fraudCheck.emulator,
          riskScore: fraudCheck.riskScore,
        },
      });
    } else if (duplicate) {
      visitStatus = "INVALID";
      reason = "Duplicate visit within interval";
    }

    // 5. Create LinkVisit
    const visit = await prisma.linkVisit.create({
      data: {
        linkId: link.id,
        visitorIp: ip,
        browser,
        device,
        os,
        country: req.headers.get("x-vercel-ip-country") || "VN",
        city: req.headers.get("x-vercel-ip-city") || "Hanoi",
        referrer: req.headers.get("referer") || null,
        fingerprint: fingerprint || null,
        status: visitStatus as any,
        reason,
        reward: 0, // will be calculated and updated at reward step
      },
    });

    // Create initial Step tracker
    const visitStep = await prisma.visitStep.create({
      data: {
        visitId: visit.id,
        banner: false,
        socialBar: false,
        captcha: false,
        countdown: false,
      },
    });

    // 6. Generate visit session token
    const sessionToken = generateToken({
      visitId: visit.id,
      slug: link.slug,
      currentStep: 1,
      ip,
    }, 1800); // 30 minutes expiry

    return NextResponse.json({
      success: true,
      token: sessionToken,
      settings: {
        countdownSeconds: settings?.countdownSeconds || 15,
        captchaEnabled: settings?.captchaEnabled ?? true,
        bannerCode: settings?.bannerCode || "",
        socialBarCode: settings?.socialBarCode || "",
      },
    });

  } catch (error) {
    console.error("Visit Start API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi khởi tạo phiên truy cập." }, { status: 500 });
  }
}
