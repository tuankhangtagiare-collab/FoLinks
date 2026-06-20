import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });

    const settings = await prisma.siteSettings.findFirst();
    const referralPercent = Number(settings?.referralPercent || 10.00);

    // Total invited users
    const totalReferrals = await prisma.referral.count({
      where: { referrerId: userId },
    });

    // Total commissions earned
    const earningsSum = await prisma.referralEarning.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    const totalCommissions = Number(earningsSum._sum.amount || 0);

    // Today commissions
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayEarnings = await prisma.referralEarning.aggregate({
      where: {
        userId,
        createdAt: { gte: startOfToday },
      },
      _sum: { amount: true },
    });

    // Month commissions
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthEarnings = await prisma.referralEarning.aggregate({
      where: {
        userId,
        createdAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
    });

    // List of referred users
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        invitedUser: {
          select: {
            username: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate commission per referee
    const referees = await Promise.all(
      referrals.map(async (ref) => {
        const refereeEarnings = await prisma.referralEarning.aggregate({
          where: {
            userId,
            sourceUserId: ref.invitedUserId,
          },
          _sum: { amount: true },
        });

        return {
          id: ref.id,
          username: ref.invitedUser.username,
          createdAt: ref.invitedUser.createdAt,
          commission: Number(refereeEarnings._sum.amount || 0),
        };
      })
    );

    return NextResponse.json({
      referralCode: user?.referralCode || "",
      referralPercent,
      stats: {
        totalReferrals,
        totalCommissions,
        todayCommissions: Number(todayEarnings._sum.amount || 0),
        monthCommissions: Number(monthEarnings._sum.amount || 0),
      },
      referees,
    });

  } catch (error) {
    console.error("Referral API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải dữ liệu giới thiệu." }, { status: 500 });
  }
}
