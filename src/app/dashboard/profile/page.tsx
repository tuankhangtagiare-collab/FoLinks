"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, RefreshCw, User, Mail, Globe, Clock, Camera } from "lucide-react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [language, setLanguage] = useState("vi");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Initialize values when session is loaded
  React.useEffect(() => {
    if (session?.user) {
      setDisplayName(session.user.name || "");
      setUsername((session.user as any).username || "");
      setAvatar((session.user as any).avatar || "");
      setTimezone((session.user as any).timezone || "UTC");
      setLanguage((session.user as any).language || "vi");
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          username,
          avatar,
          timezone,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể cập nhật thông tin.");

      // Update Session
      await update({
        name: displayName,
        username,
        avatar,
        timezone,
        language,
      });

      setSuccessMsg(data.message);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Hồ sơ cá nhân</h2>
        <p className="text-slate-500 dark:text-slate-400">Xem và cập nhật thông tin hiển thị cơ bản của bạn.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin tài khoản</CardTitle>
          <CardDescription>Cập nhật thông tin định danh hiển thị của bạn trên hệ thống.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* Avatar block */}
            <div className="flex flex-col items-center justify-center p-4 border border-dashed rounded-xl bg-slate-50/50 dark:bg-slate-800/10 space-y-3">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl">
                  {displayName?.[0]?.toUpperCase() || "U"}
                </div>
                <button type="button" className="absolute bottom-0 right-0 bg-white border rounded-full p-1.5 shadow-sm text-slate-600 hover:bg-slate-50">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500">Hỗ trợ định dạng JPG, PNG. Dung lượng tối đa 2MB.</p>
            </div>

            {/* Email (Readonly) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold inline-flex items-center">
                <Mail className="h-4 w-4 mr-1 text-slate-400" />
                Địa chỉ Email (Không thể thay đổi)
              </label>
              <input
                type="email"
                readOnly
                value={session?.user?.email || ""}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-sm text-slate-500 focus:outline-none cursor-not-allowed"
              />
            </div>

            {/* Username & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold inline-flex items-center">
                  <User className="h-4 w-4 mr-1 text-slate-400" />
                  Tên đăng nhập (Username)
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Tên hiển thị (Display Name)</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Country & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold inline-flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-slate-400" />
                  Múi giờ
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                >
                  <option value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</option>
                  <option value="UTC">Giờ chuẩn Quốc tế (UTC)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold inline-flex items-center">
                  <Globe className="h-4 w-4 mr-1 text-slate-400" />
                  Ngôn ngữ hiển thị
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
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
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                <span>Lưu thay đổi</span>
              )}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
