import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/tokens";
import { getClientIp } from "@/lib/security";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Thiếu thông tin phiên làm việc." }, { status: 400 });
    }

    const payload = verifyToken(token);

    if (!payload || payload.ip !== ip) {
      return NextResponse.json({ error: "Phiên làm việc không hợp lệ." }, { status: 400 });
    }

    const { visitId, slug, currentStep } = payload;

    if (currentStep !== 5) {
      return NextResponse.json({ error: "Thao tác không hợp lệ. Chưa hoàn thành các bước." }, { status: 400 });
    }

    // Verify session state in DB
    const visitStep = await prisma.visitStep.findFirst({
      where: { visitId },
      include: {
        visit: {
          include: {
            link: true,
          },
        },
      },
    });

    if (!visitStep || !visitStep.redirect) {
      return NextResponse.json({ error: "Phiên làm việc chưa được xác minh hoàn tất." }, { status: 400 });
    }

    const originalUrl = visitStep.visit.link.originalUrl;

    return NextResponse.json({
      success: true,
      originalUrl,
    });

  } catch (error) {
    console.error("Visit Redirect API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi chuyển hướng liên kết." }, { status: 500 });
  }
}
