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
    const list = await prisma.announcements.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(list);
  } catch (error) {
    console.error("Admin Get Announcements Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải thông báo." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userSession = session?.user as any;

  if (!session || (userSession?.role !== "ADMIN" && userSession?.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, content, status, startTime, endTime } = body;

    const newAnnouncement = await prisma.announcements.create({
      data: {
        title,
        content,
        status: status || "ACTIVE",
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        adminId: userSession.id,
        action: `CREATE_ANNOUNCEMENT_${newAnnouncement.id}`,
        newValue: JSON.stringify(newAnnouncement),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tạo thông báo thành công!",
      announcement: newAnnouncement,
    });

  } catch (error) {
    console.error("Admin Create Announcement Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tạo thông báo." }, { status: 500 });
  }
}
