import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const searchParams = req.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "20");

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, read: false },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });

  } catch (error) {
    console.error("List Notifications API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải thông báo." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await req.json();
    const { id, readAll } = body;

    if (readAll) {
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true, message: "Đã đánh dấu đọc tất cả thông báo." });
    }

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID thông báo." }, { status: 400 });
    }

    await prisma.notification.update({
      where: { id, userId },
      data: { read: true },
    });

    return NextResponse.json({ success: true, message: "Đã đánh dấu đọc thông báo." });

  } catch (error) {
    console.error("Update Notification API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật thông báo." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get("id");
  const clearAll = searchParams.get("clearAll") === "true";

  try {
    if (clearAll) {
      await prisma.notification.deleteMany({
        where: { userId },
      });
      return NextResponse.json({ success: true, message: "Đã xóa toàn bộ thông báo." });
    }

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID thông báo." }, { status: 400 });
    }

    await prisma.notification.delete({
      where: { id, userId },
    });

    return NextResponse.json({ success: true, message: "Đã xóa thông báo thành công." });

  } catch (error) {
    console.error("Delete Notification API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi xóa thông báo." }, { status: 500 });
  }
}
