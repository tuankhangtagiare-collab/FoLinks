"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Wallet,
  ArrowDownRight,
  TrendingUp,
  History,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface Transaction {
  id: string;
  amount: number;
  fee: number;
  type: "EARNING" | "WITHDRAW" | "BONUS" | "REFERRAL" | "ADJUSTMENT";
  status: "PENDING" | "APPROVED" | "REJECTED";
  description: string | null;
  createdAt: string;
}

interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface WalletSummary {
  wallet: {
    balance: number;
    pendingBalance: number;
    totalEarned: number;
    totalWithdraw: number;
  };
  stats: {
    totalCommissions?: number;
  };
}

export default function WalletPage() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState("ALL");

  // Get wallet summary from dashboard summary API
  const { data: summaryData, isLoading: summaryLoading } = useQuery<WalletSummary>({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const res = await fetch("/api/user/dashboard");
      return res.json();
    },
  });

  // Get transactions
  const { data: transactionsData, isLoading: txLoading, error } = useQuery<TransactionsResponse>({
    queryKey: ["transactions-list", page, type],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        type,
      });
      const res = await fetch(`/api/user/transactions?${params}`);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
  });

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "EARNING":
        return "Thu nhập link";
      case "WITHDRAW":
        return "Rút tiền";
      case "BONUS":
        return "Thưởng thêm";
      case "REFERRAL":
        return "Hoa hồng giới thiệu";
      case "ADJUSTMENT":
        return "Điều chỉnh số dư";
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400";
      case "APPROVED":
        return "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400";
      case "REJECTED":
        return "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400";
      default:
        return "bg-slate-50 text-slate-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Đang xử lý";
      case "APPROVED":
        return "Thành công";
      case "REJECTED":
        return "Từ chối";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ví tiền của tôi</h2>
          <p className="text-slate-500 dark:text-slate-400">Xem tổng tài sản khả dụng, tiền đang chờ duyệt và lịch sử giao dịch.</p>
        </div>
        <Link
          href="/dashboard/withdraw"
          className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-sm transition-colors"
        >
          <ArrowDownRight className="h-4 w-4 mr-2" />
          Yêu cầu rút tiền
        </Link>
      </div>

      {/* Balances widgets */}
      {summaryLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      ) : summaryData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <span className="text-xs text-slate-500 uppercase font-semibold">Số dư khả dụng</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(summaryData.wallet.balance)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <span className="text-xs text-slate-500 uppercase font-semibold">Đang chờ duyệt</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">
                {formatCurrency(summaryData.wallet.pendingBalance)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <span className="text-xs text-slate-500 uppercase font-semibold">Đã rút thành công</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(summaryData.wallet.totalWithdraw)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <span className="text-xs text-slate-500 uppercase font-semibold">Tổng thu nhập tích lũy</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(summaryData.wallet.totalEarned)}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Transactions list */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="inline-flex items-center">
              <History className="h-5 w-5 mr-2 text-indigo-500" />
              Nhật ký giao dịch
            </CardTitle>
            <CardDescription>Danh sách mọi biến động số dư trong tài khoản của bạn.</CardDescription>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
            >
              <option value="ALL">Tất cả giao dịch</option>
              <option value="EARNING">Thu nhập link</option>
              <option value="WITHDRAW">Rút tiền</option>
              <option value="REFERRAL">Hoa hồng giới thiệu</option>
              <option value="BONUS">Thưởng thêm</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {txLoading ? (
            <div className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg"></div>
          ) : error || !transactionsData ? (
            <div className="flex items-center justify-center p-6 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              Lỗi khi tải lịch sử giao dịch.
            </div>
          ) : transactionsData.transactions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">Chưa có giao dịch phát sinh.</div>
          ) : (
            <div className="space-y-4">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                  <tr>
                    <th className="px-6 py-3">Ngày giao dịch</th>
                    <th className="px-6 py-3">Mã giao dịch</th>
                    <th className="px-6 py-3">Loại</th>
                    <th className="px-6 py-3">Số tiền</th>
                    <th className="px-6 py-3">Trạng thái</th>
                    <th className="px-6 py-3">Mô tả</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {transactionsData.transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="px-6 py-4">{new Date(tx.createdAt).toLocaleDateString("vi-VN")}</td>
                      <td className="px-6 py-4 font-mono text-xs">{tx.id}</td>
                      <td className="px-6 py-4 font-semibold">{getTransactionTypeLabel(tx.type)}</td>
                      <td className={`px-6 py-4 font-bold ${
                        tx.type === "WITHDRAW" ? "text-red-500" : "text-emerald-500"
                      }`}>
                        {tx.type === "WITHDRAW" ? "-" : "+"}{formatCurrency(tx.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(tx.status)}`}>
                          {getStatusLabel(tx.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs max-w-xs truncate">{tx.description || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {transactionsData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border rounded-xl">
                  <span className="text-xs text-slate-500">
                    Hiển thị trang {transactionsData.pagination.page} trên {transactionsData.pagination.totalPages}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="p-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      disabled={page === transactionsData.pagination.totalPages}
                      onClick={() => setPage(page + 1)}
                      className="p-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
