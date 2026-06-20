import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { WithdrawRequestSchema } from "@/lib/validation";
import { logActivity } from "@/lib/logger";
import { getClientIp } from "@/lib/security";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent");

  try {
    const body = await req.json();
    const validated = WithdrawRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Dữ liệu yêu cầu rút tiền không hợp lệ", details: validated.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { bankName, accountNumber, accountName, amount } = validated.data;

    // 1. Get user settings for limits
    const settings = await prisma.siteSettings.findFirst();
    const minWithdraw = Number(settings?.minimumWithdraw || 5.00);
    const maxWithdraw = Number(settings?.maximumWithdraw || 1000.00);

    if (amount < minWithdraw) {
      return NextResponse.json(
        { error: `Số tiền rút tối thiểu là $${minWithdraw.toFixed(2)}` },
        { status: 400 }
      );
    }

    if (amount > maxWithdraw) {
      return NextResponse.json(
        { error: `Số tiền rút tối đa mỗi lần là $${maxWithdraw.toFixed(2)}` },
        { status: 400 }
      );
    }

    // 2. Perform wallet check inside transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet || Number(wallet.balance) < amount) {
        throw new Error("Số dư khả dụng không đủ để thực hiện giao dịch.");
      }

      // Check if there is already a pending withdrawal request
      const pendingRequest = await tx.withdrawRequest.findFirst({
        where: { userId, status: "PENDING" },
      });

      if (pendingRequest) {
        throw new Error("Bạn đang có một yêu cầu rút tiền chờ phê duyệt.");
      }

      // Calculate new balances
      const newBalance = Number(wallet.balance) - amount;
      const newPending = Number(wallet.pendingBalance) + amount;

      // Update wallet
      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: {
          balance: newBalance,
          pendingBalance: newPending,
        },
      });

      // Update user walletBalance cache
      await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: newBalance,
        },
      });

      // Create WithdrawRequest
      const request = await tx.withdrawRequest.create({
        data: {
          userId,
          bankName,
          accountNumber,
          accountName,
          amount,
          status: "PENDING",
        },
      });

      // Create Notification
      await tx.notification.create({
        data: {
          userId,
          title: "Yêu cầu rút tiền đang chờ duyệt",
          content: `Yêu cầu rút $${amount.toFixed(2)} về tài khoản ${bankName} của bạn đã được ghi nhận và đang chờ duyệt.`,
          type: "PAYMENT",
        },
      });

      return request;
    });

    // Write Activity Log
    await logActivity({
      userId,
      action: "WITHDRAW_REQUEST",
      ip,
      url: "/api/user/withdraw",
      method: "POST",
      userAgent,
      payload: { amount, bankName },
    });

    return NextResponse.json({
      success: true,
      message: "Gửi yêu cầu rút tiền thành công! Vui lòng đợi quản trị viên duyệt.",
      request: result,
    });

  } catch (error: any) {
    console.error("Create Withdraw Request API Error:", error);
    return NextResponse.json({ error: error.message || "Lỗi hệ thống khi rút tiền." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status") || "ALL";

  const skip = (page - 1) * limit;

  try {
    const where: any = { userId };
    if (status !== "ALL") {
      where.status = status;
    }

    const [requests, total] = await Promise.all([
      prisma.withdrawRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
    console.error("List Withdraw Requests API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải lịch sử rút tiền." }, { status: 500 });
  }
}
