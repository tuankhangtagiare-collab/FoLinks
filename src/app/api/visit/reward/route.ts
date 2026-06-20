import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken, generateToken } from "@/lib/tokens";
import { getClientIp } from "@/lib/security";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Thiếu thông tin phiên làm việc." }, { status: 400 });
    }

    const payload = verifyToken(token);

    if (!payload || payload.ip !== ip) {
      return NextResponse.json({ error: "Phiên làm việc không hợp lệ." }, { status: 400 });
    }

    const { visitId, slug, currentStep } = payload;

    if (currentStep !== 4) {
      return NextResponse.json({ error: "Yêu cầu bỏ qua không hợp lệ." }, { status: 400 });
    }

    // Verify visit and check if already completed
    const visit = await prisma.linkVisit.findUnique({
      where: { id: visitId },
      include: {
        link: {
          include: {
            user: {
              include: {
                referredBy: true,
              },
            },
          },
        },
      },
    });

    if (!visit) {
      return NextResponse.json({ error: "Không tìm thấy phiên làm việc." }, { status: 404 });
    }

    const visitStep = await prisma.visitStep.findFirst({
      where: { visitId },
    });

    if (!visitStep) {
      return NextResponse.json({ error: "Không tìm thấy tiến trình vượt link." }, { status: 404 });
    }

    if (visitStep.reward) {
      // Already rewarded, return step 5 token directly to let them redirect
      const updatedToken = generateToken({ visitId, slug, currentStep: 5, ip }, 1800);
      return NextResponse.json({ success: true, token: updatedToken });
    }

    const link = visit.link;
    const owner = link.user;
    const cpm = Number(link.cpm);
    const reward = visit.status === "VALID" ? cpm / 1000 : 0;

    // Load site settings
    const settings = await prisma.siteSettings.findFirst();
    const referralPercent = Number(settings?.referralPercent || 10.00);

    // Perform database updates inside transaction
    const finalResult = await prisma.$transaction(async (tx) => {
      // 1. Update steps
      const updatedStep = await tx.visitStep.update({
        where: { id: visitStep.id },
        data: {
          countdown: true,
          reward: true,
          redirect: true,
          completedTime: new Date(),
        },
      });

      // 2. Update LinkVisit reward
      await tx.linkVisit.update({
        where: { id: visit.id },
        data: { reward },
      });

      // 3. Update Link view count
      const isVal = visit.status === "VALID";
      await tx.link.update({
        where: { id: link.id },
        data: {
          views: { increment: 1 },
          validViews: isVal ? { increment: 1 } : undefined,
          revenue: isVal ? { increment: reward } : undefined,
        },
      });

      // 4. Update owner's wallet if VALID
      if (isVal && reward > 0) {
        const wallet = await tx.wallet.findUnique({
          where: { userId: owner.id },
        });

        if (wallet) {
          const newBalance = Number(wallet.balance) + reward;
          const newTotalEarned = Number(wallet.totalEarned) + reward;

          await tx.wallet.update({
            where: { userId: owner.id },
            data: {
              balance: newBalance,
              totalEarned: newTotalEarned,
            },
          });

          await tx.user.update({
            where: { id: owner.id },
            data: {
              walletBalance: newBalance,
            },
          });

          // Create Transaction log
          const transaction = await tx.transaction.create({
            data: {
              userId: owner.id,
              amount: reward,
              type: "EARNING",
              status: "APPROVED",
              description: `Thu nhập từ click vượt link: go/${link.slug}`,
              referenceId: visit.id,
            },
          });

          // 5. Handle referral commission
          if (owner.referredById) {
            const referrerWallet = await tx.wallet.findUnique({
              where: { userId: owner.referredById },
            });

            if (referrerWallet) {
              const commission = reward * (referralPercent / 100);
              const refNewBalance = Number(referrerWallet.balance) + commission;
              const refNewTotalEarned = Number(referrerWallet.totalEarned) + commission;

              await tx.wallet.update({
                where: { userId: owner.referredById },
                data: {
                  balance: refNewBalance,
                  totalEarned: refNewTotalEarned,
                },
              });

              await tx.user.update({
                where: { id: owner.referredById },
                data: {
                  walletBalance: refNewBalance,
                },
              });

              // Create Referral transaction
              const refTx = await tx.transaction.create({
                data: {
                  userId: owner.referredById,
                  amount: commission,
                  type: "REFERRAL",
                  status: "APPROVED",
                  description: `Hoa hồng giới thiệu từ thành viên: ${owner.username}`,
                  referenceId: visit.id,
                },
              });

              // Create Referral Relation update
              const referralRecord = await tx.referral.findFirst({
                where: { referrerId: owner.referredById, invitedUserId: owner.id },
              });

              if (referralRecord) {
                await tx.referral.update({
                  where: { id: referralRecord.id },
                  data: {
                    commission: { increment: commission },
                  },
                });

                await tx.referralEarning.create({
                  data: {
                    referralId: referralRecord.id,
                    amount: commission,
                    transactionId: refTx.id,
                    sourceUserId: owner.id,
                    userId: owner.referredById,
                  },
                });
              }
            }
          }
        }
      }

      // 6. Update Daily & Monthly Statistics
      const todayStr = new Date();
      todayStr.setHours(0, 0, 0, 0);

      const monthStr = new Date().toISOString().substring(0, 7); // YYYY-MM

      await tx.dailyStatistics.upsert({
        where: { date: todayStr },
        create: {
          date: todayStr,
          views: 1,
          validViews: isVal ? 1 : 0,
          revenue: isVal ? reward : 0,
        },
        update: {
          views: { increment: 1 },
          validViews: isVal ? { increment: 1 } : undefined,
          revenue: isVal ? { increment: reward } : undefined,
        },
      });

      await tx.monthlyStatistics.upsert({
        where: { month: monthStr },
        create: {
          month: monthStr,
          views: 1,
          revenue: isVal ? reward : 0,
        },
        update: {
          views: { increment: 1 },
          revenue: isVal ? { increment: reward } : undefined,
        },
      });

      return updatedStep;
    });

    // 7. Generate final token
    const updatedToken = generateToken({
      visitId,
      slug,
      currentStep: 5,
      ip,
    }, 1800);

    return NextResponse.json({
      success: true,
      token: updatedToken,
    });

  } catch (error) {
    console.error("Reward calculation error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cộng thưởng." }, { status: 500 });
  }
}
