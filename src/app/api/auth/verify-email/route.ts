import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/tokens";
import { logActivity } from "@/lib/logger";
import { getClientIp } from "@/lib/security";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent");

  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Thiếu mã xác minh." }, { status: 400 });
    }

    const payload = verifyToken(token);

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: "Mã xác minh không hợp lệ hoặc đã hết hạn." },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng." }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "Email đã được xác minh trước đó.",
      });
    }

    // Update User emailVerified
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    // Write Activity Log
    await logActivity({
      userId: user.id,
      action: "VERIFY_EMAIL",
      ip,
      url: "/api/auth/verify-email",
      method: "POST",
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: "Xác minh địa chỉ Email thành công!",
    });

  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống trong quá trình xác minh." }, { status: 500 });
  }
}
