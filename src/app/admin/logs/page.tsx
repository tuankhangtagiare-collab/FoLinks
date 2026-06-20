"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
} from "lucide-react";

interface LogItem {
  id: string;
  username: string;
  action: string;
  ip?: string;
  device?: string;
  browser?: string;
  url?: string;
  method?: string;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: string;
}

interface LogsResponse {
  logs: LogItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function AdminLogsPage() {
  const [logType, setLogType] = useState("AUDIT"); // AUDIT or ACTIVITY
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery<LogsResponse>({
    queryKey: ["admin-logs-list", page, logType],
    queryFn: async () => {
      const res = await fetch(`/api/admin/logs?page=${page}&logType=${logType}`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Nhật ký hoạt động hệ thống</h2>
          <p className="text-slate-500 dark:text-slate-400">Xem vết kiểm toán (Audit Trail) của Admin hoặc nhật ký hoạt động (Activity Logs) của thành viên.</p>
        </div>

        <select
          value={logType}
          onChange={(e) => {
            setLogType(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
        >
          <option value="AUDIT">Nhật ký Audit Admin</option>
          <option value="ACTIVITY">Nhật ký Hoạt động Users</option>
        </select>
      </div>

      {isLoading ? (
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
      ) : error || !data ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed rounded-xl p-8">
          <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
          <h3 className="text-sm font-semibold text-red-650">Lỗi hệ thống khi tải nhật ký.</h3>
        </div>
      ) : data.logs.length === 0 ? (
        <div className="text-center py-12 text-slate-500">Chưa có nhật ký nào được ghi nhận.</div>
      ) : (
        <div className="space-y-4">
          <Card className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                <tr>
                  <th className="px-6 py-3 rounded-l-lg">Thời gian</th>
                  <th className="px-6 py-3">Người thực hiện</th>
                  <th className="px-6 py-3">Hành động</th>
                  {logType === "AUDIT" ? (
                    <>
                      <th className="px-6 py-3">Giá trị cũ</th>
                      <th className="px-6 py-3 rounded-r-lg">Giá trị mới</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3">Địa chỉ IP</th>
                      <th className="px-6 py-3">Thiết bị / Browser</th>
                      <th className="px-6 py-3 rounded-r-lg">URL / Method</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {new Date(log.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 font-semibold">@{log.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-indigo-650 dark:text-indigo-400">
                      {log.action}
                    </td>
                    {logType === "AUDIT" ? (
                      <>
                        <td className="px-6 py-4 text-xs font-mono max-w-xs truncate" title={log.oldValue || ""}>
                          {log.oldValue || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono max-w-xs truncate" title={log.newValue || ""}>
                          {log.newValue || "N/A"}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 font-mono text-xs">{log.ip}</td>
                        <td className="px-6 py-4 text-xs">
                          {log.device} / {log.browser}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 mr-1.5">[{log.method}]</span>
                          {log.url}
                        </td>
                      </>
                    )}
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
