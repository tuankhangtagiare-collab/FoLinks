"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  Eye,
  Wallet,
  ArrowUpRight,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  Megaphone,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import Link from "next/link";

interface DashboardSummary {
  wallet: {
    balance: number;
    pendingBalance: number;
    totalEarned: number;
    totalWithdraw: number;
  };
  stats: {
    totalLinks: number;
    totalViews: number;
    totalValidViews: number;
    totalRevenue: number;
    todayViews: number;
    todayRevenue: number;
    monthViews: number;
    monthRevenue: number;
    conversionRate: number;
    totalWithdrawalAmount: number;
  };
  topLinks: Array<{
    id: string;
    title: string;
    slug: string;
    views: number;
    revenue: number;
    cpm: number;
    createdAt: string;
  }>;
  chartData: Array<{
    date: string;
    views: number;
    revenue: number;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
  }>;
}

export default function DashboardHome() {
  const { data, isLoading, error } = useQuery<DashboardSummary>({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const res = await fetch("/api/user/dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard data");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-md w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed rounded-2xl border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/10 p-8">
        <HelpCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-red-600">Đã xảy ra lỗi khi tải dữ liệu</h3>
        <p className="text-sm text-red-500 text-center max-w-sm mt-2">Vui lòng làm mới trang hoặc thử lại sau ít phút.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Chào buổi sáng!</h2>
          <p className="text-slate-500 dark:text-slate-400">Xem thống kê doanh thu và lượt truy cập của bạn hôm nay.</p>
        </div>
        <Link
          href="/dashboard/links/create"
          className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          Rút gọn Link mới
        </Link>
      </div>

      {/* System Announcements */}
      {data.announcements.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900 rounded-xl p-4 flex items-start space-x-3">
          <Megaphone className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 text-sm">Thông báo từ hệ thống:</h4>
            {data.announcements.map((item) => (
              <div key={item.id} className="mt-1 text-sm text-indigo-800 dark:text-indigo-300">
                <span className="font-medium">{item.title}</span>: {item.content}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Số dư khả dụng</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(data.wallet.balance)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Chờ duyệt: {formatCurrency(data.wallet.pendingBalance)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Doanh thu hôm nay</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.stats.todayRevenue)}</div>
            <p className="text-xs text-slate-500 mt-1">Lượt xem hôm nay: {data.stats.todayViews}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Tổng doanh thu</CardTitle>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.stats.totalRevenue)}</div>
            <p className="text-xs text-slate-500 mt-1">Tháng này: {formatCurrency(data.stats.monthRevenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Lượt truy cập (Hợp lệ)</CardTitle>
            <Eye className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.totalValidViews} <span className="text-xs font-normal text-slate-500">/ {data.stats.totalViews}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Tỷ lệ chuyển đổi: {data.stats.conversionRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Biểu đồ hiệu suất 7 ngày qua</CardTitle>
            <CardDescription>Theo dõi lượng truy cập hợp lệ và doanh thu theo ngày.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-xs text-slate-500" />
                <YAxis tickLine={false} axisLine={false} className="text-xs text-slate-500" />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Doanh thu ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Views Chart Card */}
        <Card>
          <CardHeader>
            <CardTitle>Lượt xem</CardTitle>
            <CardDescription>Số lượng click chuột hợp lệ.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-xs text-slate-500" />
                <YAxis tickLine={false} axisLine={false} className="text-xs text-slate-500" />
                <Tooltip />
                <Bar dataKey="views" fill="#818CF8" radius={[4, 4, 0, 0]} name="Lượt xem" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Links Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top 10 liên kết doanh thu cao nhất</CardTitle>
            <CardDescription>Danh sách liên kết mang lại nhiều lợi nhuận nhất cho bạn.</CardDescription>
          </div>
          <Link href="/dashboard/links" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center">
            Quản lý tất cả <ArrowUpRight className="h-4 w-4 ml-0.5" />
          </Link>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
              <tr>
                <th className="px-6 py-3 rounded-l-lg">Tiêu đề / Đường dẫn</th>
                <th className="px-6 py-3">Lượt xem</th>
                <th className="px-6 py-3">CPM trung bình</th>
                <th className="px-6 py-3 rounded-r-lg">Tổng doanh thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.topLinks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-slate-400">Bạn chưa rút gọn liên kết nào. Hãy bắt đầu tạo link ngay!</td>
                </tr>
              ) : (
                data.topLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{link.title}</div>
                      <div className="text-xs text-indigo-600 dark:text-indigo-400">go/{link.slug}</div>
                    </td>
                    <td className="px-6 py-4">{link.views}</td>
                    <td className="px-6 py-4">${link.cpm.toFixed(2)}</td>
                    <td className="px-6 py-4 font-bold text-slate-950 dark:text-white">{formatCurrency(link.revenue)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
