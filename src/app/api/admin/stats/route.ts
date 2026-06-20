import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  const user = session?.user as any;

  if (!session || (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN" && user?.role !== "MODERATOR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Core counters
    const totalUsers = await prisma.user.count({ where: { deletedAt: null } });
    
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const onlineUsers = await prisma.user.count({
      where: {
        lastLogin: { gte: fifteenMinsAgo },
        deletedAt: null,
      },
    });

    const totalLinks = await prisma.link.count({ where: { deletedAt: null } });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayLinks = await prisma.link.count({
      where: {
        createdAt: { gte: startOfToday },
        deletedAt: null,
      },
    });

    const totalVisits = await prisma.linkVisit.count();
    
    const todayVisits = await prisma.linkVisit.count({
      where: { visitTime: { gte: startOfToday } },
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthVisits = await prisma.linkVisit.count({
      where: { visitTime: { gte: startOfMonth } },
    });

    // 2. Wallets & withdraw status
    const paidSum = await prisma.withdrawRequest.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    });

    const pendingSum = await prisma.withdrawRequest.aggregate({
      where: { status: "PENDING" },
      _sum: { amount: true },
    });

    // 3. Top countries / referrers / devices breakdown
    const countryBreakdown = await prisma.linkVisit.groupBy({
      by: ["country"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    const deviceBreakdown = await prisma.linkVisit.groupBy({
      by: ["device"],
      _count: { id: true },
    });

    const browserBreakdown = await prisma.linkVisit.groupBy({
      by: ["browser"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    // 4. Last 7 days chart data
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      const [visitsCount, usersCount, withdrawsCount] = await Promise.all([
        prisma.linkVisit.count({ where: { visitTime: { gte: d, lt: nextD } } }),
        prisma.user.count({ where: { createdAt: { gte: d, lt: nextD } } }),
        prisma.withdrawRequest.aggregate({
          where: { createdAt: { gte: d, lt: nextD }, status: "PAID" },
          _sum: { amount: true },
        }),
      ]);

      chartData.push({
        name: d.toLocaleDateString("vi-VN", { weekday: "short", day: "numeric" }),
        views: visitsCount,
        newUsers: usersCount,
        withdrawals: Number(withdrawsCount._sum.amount || 0),
      });
    }

    return NextResponse.json({
      cards: {
        totalUsers,
        onlineUsers,
        totalLinks,
        todayLinks,
        totalVisits,
        todayVisits,
        monthVisits,
        totalPaid: Number(paidSum._sum.amount || 0),
        totalPending: Number(pendingSum._sum.amount || 0),
      },
      charts: {
        performance: chartData,
        countries: countryBreakdown.map((c) => ({ name: c.country || "Khác", value: c._count.id })),
        devices: deviceBreakdown.map((d) => ({ name: d.device, value: d._count.id })),
        browsers: browserBreakdown.map((b) => ({ name: b.browser || "Khác", value: b._count.id })),
      },
    });

  } catch (error) {
    console.error("Admin Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải thống kê Admin." }, { status: 500 });
  }
}
