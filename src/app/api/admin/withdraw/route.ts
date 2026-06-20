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
  const status = searchParams.get("status") || "ALL";

  const skip = (page - 1) * limit;

  try {
    const where: any = {};
    if (status !== "ALL") {
      where.status = status;
    }

    const [requests, total] = await Promise.all([
      prisma.withdrawRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              username: true,
              email: true,
            },
          },
        },
      }),
      prisma.withdrawRequest.count({ where }),
    ]);

    return NextResponse.json({
      requests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Admin List Withdraw API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải yêu cầu rút tiền." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  const userSession = session?.user as any;

  if (!session || (userSession?.role !== "ADMIN" && userSession?.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, status, adminNote } = body; // status: APPROVED, REJECTED, PAID, CANCELLED

    if (!id || !status) {
      return NextResponse.json({ error: "Thiếu thông tin xử lý." }, { status: 400 });
    }

    const withdraw = await prisma.withdrawRequest.findUnique({
      where: { id },
      include: {
        user: {
          include: { wallet: true },
        },
      },
    });

    if (!withdraw) {
      return NextResponse.json({ error: "Yêu cầu rút tiền không tồn tại." }, { status: 404 });
    }

    if (withdraw.status !== "PENDING" && status !== "PAID" && status !== "CANCELLED") {
      return NextResponse.json({ error: "Yêu cầu này đã được xử lý từ trước." }, { status: 400 });
    }

    const amount = Number(withdraw.amount);
    const userId = withdraw.userId;

    const result = await prisma.$transaction(async (tx) => {
      // Load current wallet inside transaction
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) throw new Error("Không tìm thấy ví người dùng.");

      const updateWithdrawData: any = {
        status,
        adminNote: adminNote || withdraw.adminNote,
        approvedById: userSession.id,
        approvedTime: new Date(),
      };

      if (status === "APPROVED" || status === "PAID") {
        // Shifting pending to final withdraw
        const newPending = Number(wallet.pendingBalance) - amount;
        const newTotalWithdraw = Number(wallet.totalWithdraw) + amount;

        await tx.wallet.update({
          where: { userId },
          data: {
            pendingBalance: newPending,
            totalWithdraw: newTotalWithdraw,
          },
        });

        // Log transaction success
        await tx.transaction.create({
          data: {
            userId,
            amount: amount,
            type: "WITHDRAW",
            status: "APPROVED",
            description: `Yêu cầu rút tiền được phê duyệt thành công.`,
            referenceId: withdraw.id,
          },
        });

        // Notify user
        await tx.notification.create({
          data: {
            userId,
            title: "Yêu cầu rút tiền thành công",
            content: `Yêu cầu rút $${amount.toFixed(2)} của bạn đã được phê duyệt và chuyển khoản thành công.`,
            type: "PAYMENT",
          },
        });

      } else if (status === "REJECTED" || status === "CANCELLED") {
        // Refund balances
        const newPending = Number(wallet.pendingBalance) - amount;
        const newBalance = Number(wallet.balance) + amount;

        await tx.wallet.update({
          where: { userId },
          data: {
            pendingBalance: newPending,
            balance: newBalance,
          },
        });

        await tx.user.update({
          where: { id: userId },
          data: {
            walletBalance: newBalance,
          },
        });

        // Log transaction refund
        await tx.transaction.create({
          data: {
            userId,
            amount: amount,
            type: "ADJUSTMENT",
            status: "REJECTED",
            description: `Hoàn tiền yêu cầu rút bị từ chối: ${adminNote || "Không có lý do"}`,
            referenceId: withdraw.id,
          },
        });

        // Notify user
        await tx.notification.create({
          data: {
            userId,
            title: "Yêu cầu rút tiền bị từ chối",
            content: `Yêu cầu rút $${amount.toFixed(2)} của bạn đã bị từ chối. Lý do: ${adminNote || "Không có lý do"}`,
            type: "PAYMENT",
          },
        });
      }

      return tx.withdrawRequest.update({
        where: { id },
        data: updateWithdrawData,
      });
    });

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        adminId: userSession.id,
        action: `PROCESS_WITHDRAW_${id}`,
        oldValue: "PENDING",
        newValue: status,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Xử lý yêu cầu rút tiền thành công: ${status}`,
      request: result,
    });

  } catch (error: any) {
    console.error("Admin Process Withdraw Error:", error);
    return NextResponse.json({ error: error.message || "Lỗi hệ thống khi xử lý rút tiền." }, { status: 500 });
  }
}
