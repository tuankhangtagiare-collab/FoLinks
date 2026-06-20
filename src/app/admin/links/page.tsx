"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  Filter,
  Eye,
  Trash2,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Link as LinkIcon,
} from "lucide-react";

interface AdminLinkItem {
  id: string;
  slug: string;
  originalUrl: string;
  title: string | null;
  cpm: number;
  views: number;
  validViews: number;
  revenue: number;
  status: "ACTIVE" | "PAUSED" | "DELETED";
  createdAt: string;
  user: {
    username: string;
    email: string;
  };
}

interface AdminLinksResponse {
  links: AdminLinkItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function AdminLinksPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery<AdminLinksResponse>({
    queryKey: ["admin-links-list", page, search, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        status,
      });
      const res = await fetch(`/api/admin/links?${params}`);
      if (!res.ok) throw new Error("Failed to fetch links");
      return res.json();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      const res = await fetch(`/api/user/links/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-links-list"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/user/links/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete link");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-links-list"] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Quản lý Liên kết hệ thống</h2>
        <p className="text-slate-500 dark:text-slate-400">Xem, tạm ngưng hoặc gỡ bỏ các liên kết vi phạm chính sách của Folink.</p>
      </div>

      {/* Filter panel */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tiêu đề, slug, thành viên..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none w-full sm:w-auto"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="PAUSED">Tạm ngưng</option>
          </select>
        </CardContent>
      </Card>

      {/* Grid Table */}
      {isLoading ? (
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
      ) : error || !data ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed rounded-xl p-8">
          <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
          <h3 className="text-sm font-semibold text-red-650">Lỗi hệ thống khi tải danh sách liên kết.</h3>
        </div>
      ) : data.links.length === 0 ? (
        <div className="text-center py-12 text-slate-500">Không tìm thấy liên kết phù hợp.</div>
      ) : (
        <div className="space-y-4">
          <Card className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                <tr>
                  <th className="px-6 py-3">Chi tiết liên kết</th>
                  <th className="px-6 py-3">Người sở hữu</th>
                  <th className="px-6 py-3">Lượt click</th>
                  <th className="px-6 py-3">Doanh thu</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.links.map((link) => (
                  <tr key={link.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">{link.title || "Chưa đặt tên"}</div>
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">go/{link.slug}</div>
                      <div className="text-xs text-slate-400 truncate mt-1">{link.originalUrl}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">@{link.user.username}</div>
                      <div className="text-xs text-slate-500 truncate">{link.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{link.validViews} <span className="text-xs text-slate-400">/ {link.views}</span></div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(link.revenue)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        link.status === "ACTIVE" ? "bg-green-50 text-green-700 dark:bg-green-950/30" : "bg-amber-50 text-amber-700"
                      }`}>
                        {link.status === "ACTIVE" ? "Hoạt động" : "Tạm ngưng"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Toggle active / suspend link status */}
                        <button
                          onClick={() =>
                            toggleMutation.mutate({
                              id: link.id,
                              newStatus: link.status === "ACTIVE" ? "PAUSED" : "ACTIVE",
                            })
                          }
                          className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                          title={link.status === "ACTIVE" ? "Tạm ngưng" : "Kích hoạt"}
                        >
                          {link.status === "ACTIVE" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 text-green-500" />}
                        </button>
                        {/* Delete Link status */}
                        <button
                          onClick={() => {
                            if (confirm("Xóa liên kết này khỏi hệ thống?")) {
                              deleteMutation.mutate(link.id);
                            }
                          }}
                          className="p-1.5 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
                          title="Xóa link"
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

          {/* Pagination panel */}
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
