import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken, generateToken } from "@/lib/tokens";
import { getClientIp } from "@/lib/security";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  try {
    const { token, targetStep } = await req.json();

    if (!token || !targetStep) {
      return NextResponse.json({ error: "Thiếu thông tin phiên truy cập." }, { status: 400 });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Phiên truy cập không hợp lệ hoặc đã hết hạn." },
        { status: 400 }
      );
    }

    const { visitId, slug, currentStep } = payload;

    // Strict step validation
    if (targetStep !== currentStep + 1) {
      return NextResponse.json({ error: "Thao tác không hợp lệ. Vui lòng làm theo thứ tự." }, { status: 400 });
    }

    // Verify session in DB
    const visitStep = await prisma.visitStep.findFirst({
      where: { visitId },
    });

    if (!visitStep) {
      return NextResponse.json({ error: "Không tìm thấy phiên làm việc." }, { status: 404 });
    }

    const updateData: any = {};
    if (currentStep === 1) {
      updateData.banner = true;
    } else if (currentStep === 2) {
      updateData.socialBar = true;
    }

    // Update Step in database
    await prisma.visitStep.update({
      where: { id: visitStep.id },
      data: updateData,
    });

    // Generate new updated step token
    const updatedToken = generateToken({
      visitId,
      slug,
      currentStep: targetStep,
      ip,
    }, 1800);

    return NextResponse.json({
      success: true,
      token: updatedToken,
    });

  } catch (error) {
    console.error("Visit Step API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật bước truy cập." }, { status: 500 });
  }
}
