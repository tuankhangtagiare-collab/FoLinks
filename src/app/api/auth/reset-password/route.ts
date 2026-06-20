import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import * as bcrypt from "bcryptjs";
import { ResetPasswordSchema } from "@/lib/validation";
import { verifyToken } from "@/lib/tokens";
import { logActivity } from "@/lib/logger";
import { getClientIp } from "@/lib/security";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent");

  try {
    const body = await req.json();
    const validatedFields = ResetPasswordSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Mật khẩu không hợp lệ", details: validatedFields.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { token, password } = validatedFields.data;

    // Verify reset token
    const payload = verifyToken(token);

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng." }, { status: 404 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password in database
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });

    // Write Activity Log
    await logActivity({
      userId: user.id,
      action: "RESET_PASSWORD",
      ip,
      url: "/api/auth/reset-password",
      method: "POST",
      userAgent,
    });

    // Send security notification email
    // ... optional, let's return success
    return NextResponse.json({
      success: true,
      message: "Đặt lại mật khẩu mới thành công! Bạn có thể đăng nhập ngay bây giờ.",
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống trong quá trình đặt lại mật khẩu." }, { status: 500 });
  }
}
