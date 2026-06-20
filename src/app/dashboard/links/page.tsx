"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  Filter,
  Copy,
  Check,
  Eye,
  Trash2,
  Pause,
  Play,
  Download,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface LinkData {
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
}

interface ListLinksResponse {
  links: LinkData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function LinksListPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch Links
  const { data, isLoading, error } = useQuery<ListLinksResponse>({
    queryKey: ["links-list", page, search, status, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        status,
        sortBy,
        sortOrder,
      });
      const res = await fetch(`/api/user/links?${params}`);
      if (!res.ok) throw new Error("Failed to fetch links");
      return res.json();
    },
  });

  // Pause / Resume Link Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: "ACTIVE" | "PAUSED" }) => {
      const res = await fetch(`/api/user/links/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links-list"] });
    },
  });

  // Soft Delete Link Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/user/links/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete link");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links-list"] });
    },
  });

  const getShortUrl = (slug: string) => {
    if (typeof window === "undefined") return `go/${slug}`;
    return `${window.location.origin}/go/${slug}`;
  };

  const handleCopy = (id: string, slug: string) => {
    navigator.clipboard.writeText(getShortUrl(slug));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    if (!data?.links || data.links.length === 0) return;
    const headers = "ID,Short Link,Original URL,Title,CPM,Views,Valid Views,Revenue,Status,Created At\n";
    const rows = data.links
      .map((link) => {
        return `"${link.id}","${getShortUrl(link.slug)}","${link.originalUrl}","${link.title || ""}","${link.cpm}","${link.views}","${link.validViews}","${link.revenue}","${link.status}","${link.createdAt}"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "folink_links_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản lý liên kết</h2>
          <p className="text-slate-500 dark:text-slate-400">Tìm kiếm, lọc, tạm ngưng hoặc chỉnh sửa các liên kết rút gọn.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Xuất CSV
          </button>
          <Link
            href="/dashboard/links/create"
            className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            Rút gọn Link
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm link..."
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
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="PAUSED">Tạm dừng</option>
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none w-full sm:w-auto"
            >
              <option value="createdAt">Sắp xếp: Mới nhất</option>
              <option value="views">Sắp xếp: Lượt xem</option>
              <option value="revenue">Sắp xếp: Doanh thu</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      {isLoading ? (
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
      ) : error || !data ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed rounded-2xl border-red-200 dark:border-red-900 bg-red-50/50 p-6">
          <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
          <h3 className="text-sm font-bold text-red-600">Lỗi khi tải danh sách</h3>
        </div>
      ) : data.links.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
          <LinkIcon className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold">Không tìm thấy liên kết nào</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1">Hãy rút gọn liên kết đầu tiên của bạn để chia sẻ và bắt đầu nhận tiền.</p>
          <Link href="/dashboard/links/create" className="mt-4 bg-indigo-600 text-white font-medium text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Tạo link mới
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                <tr>
                  <th className="px-6 py-3">Chi tiết liên kết</th>
                  <th className="px-6 py-3">Lượt xem</th>
                  <th className="px-6 py-3">CPM</th>
                  <th className="px-6 py-3">Doanh thu</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.links.map((link) => (
                  <tr key={link.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">{link.title || "Chưa đặt tên"}</div>
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">go/{link.slug}</div>
                      <div className="text-xs text-slate-400 truncate mt-1">{link.originalUrl}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{link.validViews} <span className="text-xs text-slate-400">/ {link.views}</span></div>
                    </td>
                    <td className="px-6 py-4">${Number(link.cpm).toFixed(2)}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{formatCurrency(link.revenue)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        link.status === "ACTIVE"
                          ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                      }`}>
                        {link.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Detail Link */}
                        <Link
                          href={`/dashboard/links/${link.id}`}
                          className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {/* Copy Link */}
                        <button
                          onClick={() => handleCopy(link.id, link.slug)}
                          className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                          title="Sao chép"
                        >
                          {copiedId === link.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                        {/* Pause/Resume Link */}
                        <button
                          onClick={() =>
                            toggleStatusMutation.mutate({
                              id: link.id,
                              newStatus: link.status === "ACTIVE" ? "PAUSED" : "ACTIVE",
                            })
                          }
                          className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                          title={link.status === "ACTIVE" ? "Tạm dừng" : "Kích hoạt"}
                        >
                          {link.status === "ACTIVE" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 text-green-500" />}
                        </button>
                        {/* Delete Link */}
                        <button
                          onClick={() => {
                            if (confirm("Bạn có chắc chắn muốn xóa liên kết này?")) {
                              deleteMutation.mutate(link.id);
                            }
                          }}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
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
const LinkIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>;
