import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { getClientIp } from "@/lib/security";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // 1. Get Wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    // 2. Count Links
    const totalLinks = await prisma.link.count({
      where: { userId, deletedAt: null },
    });

    // 3. Count total views & revenue from Links
    const linkStats = await prisma.link.aggregate({
      where: { userId, deletedAt: null },
      _sum: {
        views: true,
        validViews: true,
        revenue: true,
      },
    });

    // 4. Get today's visits/revenue
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayStats = await prisma.linkVisit.aggregate({
      where: {
        link: { userId, deletedAt: null },
        visitTime: { gte: startOfToday },
        status: "VALID",
      },
      _count: {
        id: true,
      },
      _sum: {
        reward: true,
      },
    });

    // 5. Get current month visits/revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthStats = await prisma.linkVisit.aggregate({
      where: {
        link: { userId, deletedAt: null },
        visitTime: { gte: startOfMonth },
        status: "VALID",
      },
      _count: {
        id: true,
      },
      _sum: {
        reward: true,
      },
    });

    // 6. Top 10 links by revenue
    const topLinks = await prisma.link.findMany({
      where: { userId, deletedAt: null },
      orderBy: { revenue: "desc" },
      take: 10,
    });

    // 7. Graph data: last 7 days of views & revenue
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      return d;
    }).reverse();

    const chartData = await Promise.all(
      last7Days.map(async (day) => {
        const nextDay = new Date(day);
        nextDay.setDate(day.getDate() + 1);

        const stats = await prisma.linkVisit.aggregate({
          where: {
            link: { userId, deletedAt: null },
            visitTime: { gte: day, lt: nextDay },
            status: "VALID",
          },
          _count: {
            id: true,
          },
          _sum: {
            reward: true,
          },
        });

        return {
          date: day.toLocaleDateString("vi-VN", { weekday: "short", day: "numeric", month: "short" }),
          views: stats._count.id || 0,
          revenue: Number(stats._sum.reward || 0),
        };
      })
    );

    // 8. System announcements
    const announcements = await prisma.announcements.findMany({
      where: {
        status: "ACTIVE",
        startTime: { lte: new Date() },
        endTime: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    // 9. Total withdrawals
    const totalWithdrawal = await prisma.withdrawRequest.aggregate({
      where: { userId },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      wallet: {
        balance: Number(wallet?.balance || 0),
        pendingBalance: Number(wallet?.pendingBalance || 0),
        totalEarned: Number(wallet?.totalEarned || 0),
        totalWithdraw: Number(wallet?.totalWithdraw || 0),
      },
      stats: {
        totalLinks,
        totalViews: linkStats._sum.views || 0,
        totalValidViews: linkStats._sum.validViews || 0,
        totalRevenue: Number(linkStats._sum.revenue || 0),
        todayViews: todayStats._count.id || 0,
        todayRevenue: Number(todayStats._sum.reward || 0),
        monthViews: monthStats._count.id || 0,
        monthRevenue: Number(monthStats._sum.reward || 0),
        conversionRate: linkStats._sum.views ? ((linkStats._sum.validViews || 0) / linkStats._sum.views) * 100 : 0,
        totalWithdrawalAmount: Number(totalWithdrawal._sum.amount || 0),
      },
      topLinks: topLinks.map((link) => ({
        id: link.id,
        title: link.title || "Chưa đặt tên",
        slug: link.slug,
        views: link.views,
        revenue: Number(link.revenue),
        cpm: Number(link.cpm),
        createdAt: link.createdAt,
      })),
      chartData,
      announcements,
    });

  } catch (error) {
    console.error("Dashboard Summary API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải dữ liệu." }, { status: 500 });
  }
}
