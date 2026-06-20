"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WithdrawRequestSchema } from "@/lib/validation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowDownCircle,
  HelpCircle,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { z } from "zod";

type WithdrawFormValues = z.infer<typeof WithdrawRequestSchema>;

interface WithdrawRequestData {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  adminNote: string | null;
}

interface WithdrawListResponse {
  requests: WithdrawRequestData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function WithdrawPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current wallet balance
  const { data: walletData } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const res = await fetch("/api/user/dashboard");
      return res.json();
    },
  });

  // Get withdraw history
  const { data: historyData, isLoading: historyLoading } = useQuery<WithdrawListResponse>({
    queryKey: ["withdraw-history", page],
    queryFn: async () => {
      const res = await fetch(`/api/user/withdraw?page=${page}`);
      if (!res.ok) throw new Error("Failed to fetch history");
      return res.json();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WithdrawFormValues>({
    resolver: zodResolver(WithdrawRequestSchema),
    defaultValues: {
      bankName: "",
      accountNumber: "",
      accountName: "",
      amount: 5,
    },
  });

  const onSubmit = async (values: WithdrawFormValues) => {
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/user/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra khi yêu cầu rút tiền.");
      }

      setSuccessMsg(data.message);
      reset();
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["withdraw-history"] });
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
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
        return "Đang chờ duyệt";
      case "APPROVED":
        return "Đã duyệt";
      case "REJECTED":
        return "Từ chối";
      default:
        return status;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Forms & Wallet Summary */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Yêu cầu rút tiền</h2>
          <p className="text-slate-500 dark:text-slate-400">Rút số dư tích lũy của bạn về tài khoản ngân hàng hoặc ví điện tử.</p>
        </div>

        {walletData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-none">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-indigo-100 font-semibold uppercase">Số dư khả dụng</span>
                    <h3 className="text-3xl font-black mt-1">
                      {formatCurrency(walletData.wallet.balance)}
                    </h3>
                  </div>
                  <ArrowDownCircle className="h-8 w-8 text-indigo-100/50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 flex justify-between items-start">
                <div>
                  <span className="text-xs text-slate-500 font-semibold uppercase">Tiền đang chờ duyệt</span>
                  <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                    {formatCurrency(walletData.wallet.pendingBalance)}
                  </h3>
                </div>
                <CreditCard className="h-8 w-8 text-amber-500/50" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Withdrawal Form */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin nhận tiền</CardTitle>
            <CardDescription>Vui lòng cung cấp chính xác thông tin tài khoản ngân hàng.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {successMsg && (
                <div className="p-4 bg-green-50 border border-green-200 text-sm text-green-600 rounded-lg flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 text-sm text-red-600 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Ngân hàng / Phương thức</label>
                  <select
                    {...register("bankName")}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                  >
                    <option value="">Chọn ngân hàng</option>
                    <option value="Vietcombank">Vietcombank</option>
                    <option value="Techcombank">Techcombank</option>
                    <option value="MB Bank">MB Bank</option>
                    <option value="Momo">Ví Momo</option>
                    <option value="ZaloPay">Ví ZaloPay</option>
                  </select>
                  {errors.bankName && <p className="text-xs text-red-500 mt-1">{errors.bankName.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Số tiền muốn rút (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="5.00"
                    {...register("amount", { valueAsNumber: true })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Số tài khoản</label>
                  <input
                    type="text"
                    placeholder="1903..."
                    {...register("accountNumber")}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {errors.accountNumber && <p className="text-xs text-red-500 mt-1">{errors.accountNumber.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Tên tài khoản (Chữ hoa không dấu)</label>
                  <input
                    type="text"
                    placeholder="NGUYEN VAN A"
                    {...register("accountName")}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {errors.accountName && <p className="text-xs text-red-500 mt-1">{errors.accountName.message}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-3 rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Đang gửi yêu cầu...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownCircle className="h-4 w-4" />
                    <span>Xác nhận rút tiền</span>
                  </>
                )}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* History Sidebar */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold">Lịch sử rút tiền</h3>
          <p className="text-xs text-slate-500 mt-0.5">Yêu cầu rút tiền gần đây của bạn.</p>
        </div>

        {historyLoading ? (
          <div className="h-80 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
        ) : !historyData || historyData.requests.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-6 text-center min-h-[250px]">
            <HelpCircle className="h-8 w-8 text-slate-300 mb-2" />
            <h4 className="font-semibold text-sm">Chưa có yêu cầu nào</h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1">Khi bạn thực hiện rút tiền, trạng thái yêu cầu sẽ hiển thị ở đây.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {historyData.requests.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{item.bankName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">STK: {item.accountNumber}</div>
                  <div className="flex items-center justify-between pt-1 border-t">
                    <span className="text-xs text-slate-500">Số tiền rút</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(item.amount)}</span>
                  </div>
                  {item.adminNote && (
                    <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-100 dark:border-red-900">
                      Ghi chú: {item.adminNote}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Micro Pagination */}
            {historyData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg">
                <span className="text-xs text-slate-500">
                  {page}/{historyData.pagination.totalPages}
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="p-1 border rounded disabled:opacity-50"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                  <button
                    disabled={page === historyData.pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-1 border rounded disabled:opacity-50"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
