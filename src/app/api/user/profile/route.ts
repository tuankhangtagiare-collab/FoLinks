import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import * as bcrypt from "bcryptjs";
import { logActivity } from "@/lib/logger";
import { getClientIp } from "@/lib/security";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent");

  try {
    const body = await req.json();
    const { displayName, username, avatar, timezone, language, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng." }, { status: 404 });
    }

    const updateData: any = {};

    // 1. Username change validation
    if (username && username !== user.username) {
      const usernameExists = await prisma.user.findUnique({
        where: { username },
      });
      if (usernameExists) {
        return NextResponse.json({ error: "Tên đăng nhập đã được sử dụng." }, { status: 400 });
      }
      updateData.username = username;
    }

    // 2. Simple profile details
    if (displayName !== undefined) updateData.displayName = displayName;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (language !== undefined) updateData.language = language;

    // 3. Password change logic
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Vui lòng nhập mật khẩu hiện tại." }, { status: 400 });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: "Mật khẩu hiện tại không chính xác." }, { status: 400 });
      }

      if (newPassword.length < 8) {
        return NextResponse.json({ error: "Mật khẩu mới phải tối thiểu 8 ký tự." }, { status: 400 });
      }

      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    // 4. Update Database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Write Activity Log
    await logActivity({
      userId,
      action: newPassword ? "CHANGE_PASSWORD" : "EDIT_PROFILE",
      ip,
      url: "/api/user/profile",
      method: "PUT",
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật hồ sơ tài khoản thành công!",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        avatar: updatedUser.avatar,
        timezone: updatedUser.timezone,
        language: updatedUser.language,
      },
    });

  } catch (error) {
    console.error("Profile API Update Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật hồ sơ." }, { status: 500 });
  }
}
