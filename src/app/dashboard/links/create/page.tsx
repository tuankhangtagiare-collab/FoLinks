"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateLinkSchema } from "@/lib/validation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, QrCode, Share2, Sparkles, RefreshCw } from "lucide-react";
import { z } from "zod";

type FormValues = z.infer<typeof CreateLinkSchema>;

export default function CreateLinkPage() {
  const [createdLink, setCreatedLink] = useState<{ slug: string; originalUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(CreateLinkSchema),
    defaultValues: {
      originalUrl: "",
      slug: "",
      title: "",
      description: "",
      password: "",
      targetCountry: "",
      targetDevice: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/user/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra khi tạo link.");
      }

      setCreatedLink(data.link);
      reset();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getShortUrl = () => {
    if (!createdLink) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/go/${createdLink.slug}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getShortUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Rút gọn liên kết kiếm tiền</h2>
        <p className="text-slate-500 dark:text-slate-400">Rút gọn đường dẫn của bạn và bắt đầu kiếm thu nhập từ mỗi lượt truy cập.</p>
      </div>

      {!createdLink ? (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin liên kết</CardTitle>
            <CardDescription>Điền đường dẫn gốc và thiết lập các tùy chọn nâng cao.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900 text-sm text-red-600 dark:text-red-400 rounded-lg">
                  {errorMsg}
                </div>
              )}

              {/* Original URL */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">Đường dẫn gốc (URL)</label>
                <input
                  type="url"
                  placeholder="https://example.com/very-long-path"
                  {...register("originalUrl")}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                {errors.originalUrl && <p className="text-xs text-red-500 mt-1">{errors.originalUrl.message}</p>}
              </div>

              {/* Title & Custom Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Tiêu đề (Tùy chọn)</label>
                  <input
                    type="text"
                    placeholder="Tên gợi nhớ"
                    {...register("title")}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Đường dẫn tùy chỉnh (Slug)</label>
                  <input
                    type="text"
                    placeholder="my-custom-link"
                    {...register("slug")}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
                </div>
              </div>

              {/* Options details */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">Mô tả ngắn</label>
                <textarea
                  placeholder="Mô tả về nội dung liên kết này"
                  {...register("description")}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none h-20 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Mật khẩu bảo vệ (Tùy chọn)</label>
                <input
                  type="password"
                  placeholder="Mật khẩu truy cập link"
                  {...register("password")}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-3 rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Rút gọn link ngay</span>
                  </>
                )}
              </button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-indigo-200 dark:border-indigo-950">
          <CardHeader>
            <CardTitle className="text-indigo-600 dark:text-indigo-400">Rút gọn liên kết thành công!</CardTitle>
            <CardDescription>Đường dẫn rút gọn của bạn đã sẵn sàng chia sẻ.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Display Short URL */}
            <div className="space-y-2">
              <label className="text-xs text-slate-500 font-semibold uppercase">Đường dẫn rút gọn</label>
              <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-850 p-1 rounded-lg border">
                <input
                  type="text"
                  readOnly
                  value={getShortUrl()}
                  className="flex-1 bg-transparent border-none text-sm font-semibold px-3 py-2 text-indigo-600 focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="p-2 bg-white dark:bg-slate-800 border hover:bg-slate-50 rounded-md transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* QR Code and Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border rounded-xl bg-slate-50/50 dark:bg-slate-800/10">
              <div className="bg-white p-3 rounded-lg border shrink-0">
                {/* QR Code API fallback */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(getShortUrl())}`}
                  alt="QR Code"
                  className="h-32 w-32 object-contain"
                />
              </div>
              <div className="space-y-3 text-center sm:text-left">
                <h4 className="font-semibold text-sm">QR Code độc quyền của bạn</h4>
                <p className="text-xs text-slate-500">In hoặc chia sẻ mã QR này để người dùng quét trực tiếp từ thiết bị di động.</p>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <a
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getShortUrl())}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center bg-white dark:bg-slate-800 border px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    <QrCode className="h-3.5 w-3.5 mr-1.5" />
                    Tải QR Code
                  </a>
                  <button
                    onClick={() => setCreatedLink(null)}
                    className="inline-flex items-center justify-center bg-indigo-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Tạo link khác
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
