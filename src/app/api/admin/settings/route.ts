import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userSession = session?.user as any;

  if (!session || (userSession?.role !== "ADMIN" && userSession?.role !== "SUPER_ADMIN" && userSession?.role !== "MODERATOR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          websiteName: "Folink",
          supportEmail: "support@folink.com",
          minimumWithdraw: 5.00,
          maximumWithdraw: 1000.00,
          referralPercent: 10.00,
          defaultCpm: 3.00,
          captchaEnabled: true,
          countdownSeconds: 15,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Admin Get Settings Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải cấu hình." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  const userSession = session?.user as any;

  // Only Admin / SuperAdmin can update configuration details
  if (!session || (userSession?.role !== "ADMIN" && userSession?.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      return NextResponse.json({ error: "Không tìm thấy cấu hình hệ thống." }, { status: 404 });
    }

    const updatedSettings = await prisma.siteSettings.update({
      where: { id: settings.id },
      data: {
        websiteName: body.websiteName,
        logo: body.logo,
        favicon: body.favicon,
        description: body.description,
        supportEmail: body.supportEmail,
        maintenance: body.maintenance,
        maintenanceMessage: body.maintenanceMessage,
        minimumWithdraw: body.minimumWithdraw,
        maximumWithdraw: body.maximumWithdraw,
        referralPercent: body.referralPercent,
        defaultCpm: body.defaultCpm,
        bannerCode: body.bannerCode,
        socialBarCode: body.socialBarCode,
        interstitialCode: body.interstitialCode,
        captchaEnabled: body.captchaEnabled,
        countdownSeconds: body.countdownSeconds,
        cloudinaryKey: body.cloudinaryKey,
        cloudinarySecret: body.cloudinarySecret,
        cloudinaryCloudName: body.cloudinaryCloudName,
        adsterraPublisherId: body.adsterraPublisherId,
      },
    });

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        adminId: userSession.id,
        action: "UPDATE_SITE_SETTINGS",
        oldValue: JSON.stringify(settings),
        newValue: JSON.stringify(updatedSettings),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật cấu hình website thành công!",
      settings: updatedSettings,
    });

  } catch (error) {
    console.error("Admin Update Settings Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi lưu cấu hình." }, { status: 500 });
  }
}
