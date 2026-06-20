"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  ShieldAlert,
  Trash2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertCircle,
  Eye,
} from "lucide-react";
import Link from "next/link";

interface UserListItem {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  role: "USER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";
  status: "ACTIVE" | "PENDING" | "BANNED";
  balance: number;
  totalEarned: number;
  totalWithdraw: number;
  linksCount: number;
  createdAt: string;
  lastLogin: string | null;
  country: string | null;
}

interface UsersListResponse {
  users: UserListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  // Load users list
  const { data, isLoading, error } = useQuery<UsersListResponse>({
    queryKey: ["admin-users-list", page, search, role, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        role,
        status,
      });
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  // Ban/Unban user mutation
  const toggleBanMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: "ACTIVE" | "BANNED" }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update user status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users-list"] });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users-list"] });
    },
  });

  const handleExportCSV = () => {
    if (!data?.users || data.users.length === 0) return;
    const headers = "ID,Username,Email,Role,Status,Balance,Total Earned,Links Count,Created At,Last Login\n";
    const rows = data.users
      .map((u) => {
        return `"${u.id}","${u.username}","${u.email}","${u.role}","${u.status}","${u.balance}","${u.totalEarned}","${u.linksCount}","${u.createdAt}","${u.lastLogin || ""}"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "folink_admin_users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản lý người dùng</h2>
          <p className="text-slate-500 dark:text-slate-400">Xem danh sách, chỉnh sửa ví, thay đổi quyền hạn hoặc khóa tài khoản.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Xuất CSV
        </button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm username, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
              >
                <option value="ALL">Mọi quyền hạn</option>
                <option value="USER">User (Thường)</option>
                <option value="MODERATOR">Moderator</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none w-full sm:w-auto"
            >
              <option value="ALL">Mọi trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="BANNED">Đã khóa</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      {isLoading ? (
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
      ) : error || !data ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed rounded-xl p-8">
          <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
          <h3 className="text-sm font-semibold text-red-650">Lỗi hệ thống khi tải danh sách người dùng.</h3>
        </div>
      ) : data.users.length === 0 ? (
        <div className="text-center py-12 text-slate-500">Không tìm thấy người dùng phù hợp.</div>
      ) : (
        <div className="space-y-4">
          <Card className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                <tr>
                  <th className="px-6 py-3 rounded-l-lg">Người dùng</th>
                  <th className="px-6 py-3">Quyền hạn</th>
                  <th className="px-6 py-3">Ví khả dụng</th>
                  <th className="px-6 py-3">Liên kết</th>
                  <th className="px-6 py-3 font-medium">Trạng thái</th>
                  <th className="px-6 py-3 text-right rounded-r-lg">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{u.displayName || u.username}</div>
                      <div className="text-xs text-slate-500 font-mono">@{u.username} | {u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        u.role === "SUPER_ADMIN" ? "bg-red-50 text-red-700 dark:bg-red-950/20" :
                        u.role === "ADMIN" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20" :
                        u.role === "MODERATOR" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20" : "bg-slate-55 text-slate-700"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(u.balance)}
                    </td>
                    <td className="px-6 py-4">{u.linksCount} link</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        u.status === "ACTIVE" ? "bg-green-50 text-green-700 dark:bg-green-950/30" : "bg-red-50 text-red-700"
                      }`}>
                        {u.status === "ACTIVE" ? "Hoạt động" : "Đã khóa"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Details edit panel trigger link */}
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {/* Toggle lock */}
                        <button
                          onClick={() =>
                            toggleBanMutation.mutate({
                              id: u.id,
                              newStatus: u.status === "ACTIVE" ? "BANNED" : "ACTIVE",
                            })
                          }
                          className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                          title={u.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa"}
                        >
                          {u.status === "ACTIVE" ? <UserX className="h-4 w-4 text-red-500" /> : <UserCheck className="h-4 w-4 text-green-500" />}
                        </button>
                        {/* Delete User */}
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn XÓA VĨNH VIỄN tài khoản ${u.username}?`)) {
                              deleteUserMutation.mutate(u.id);
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
                          title="Xóa vĩnh viễn"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

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
