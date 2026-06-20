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
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "15");
  const logType = searchParams.get("logType") || "AUDIT"; // AUDIT or ACTIVITY

  const skip = (page - 1) * limit;

  try {
    if (logType === "AUDIT") {
      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          skip,
          take: limit,
          orderBy: { time: "desc" },
          include: {
            admin: {
              select: {
                username: true,
              },
            },
          },
        }),
        prisma.auditLog.count(),
      ]);

      return NextResponse.json({
        logs: logs.map((l) => ({
          id: l.id,
          username: l.admin.username,
          action: l.action,
          oldValue: l.oldValue,
          newValue: l.newValue,
          createdAt: l.time,
        })),
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } else {
      const [logs, total] = await Promise.all([
        prisma.activityLog.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        }),
        prisma.activityLog.count(),
      ]);

      return NextResponse.json({
        logs: logs.map((l) => ({
          id: l.id,
          username: l.user?.username || "Guest",
          action: l.action,
          ip: l.ip,
          device: l.device,
          browser: l.browser,
          url: l.url,
          method: l.method,
          createdAt: l.createdAt,
        })),
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    }

  } catch (error) {
    console.error("Admin List Logs Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải nhật ký." }, { status: 500 });
  }
}
