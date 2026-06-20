import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import * as bcrypt from "bcryptjs";
import { RegisterSchema } from "@/lib/validation";
import { logActivity } from "@/lib/logger";
import { generateToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/email";
import { getClientIp } from "@/lib/security";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent");

  try {
    const body = await req.json();
    const validatedFields = RegisterSchema.safeParse(body);

    if (!validatedFields.success) {
      console.log("Validation failed for registration:", validatedFields.error.flatten().fieldErrors);
      return NextResponse.json(
        { 
          error: "Dữ liệu đăng ký không hợp lệ", 
          details: validatedFields.error.flatten().fieldErrors 
        },
        { status: 422 }
      );
    }

    const { username, email, password } = validatedFields.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      const isEmailConflict = existingUser.email.toLowerCase() === email.toLowerCase();
      return NextResponse.json(
        { error: isEmailConflict ? "Email đã được sử dụng." : "Tên đăng nhập đã được sử dụng." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique referral code (8 random alphanumeric characters uppercase)
    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Create User, Wallet, Notification in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          username,
          email,
          passwordHash: hashedPassword,
          referralCode,
          walletBalance: 0,
        },
      });

      await tx.wallet.create({
        data: {
          userId: createdUser.id,
          balance: 0,
          pendingBalance: 0,
          totalEarned: 0,
          totalWithdraw: 0,
          currency: "USD",
        },
      });

      await tx.notification.create({
        data: {
          userId: createdUser.id,
          title: "Chào mừng bạn đến với Folink!",
          content: "Cảm ơn bạn đã tham gia Folink. Hãy bắt đầu rút gọn liên kết và kiếm tiền ngay hôm nay!",
          type: "INFO",
        },
      });

      return createdUser;
    });

    // Write Activity Log
    await logActivity({
      userId: newUser.id,
      action: "REGISTER",
      ip,
      url: "/api/auth/register",
      method: "POST",
      userAgent,
      payload: { username, email },
    });

    // Generate email verification token (expires in 24 hours)
    const verificationToken = generateToken({ email: newUser.email, userId: newUser.id }, 24 * 3600);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const verificationLink = `${siteUrl}/auth/verify-email?token=${verificationToken}`;

    // Send email
    await sendEmail({
      to: newUser.email,
      subject: "Xác minh tài khoản Folink",
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px;">
          <h2 style="color: #4F46E5;">Chào mừng đến với Folink!</h2>
          <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng nhấp vào liên kết bên dưới để xác minh địa chỉ email của bạn:</p>
          <div style="margin: 24px 0;">
            <a href="${verificationLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Xác minh địa chỉ Email</a>
          </div>
          <p style="font-size: 12px; color: #666;">Liên kết xác minh này sẽ hết hạn trong vòng 24 giờ. Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Đăng ký tài khoản thành công! Vui lòng kiểm tra email để xác minh tài khoản.",
    });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống trong quá trình đăng ký." }, { status: 500 });
  }
}
