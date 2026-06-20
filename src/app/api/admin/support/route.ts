import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userSession = session?.user as any;

  if (!session || (userSession?.role !== "ADMIN" && userSession?.role !== "SUPER_ADMIN" && userSession?.role !== "MODERATOR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") || "ALL";

  try {
    const where: any = {};
    if (status !== "ALL") {
      where.status = status;
    }

    const tickets = await prisma.supportTicket.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        assignee: {
          select: {
            username: true,
          },
        },
      },
    });

    return NextResponse.json(tickets);

  } catch (error) {
    console.error("Admin List Tickets Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải ticket hỗ trợ." }, { status: 500 });
  }
}
