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
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "ALL";
  const status = searchParams.get("status") || "ALL";

  const skip = (page - 1) * limit;

  try {
    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { displayName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role !== "ALL") {
      where.role = role;
    }

    if (status !== "ALL") {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          wallet: true,
          _count: {
            select: {
              links: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        displayName: u.displayName,
        role: u.role,
        status: u.status,
        balance: Number(u.wallet?.balance || 0),
        totalEarned: Number(u.wallet?.totalEarned || 0),
        totalWithdraw: Number(u.wallet?.totalWithdraw || 0),
        linksCount: u._count.links,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin,
        country: u.country,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Admin List Users API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải danh sách người dùng." }, { status: 500 });
  }
}
