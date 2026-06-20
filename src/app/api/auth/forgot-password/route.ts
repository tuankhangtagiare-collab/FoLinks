import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { ForgotPasswordSchema } from "@/lib/validation";
import { generateToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/email";
import { logActivity } from "@/lib/logger";
import { getClientIp } from "@/lib/security";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent");

  try {
    const body = await req.json();
    const validatedFields = ForgotPasswordSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Email không hợp lệ" },
        { status: 422 }
      );
    }

    const { email } = validatedFields.data;

    // Search user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if email not found to prevent user enumeration security issues.
      return NextResponse.json({
        success: true,
        message: "Nếu địa chỉ email tồn tại trong hệ thống, bạn sẽ nhận được liên kết đặt lại mật khẩu.",
      });
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = generateToken({ userId: user.id, email: user.email }, 3600);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const resetLink = `${siteUrl}/auth/reset-password?token=${resetToken}`;

    // Write Activity Log
    await logActivity({
      userId: user.id,
      action: "FORGOT_PASSWORD_REQUEST",
      ip,
      url: "/api/auth/forgot-password",
      method: "POST",
      userAgent,
      payload: { email },
    });

    // Send reset email
    await sendEmail({
      to: user.email,
      subject: "Yêu cầu đặt lại mật khẩu Folink",
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px;">
          <h2 style="color: #4F46E5;">Khôi phục mật khẩu tài khoản Folink</h2>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấp vào nút bên dưới để tiến hành thiết lập mật khẩu mới:</p>
          <div style="margin: 24px 0;">
            <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Đặt lại mật khẩu</a>
          </div>
          <p style="font-size: 12px; color: #666;">Liên kết này chỉ có hiệu lực trong vòng 1 giờ. Nếu bạn không gửi yêu cầu này, hãy bỏ qua email an toàn này.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Nếu địa chỉ email tồn tại trong hệ thống, bạn sẽ nhận được liên kết đặt lại mật khẩu.",
    });

  } catch (error) {
    console.error("Forgot password request error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống trong quá trình gửi yêu cầu." }, { status: 500 });
  }
}
