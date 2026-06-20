"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  Filter,
  Check,
  X,
  CreditCard,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

interface WithdrawItem {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID" | "CANCELLED";
  createdAt: string;
  adminNote: string | null;
  user: {
    username: string;
    email: string;
  };
}

interface WithdrawResponse {
  requests: WithdrawItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function AdminWithdrawPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("ALL");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading, error } = useQuery<WithdrawResponse>({
    queryKey: ["admin-withdraw-list", page, status],
    queryFn: async () => {
      const res = await fetch(`/api/admin/withdraw?page=${page}&status=${status}`);
      if (!res.ok) throw new Error("Failed to fetch withdraw requests");
      return res.json();
    },
  });

  const processMutation = useMutation({
    mutationFn: async ({ id, newStatus, reason }: { id: string; newStatus: string; reason?: string }) => {
      const res = await fetch(`/api/admin/withdraw`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus, adminNote: reason }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to update withdraw request");
      return resData;
    },
    onSuccess: () => {
      setRejectId(null);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-withdraw-list"] });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400";
      case "APPROVED":
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400";
      case "PAID":
        return "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400";
      case "REJECTED":
        return "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400";
      default:
        return "bg-slate-55 text-slate-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Đang chờ duyệt";
      case "APPROVED":
        return "Đã duyệt";
      case "PAID":
        return "Đã thanh toán";
      case "REJECTED":
        return "Từ chối";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Xử lý Yêu cầu rút tiền</h2>
          <p className="text-slate-500 dark:text-slate-400">Xem xét và phê duyệt hoặc từ chối các lệnh rút tiền từ thành viên.</p>
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
        >
          <option value="ALL">Tất cả yêu cầu</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="PAID">Đã thanh toán</option>
          <option value="REJECTED">Bị từ chối</option>
        </select>
      </div>

      {isLoading ? (
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
      ) : error || !data ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed rounded-xl p-8">
          <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
          <h3 className="text-sm font-semibold text-red-650">Lỗi hệ thống khi tải yêu cầu rút tiền.</h3>
        </div>
      ) : data.requests.length === 0 ? (
        <div className="text-center py-12 text-slate-500">Chưa có yêu cầu rút tiền nào phát sinh.</div>
      ) : (
        <div className="space-y-4">
          <Card className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-650 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                <tr>
                  <th className="px-6 py-3 rounded-l-lg">Người rút</th>
                  <th className="px-6 py-3">Phương thức nhận</th>
                  <th className="px-6 py-3">Số tài khoản</th>
                  <th className="px-6 py-3">Số tiền</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3 text-right rounded-r-lg">Phê duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.requests.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">@{item.user.username}</div>
                      <div className="text-xs text-slate-500">{item.user.email}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold">{item.bankName}</td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm">{item.accountNumber}</div>
                      <div className="text-xs text-slate-500 uppercase">{item.accountName}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-950 dark:text-white">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.status === "PENDING" && (
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Approve trigger */}
                          <button
                            onClick={() =>
                              processMutation.mutate({
                                id: item.id,
                                newStatus: "APPROVED",
                              })
                            }
                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-md transition-colors"
                            title="Phê duyệt"
                          >
                            <Check className="h-4.5 w-4.5" />
                          </button>
                          {/* Reject trigger */}
                          <button
                            onClick={() => setRejectId(item.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
                            title="Từ chối"
                          >
                            <X className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      )}
                      
                      {item.status === "APPROVED" && (
                        <button
                          onClick={() =>
                            processMutation.mutate({
                              id: item.id,
                              newStatus: "PAID",
                            })
                          }
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          Xác nhận Đã trả
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Reject modal/box dialog */}
          {rejectId && (
            <Card className="border-red-200 bg-red-50/20 dark:bg-red-950/5 dark:border-red-900 max-w-md mx-auto p-4 space-y-4">
              <h4 className="font-bold text-sm text-red-650 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1.5" />
                Lý do từ chối giao dịch
              </h4>
              <textarea
                placeholder="Nhập lý do chuyển khoản không hợp lệ, sai STK..."
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none h-20 resize-none"
              />
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => setRejectId(null)}
                  className="px-3 py-1.5 border rounded-lg text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  onClick={() =>
                    processMutation.mutate({
                      id: rejectId,
                      newStatus: "REJECTED",
                      reason: rejectReason,
                    })
                  }
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg"
                >
                  Xác nhận Từ chối
                </button>
              </div>
            </Card>
          )}

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border rounded-xl">
              <span className="text-xs text-slate-500">
                Hiển thị trang {data.pagination.page} trên {data.pagination.totalPages}
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
                  disabled={page === data.pagination.totalPages}
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
    </div>
  );
}
