import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

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
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            avatar: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: {
                username: true,
                role: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Không tìm thấy Ticket hỗ trợ." }, { status: 404 });
    }

    return NextResponse.json(ticket);

  } catch (error) {
    console.error("Admin Get Ticket Detail Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải chi tiết Ticket." }, { status: 500 });
  }
}

export async function POST(
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
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "Nội dung phản hồi không được để trống." }, { status: 400 });
    }

    // Verify ticket exists
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket không tồn tại." }, { status: 404 });
    }

    // Create SupportMessage
    const newMessage = await prisma.supportMessage.create({
      data: {
        ticketId: id,
        senderId: userSession.id,
        message,
      },
    });

    // Update ticket time
    await prisma.supportTicket.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Gửi phản hồi thành công!",
      data: newMessage,
    });

  } catch (error) {
    console.error("Admin Reply Ticket Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi gửi phản hồi." }, { status: 500 });
  }
}

export async function PUT(
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
    const body = await req.json();
    const { status, assigneeId, priority } = body;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket không tồn tại." }, { status: 404 });
    }

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: {
        status: status !== undefined ? status : ticket.status,
        assigneeId: assigneeId !== undefined ? assigneeId : ticket.assigneeId,
        priority: priority !== undefined ? priority : ticket.priority,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật Ticket thành công!",
      ticket: updated,
    });

  } catch (error) {
    console.error("Admin Update Ticket Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật Ticket." }, { status: 500 });
  }
}
