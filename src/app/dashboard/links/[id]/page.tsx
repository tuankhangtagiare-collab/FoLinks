"use client";

import React, { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Globe,
  Monitor,
  Compass,
  Link as LinkIcon,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface LinkDetailData {
  link: {
    id: string;
    slug: string;
    originalUrl: string;
    title: string | null;
    description: string | null;
    cpm: number;
    views: number;
    validViews: number;
    revenue: number;
    status: string;
    createdAt: string;
  };
  stats: {
    countries: Array<{ country: string; views: number; revenue: number }>;
    devices: Array<{ device: string; views: number }>;
    browsers: Array<{ browser: string; views: number }>;
    referrers: Array<{ referrer: string; views: number }>;
  };
}

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function LinkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [copied, setCopied] = React.useState(false);

  const { data, isLoading, error } = useQuery<LinkDetailData>({
    queryKey: ["link-detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/user/links/${id}`);
      if (!res.ok) throw new Error("Failed to fetch link details");
      return res.json();
    },
  });

  const getShortUrl = () => {
    if (!data) return "";
    if (typeof window === "undefined") return `go/${data.link.slug}`;
    return `${window.location.origin}/go/${data.link.slug}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getShortUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed rounded-xl p-8">
        <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
        <h3 className="font-semibold text-red-600">Lỗi khi tải chi tiết liên kết</h3>
        <Link href="/dashboard/links" className="text-sm text-indigo-600 hover:underline mt-2">
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
          href="/dashboard/links"
          className="p-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{data.link.title || "Chi tiết liên kết"}</h2>
          <p className="text-slate-500 dark:text-slate-400">Xem nguồn gốc lượng truy cập và doanh thu của liên kết này.</p>
        </div>
      </div>

      {/* Main Details and QR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* URL Information */}
        <Card className="md:col-span-2 space-y-4">
          <CardHeader>
            <CardTitle>Thông tin liên kết</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Liên kết rút gọn</label>
              <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border mt-1">
                <span className="text-sm font-semibold text-indigo-600 truncate flex-1">{getShortUrl()}</span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 bg-white dark:bg-slate-900 border hover:bg-slate-50 rounded-md transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Liên kết gốc</label>
              <div className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate mt-1 block max-w-full">
                <a href={data.link.originalUrl} target="_blank" rel="noreferrer" className="hover:underline text-indigo-500 inline-flex items-center">
                  {data.link.originalUrl}
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-xs text-slate-500">Mô tả</span>
                <p className="text-sm font-semibold">{data.link.description || "Không có mô tả"}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium inline-flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  Ngày tạo
                </span>
                <p className="text-sm font-semibold">{new Date(data.link.createdAt).toLocaleDateString("vi-VN")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code and CPM */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-center">QR Code & CPM</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-white p-2 rounded-lg border">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(getShortUrl())}`}
                alt="QR Code"
                className="h-28 w-28 object-contain"
              />
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                ${data.link.cpm.toFixed(2)}
              </div>
              <span className="text-xs text-slate-500 uppercase font-semibold">CPM liên kết</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aggregate stats view */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">{data.link.views}</div>
            <span className="text-xs text-slate-500 uppercase">Tổng lượt Click</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{data.link.validViews}</div>
            <span className="text-xs text-slate-500 uppercase">Lượt Click Hợp Lệ</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-red-500">{data.link.views - data.link.validViews}</div>
            <span className="text-xs text-slate-500 uppercase">Lượt Click Không Hợp Lệ</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(data.link.revenue)}</div>
            <span className="text-xs text-slate-500 uppercase">Tổng doanh thu</span>
          </CardContent>
        </Card>
      </div>

      {/* Detailed statistics breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device breakdown chart */}
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center">
              <Monitor className="h-5 w-5 mr-2 text-indigo-500" />
              Thiết bị truy cập
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {data.stats.devices.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Chưa có dữ liệu thiết bị.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.stats.devices}
                    dataKey="views"
                    nameKey="device"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {data.stats.devices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Country Statistics Table */}
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center">
              <Globe className="h-5 w-5 mr-2 text-indigo-500" />
              Lượng truy cập theo Quốc gia
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-64">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b font-medium text-slate-500">
                  <th className="pb-2">Quốc gia</th>
                  <th className="pb-2">Lượt Click</th>
                  <th className="pb-2 text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.stats.countries.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-slate-400">Không có dữ liệu quốc gia.</td>
                  </tr>
                ) : (
                  data.stats.countries.map((c, i) => (
                    <tr key={i} className="py-2">
                      <td className="py-2.5 font-medium">{c.country}</td>
                      <td className="py-2.5">{c.views}</td>
                      <td className="py-2.5 text-right font-bold text-indigo-600">{formatCurrency(c.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
