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
  const period = searchParams.get("period") || "7days"; // 7days, 30days, thisMonth, thisYear

  try {
    let startDate = new Date();
    let daysToFetch = 7;

    if (period === "7days") {
      daysToFetch = 7;
      startDate.setDate(startDate.getDate() - 6);
    } else if (period === "30days") {
      daysToFetch = 30;
      startDate.setDate(startDate.getDate() - 29);
    } else if (period === "thisMonth") {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      // calculate days between start of month and now
      daysToFetch = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
    } else if (period === "thisYear") {
      const now = new Date();
      startDate = new Date(now.getFullYear(), 0, 1);
      daysToFetch = 365;
    }

    startDate.setHours(0, 0, 0, 0);

    // Fetch visits for user's links
    const visits = await prisma.linkVisit.findMany({
      where: {
        link: { userId, deletedAt: null },
        visitTime: { gte: startDate },
      },
      select: {
        visitTime: true,
        status: true,
        reward: true,
        link: {
          select: {
            cpm: true,
          },
        },
      },
    });

    // Aggregate statistics
    let totalViews = visits.length;
    let validViews = visits.filter((v) => v.status === "VALID").length;
    let invalidViews = visits.filter((v) => v.status === "INVALID").length;
    let fraudViews = visits.filter((v) => v.status === "FRAUD").length;
    let revenue = visits
      .filter((v) => v.status === "VALID")
      .reduce((sum, v) => sum + Number(v.reward || 0), 0);

    // Calculate Average CPM
    const validVisitsWithCpm = visits.filter((v) => v.status === "VALID");
    const avgCpm = validVisitsWithCpm.length
      ? validVisitsWithCpm.reduce((sum, v) => sum + Number(v.link.cpm), 0) / validVisitsWithCpm.length
      : 3.00;

    // Generate chart data based on period
    const chartDataMap = new Map<string, { views: number; validViews: number; revenue: number }>();

    // Pre-populate keys
    if (period !== "thisYear") {
      for (let i = 0; i < daysToFetch; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dateKey = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
        chartDataMap.set(dateKey, { views: 0, validViews: 0, revenue: 0 });
      }

      visits.forEach((v) => {
        const dateKey = v.visitTime.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
        const existing = chartDataMap.get(dateKey);
        if (existing) {
          existing.views += 1;
          if (v.status === "VALID") {
            existing.validViews += 1;
            existing.revenue += Number(v.reward);
          }
        }
      });
    } else {
      // Group by month for thisYear
      for (let i = 0; i < 12; i++) {
        const dateKey = `Tháng ${i + 1}`;
        chartDataMap.set(dateKey, { views: 0, validViews: 0, revenue: 0 });
      }

      visits.forEach((v) => {
        const monthIndex = v.visitTime.getMonth();
        const dateKey = `Tháng ${monthIndex + 1}`;
        const existing = chartDataMap.get(dateKey);
        if (existing) {
          existing.views += 1;
          if (v.status === "VALID") {
            existing.validViews += 1;
            existing.revenue += Number(v.reward);
          }
        }
      });
    }

    const chartData = Array.from(chartDataMap.entries()).map(([label, data]) => ({
      name: label,
      views: data.views,
      validViews: data.validViews,
      revenue: Number(data.revenue.toFixed(4)),
    }));

    return NextResponse.json({
      summary: {
        totalViews,
        validViews,
        invalidViews,
        fraudViews,
        revenue,
        avgCpm,
      },
      chartData,
    });

  } catch (error) {
    console.error("Statistics API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải biểu đồ thống kê." }, { status: 500 });
  }
}
