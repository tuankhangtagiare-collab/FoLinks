"use client";

import React, { useState, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Wallet,
  Shield,
  Key,
  Save,
  CheckCircle,
  AlertCircle,
  Clock,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";

interface UserDetailResponse {
  user: {
    id: string;
    username: string;
    email: string;
    displayName: string | null;
    role: string;
    status: string;
    createdAt: string;
    lastLogin: string | null;
    country: string | null;
    balance: number;
    pendingBalance: number;
    totalEarned: number;
    totalWithdraw: number;
  };
  links: Array<{
    id: string;
    title: string | null;
    slug: string;
    views: number;
    revenue: number;
    createdAt: string;
  }>;
  withdrawals: Array<{
    id: string;
    bankName: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  // Form states
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [balance, setBalance] = useState("");
  const [password, setPassword] = useState("");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch User details
  const { data, isLoading, error } = useQuery<UserDetailResponse>({
    queryKey: ["admin-user-detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users/${id}`);
      if (!res.ok) throw new Error("Failed to fetch user detail");
      const d = await res.json();
      
      // Initialize forms values
      setRole(d.user.role);
      setStatus(d.user.status);
      setBalance(d.user.balance.toString());

      return d;
    },
  });

  // Edit user mutation
  const editUserMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra khi lưu.");
      return data;
    },
    onSuccess: (resData) => {
      setSuccessMsg(resData.message);
      setPassword("");
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", id] });
    },
    onError: (err: any) => {
      setErrorMsg(err.message);
    },
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    const payload: any = {
      role,
      status,
      balance,
    };

    if (password) {
      payload.password = password;
    }

    editUserMutation.mutate(payload);
    setIsSubmitting(false);
  };

  if (isLoading) {
    return <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed rounded-xl p-8">
        <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
        <h3 className="font-semibold text-red-650">Lỗi khi tải chi tiết người dùng.</h3>
        <Link href="/admin/users" className="text-sm text-indigo-650 hover:underline mt-2">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Link
          href="/admin/users"
          className="p-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Chi tiết tài khoản</h2>
          <p className="text-slate-500 dark:text-slate-400">Xem và sửa đổi các quyền hạn, số dư hoặc mật khẩu của thành viên.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Forms Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="inline-flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-indigo-500" />
                Cài đặt phân quyền & Số dư
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                {successMsg && (
                  <div className="p-4 bg-green-50 border border-green-200 text-sm text-green-600 rounded-lg flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-4 bg-red-50 border border-red-200 text-sm text-red-600 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Quyền hạn (Role)</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                    >
                      <option value="USER">USER</option>
                      <option value="MODERATOR">MODERATOR</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Trạng thái (Status)</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                    >
                      <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                      <option value="BANNED">Khóa (BANNED)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold inline-flex items-center">
                      <Wallet className="h-4 w-4 mr-1 text-slate-400" />
                      Số dư ví khả dụng ($)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold inline-flex items-center">
                      <Key className="h-4 w-4 mr-1 text-slate-400" />
                      Mật khẩu mới (Bỏ trống nếu giữ nguyên)
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mật khẩu mới..."
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-650 text-white font-semibold text-sm py-3 rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Lưu thay đổi hồ sơ</span>
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* User stats widget */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tổng quan tài sản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-xs text-slate-500 uppercase">Tên đăng nhập</span>
                <span className="font-semibold">@{data.user.username}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-xs text-slate-500 uppercase">Địa chỉ Email</span>
                <span className="font-semibold text-xs">{data.user.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-xs text-slate-500 uppercase">Số tiền đang chờ duyệt</span>
                <span className="font-bold text-amber-500">{formatCurrency(data.user.pendingBalance)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-xs text-slate-500 uppercase">Tổng tiền đã rút</span>
                <span className="font-bold text-slate-700">{formatCurrency(data.user.totalWithdraw)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-xs text-slate-500 uppercase">Đăng nhập cuối</span>
                <span className="font-medium text-xs">
                  {data.user.lastLogin ? new Date(data.user.lastLogin).toLocaleString("vi-VN") : "Chưa có"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
