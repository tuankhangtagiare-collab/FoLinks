"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  content: string;
  read: boolean;
  type: "SYSTEM" | "PAYMENT" | "SECURITY" | "INFO";
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<NotificationsResponse>({
    queryKey: ["notifications-list"],
    queryFn: async () => {
      const res = await fetch("/api/user/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
  });

  // Mark Read Mutation
  const markReadMutation = useMutation({
    mutationFn: async ({ id, readAll }: { id?: string; readAll?: boolean }) => {
      const res = await fetch("/api/user/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, readAll }),
      });
      if (!res.ok) throw new Error("Failed to mark notifications");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-list"] });
    },
  });

  // Delete Notification Mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ id, clearAll }: { id?: string; clearAll?: boolean }) => {
      const params = new URLSearchParams();
      if (id) params.append("id", id);
      if (clearAll) params.append("clearAll", "true");

      const res = await fetch(`/api/user/notifications?${params}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to clear notifications");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-list"] });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "PAYMENT":
        return "💰";
      case "SECURITY":
        return "🛡️";
      case "SYSTEM":
        return "📢";
      default:
        return "🔔";
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Hộp thông báo</h2>
          <p className="text-slate-500 dark:text-slate-400">Theo dõi thông tin thanh toán, cập nhật bảo mật và thông tin từ hệ thống.</p>
        </div>

        {data && data.notifications.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => markReadMutation.mutate({ readAll: true })}
              className="inline-flex items-center justify-center bg-white dark:bg-slate-900 border text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1.5 text-green-600" />
              Đọc tất cả
            </button>
            <button
              onClick={() => deleteMutation.mutate({ clearAll: true })}
              className="inline-flex items-center justify-center bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Xóa tất cả
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      ) : error || !data ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed rounded-xl p-8">
          <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
          <h3 className="font-semibold text-red-600">Lỗi khi tải thông báo</h3>
        </div>
      ) : data.notifications.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
          <Bell className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold">Hộp thông báo trống</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1">Bạn hiện tại chưa có thông báo nào từ hệ thống.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.notifications.map((item) => (
            <Card
              key={item.id}
              className={`transition-colors ${
                !item.read ? "bg-indigo-50/30 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900" : ""
              }`}
            >
              <CardContent className="p-4 flex items-start space-x-3">
                <div className="text-xl shrink-0 mt-0.5">{getNotificationIcon(item.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className={`text-sm font-semibold truncate ${!item.read ? "text-indigo-950 dark:text-indigo-200" : ""}`}>
                      {item.title}
                    </h4>
                    <span className="text-xs text-slate-400 shrink-0">
                      {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{item.content}</p>
                </div>
                <div className="flex items-center space-x-1.5 shrink-0 self-center">
                  {!item.read && (
                    <button
                      onClick={() => markReadMutation.mutate({ id: item.id })}
                      className="p-1 text-slate-400 hover:text-green-600 rounded"
                      title="Đánh dấu đã đọc"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteMutation.mutate({ id: item.id })}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                    title="Xóa thông báo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
