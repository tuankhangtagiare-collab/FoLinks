import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export class WalletService {
  /**
   * Fetches or creates a wallet for a user.
   */
  static async getOrCreateWallet(userId: string) {
    return await prisma.$transaction(async (tx) => {
      let wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId,
            balance: 0,
            pendingBalance: 0,
            lockedBalance: 0,
            totalEarned: 0,
            totalWithdraw: 0,
            totalBonus: 0,
            currency: "USD",
          },
        });
      }

      return wallet;
    });
  }

  /**
   * Safe ledger deposit (e.g. click rewards, referral bonuses, manual adjustments).
   */
  static async deposit({
    userId,
    amount,
    type,
    description,
    referenceId,
    ip = "0.0.0.0",
    userAgent = "System",
  }: {
    userId: string;
    amount: number;
    type: "EARNING" | "BONUS" | "REFERRAL" | "DEPOSIT" | "ADJUSTMENT";
    description?: string;
    referenceId?: string;
    ip?: string;
    userAgent?: string;
  }) {
    if (amount <= 0 || isNaN(amount) || !isFinite(amount)) {
      throw new Error("Invalid deposit amount.");
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Get user and verify exists
      const user = await tx.user.findUnique({
        where: { id: userId },
      });
      if (!user) throw new Error("User does not exist.");

      // 2. Fetch or create Wallet
      let wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId,
            balance: 0,
            pendingBalance: 0,
            lockedBalance: 0,
            totalEarned: 0,
            totalWithdraw: 0,
            totalBonus: 0,
            currency: "USD",
          },
        });
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = new Prisma.Decimal(balanceBefore).plus(amount);

      // 3. Update Wallet balances
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: balanceAfter,
          totalEarned: type === "EARNING" || type === "REFERRAL"
            ? new Prisma.Decimal(wallet.totalEarned).plus(amount)
            : wallet.totalEarned,
          totalBonus: type === "BONUS"
            ? new Prisma.Decimal(wallet.totalBonus).plus(amount)
            : wallet.totalBonus,
        },
      });

      // 4. Create Ledger transaction entry
      const ledgerTx = await tx.transaction.create({
        data: {
          userId,
          amount,
          type,
          status: "PAID",
          description: description || `Cộng số dư: ${type}`,
          referenceId,
        },
      });

      // 5. Update user schema walletBalance flat field (legacy support)
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: balanceAfter },
      });

      // Create activity log
      await tx.activityLog.create({
        data: {
          userId,
          action: `WALLET_DEPOSIT_${type}`,
          ip,
          device: userAgent,
          browser: userAgent,
          url: "/api/wallet/deposit",
          method: "SERVICE",
          payload: JSON.stringify({ amount, ledgerTxId: ledgerTx.id }),
        },
      });

      return { wallet: updatedWallet, transaction: ledgerTx };
    });
  }

  /**
   * Lock funds when creating a withdrawal request.
   */
  static async lockBalance({
    userId,
    amount,
  }: {
    userId: string;
    amount: number;
  }) {
    if (amount <= 0 || isNaN(amount) || !isFinite(amount)) {
      throw new Error("Invalid amount to lock.");
    }

    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new Error("Wallet not found.");

      if (new Prisma.Decimal(wallet.balance).lessThan(amount)) {
        throw new Error("Số dư khả dụng không đủ để thực hiện giao dịch này.");
      }

      const balanceAfter = new Prisma.Decimal(wallet.balance).minus(amount);
      const lockedAfter = new Prisma.Decimal(wallet.lockedBalance).plus(amount);

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: balanceAfter,
          lockedBalance: lockedAfter,
        },
      });

      // Update User legacy field
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: balanceAfter },
      });

      return updatedWallet;
    });
  }

  /**
   * Release locked balance (either charge it permanently or refund to available balance).
   */
  static async unlockBalance({
    userId,
    amount,
    refund,
  }: {
    userId: string;
    amount: number;
    refund: boolean;
  }) {
    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new Error("Wallet not found.");

      if (new Prisma.Decimal(wallet.lockedBalance).lessThan(amount)) {
        throw new Error("Số dư bị khóa không đủ.");
      }

      const lockedAfter = new Prisma.Decimal(wallet.lockedBalance).minus(amount);
      const balanceAfter = refund
        ? new Prisma.Decimal(wallet.balance).plus(amount)
        : wallet.balance;

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: balanceAfter,
          lockedBalance: lockedAfter,
          totalWithdraw: refund
            ? wallet.totalWithdraw
            : new Prisma.Decimal(wallet.totalWithdraw).plus(amount),
        },
      });

      // Update User legacy field
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: balanceAfter },
      });

      return updatedWallet;
    });
  }
}
