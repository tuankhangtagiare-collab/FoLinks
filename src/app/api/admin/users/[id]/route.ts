import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import * as bcrypt from "bcryptjs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userSession = session?.user as any;

  if (!session || (userSession?.role !== "ADMIN" && userSession?.role !== "SUPER_ADMIN" && userSession?.role !== "MODERATOR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: {
        wallet: true,
        links: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        withdrawRequests: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Người dùng không tồn tại." }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        country: user.country,
        balance: Number(user.wallet?.balance || 0),
        pendingBalance: Number(user.wallet?.pendingBalance || 0),
        totalEarned: Number(user.wallet?.totalEarned || 0),
        totalWithdraw: Number(user.wallet?.totalWithdraw || 0),
      },
      links: user.links,
      withdrawals: user.withdrawRequests,
    });

  } catch (error) {
    console.error("Admin Get User Detail API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải chi tiết người dùng." }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userSession = session?.user as any;

  // Mod cannot modify user details, only Admin / SuperAdmin
  if (!session || (userSession?.role !== "ADMIN" && userSession?.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { role, status, balance, password } = body;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { wallet: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Người dùng không tồn tại." }, { status: 404 });
    }

    const updateData: any = {};
    if (role) {
      // Super admin can change roles to admin, etc.
      if (userSession.role === "SUPER_ADMIN" || role === "USER" || role === "MODERATOR") {
        updateData.role = role;
      }
    }

    if (status) {
      updateData.status = status;
    }

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    // Update User
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Update Wallet Balance
    if (balance !== undefined && user.wallet) {
      const parsedBalance = parseFloat(balance);
      await prisma.wallet.update({
        where: { id: user.wallet.id },
        data: {
          balance: parsedBalance,
        },
      });

      await prisma.user.update({
        where: { id },
        data: {
          walletBalance: parsedBalance,
        },
      });

      // Write adjustment transaction
      await prisma.transaction.create({
        data: {
          userId: id,
          amount: parsedBalance - Number(user.wallet.balance),
          type: "ADJUSTMENT",
          status: "APPROVED",
          description: `Điều chỉnh số dư bởi quản trị viên ${userSession.name}`,
        },
      });
    }

    // Write Admin Audit Log
    await prisma.auditLog.create({
      data: {
        adminId: userSession.id,
        action: `UPDATE_USER_${id}`,
        oldValue: JSON.stringify({ role: user.role, status: user.status }),
        newValue: JSON.stringify({ role: updatedUser.role, status: updatedUser.status }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật tài khoản người dùng thành công!",
    });

  } catch (error) {
    console.error("Admin Update User API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật người dùng." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userSession = session?.user as any;

  if (!session || userSession?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Chỉ Super Admin mới có quyền xóa người dùng." }, { status: 403 });
  }

  const { id } = await params;

  try {
    // Soft delete user
    await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "BANNED",
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: userSession.id,
        action: `DELETE_USER_${id}`,
        oldValue: "ACTIVE",
        newValue: "DELETED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Xóa người dùng thành công!",
    });

  } catch (error) {
    console.error("Admin Delete User API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi xóa người dùng." }, { status: 500 });
  }
}
