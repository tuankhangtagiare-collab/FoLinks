"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Megaphone,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  status: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export default function AdminAnnouncementsPage() {
  const queryClient = useQueryClient();

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load announcements
  const { data: list, isLoading } = useQuery<Announcement[]>({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const res = await fetch("/api/admin/announcements");
      if (!res.ok) throw new Error("Failed to fetch announcements");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create announcement");
      return data;
    },
    onSuccess: (data) => {
      setSuccessMsg(data.message);
      setTitle("");
      setContent("");
      setStartTime("");
      setEndTime("");
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
    },
    onError: (err: any) => {
      setErrorMsg(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    createMutation.mutate({
      title,
      content,
      status,
      startTime,
      endTime,
    });
    setIsSubmitting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Create form */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Thông báo hệ thống</h2>
          <p className="text-slate-500 dark:text-slate-400">Tạo tin nhắn thông báo hiển thị nổi bật trên toàn website cho người dùng.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center">
              <Plus className="h-5 w-5 mr-1.5 text-indigo-500" />
              Tạo thông báo mới
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="space-y-2">
                <label className="text-sm font-semibold">Tiêu đề thông báo</label>
                <input
                  type="text"
                  required
                  placeholder="Bảo trì hệ thống, điều chỉnh CPM..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Nội dung thông báo</label>
                <textarea
                  required
                  placeholder="Viết nội dung thông báo hiển thị cho thành viên..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none h-24"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Ngày bắt đầu</label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Ngày kết thúc</label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Tạo thông báo</span>
              </button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* List sidebar */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold">Danh sách thông báo</h3>
          <p className="text-xs text-slate-500 mt-0.5">Mọi thông báo đã tạo trên site.</p>
        </div>

        {isLoading ? (
          <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
        ) : !list || list.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">Chưa có thông báo nào được tạo.</div>
        ) : (
          <div className="space-y-4">
            {list.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      item.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-700"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-650 dark:text-slate-400">{item.content}</p>
                  <div className="text-[10px] text-slate-400 flex items-center space-x-2 pt-2 border-t">
                    <Calendar className="h-3 w-3 mr-0.5" />
                    <span>Hạn: {new Date(item.endTime).toLocaleDateString("vi-VN")}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
