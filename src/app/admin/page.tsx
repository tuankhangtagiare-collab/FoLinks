"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  Link2,
  Eye,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Shield,
  Activity,
  Globe,
  Monitor,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Link from "next/link";

interface AdminSummary {
  cards: {
    totalUsers: number;
    onlineUsers: number;
    totalLinks: number;
    todayLinks: number;
    totalVisits: number;
    todayVisits: number;
    monthVisits: number;
    totalPaid: number;
    totalPending: number;
  };
  charts: {
    performance: Array<{
      name: string;
      views: number;
      newUsers: number;
      withdrawals: number;
    }>;
    countries: Array<{ name: string; value: number }>;
    devices: Array<{ name: string; value: number }>;
    browsers: Array<{ name: string; value: number }>;
  };
}

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function AdminDashboardHome() {
  const { data, isLoading, error } = useQuery<AdminSummary>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to load admin stats");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-md w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed rounded-xl p-8">
        <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
        <h3 className="font-semibold text-red-600">Đã xảy ra lỗi khi tải thống kê quản trị.</h3>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight inline-flex items-center">
          <Shield className="h-6 w-6 text-indigo-500 mr-2" />
          Hệ thống Quản trị Folink
        </h2>
        <p className="text-slate-500 dark:text-slate-400">Xem tổng quan hoạt động của toàn bộ thành viên hệ thống.</p>
      </div>

      {/* Cards widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Thành viên</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.cards.totalUsers}</div>
            <p className="text-xs text-slate-500 mt-1">Đang online (15p): {data.cards.onlineUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Liên kết (Links)</CardTitle>
            <Link2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.cards.totalLinks}</div>
            <p className="text-xs text-slate-500 mt-1">Tạo hôm nay: {data.cards.todayLinks}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Lượt vượt Click</CardTitle>
            <Eye className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.cards.totalVisits}</div>
            <p className="text-xs text-slate-500 mt-1">Hôm nay: {data.cards.todayVisits} | Tháng này: {data.cards.monthVisits}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Tiền chờ duyệt</CardTitle>
            <Wallet className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(data.cards.totalPending)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Đã chi trả: {formatCurrency(data.cards.totalPaid)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Hiệu năng hệ thống (7 ngày gần nhất)</CardTitle>
            <CardDescription>Số lượng click và người dùng đăng ký mới.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViewsAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-xs text-slate-500" />
                <YAxis tickLine={false} axisLine={false} className="text-xs text-slate-500" />
                <Tooltip />
                <Area type="monotone" dataKey="views" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorViewsAdmin)" name="Lượt click" />
                <Area type="monotone" dataKey="newUsers" stroke="#10B981" strokeWidth={2} name="Thành viên mới" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device breakdown Pie chart */}
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center">
              <Monitor className="h-5 w-5 mr-2 text-indigo-500" />
              Thiết bị truy cập
            </CardTitle>
            <CardDescription>Phân bố tỷ lệ lượt Click chuột.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            {data.charts.devices.length === 0 ? (
              <span className="text-slate-400 text-sm">Chưa có dữ liệu.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.charts.devices}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label
                  >
                    {data.charts.devices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Geolocation top Countries table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center">
              <Globe className="h-5 w-5 mr-2 text-indigo-500" />
              Lượng click theo Quốc gia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b font-medium text-slate-500">
                  <th className="pb-2">Tên quốc gia</th>
                  <th className="pb-2 text-right">Tổng Click</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.charts.countries.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center py-6 text-slate-400">Không có dữ liệu.</td>
                  </tr>
                ) : (
                  data.charts.countries.map((c, i) => (
                    <tr key={i} className="py-2.5">
                      <td className="py-2.5 font-medium">{c.name}</td>
                      <td className="py-2.5 text-right font-bold text-indigo-600">{c.value}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Browser breakdown list */}
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center">
              <Activity className="h-5 w-5 mr-2 text-indigo-500" />
              Trình duyệt phổ biến
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b font-medium text-slate-500">
                  <th className="pb-2">Tên trình duyệt</th>
                  <th className="pb-2 text-right">Lượt dùng</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.charts.browsers.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center py-6 text-slate-400">Không có dữ liệu.</td>
                  </tr>
                ) : (
                  data.charts.browsers.map((b, i) => (
                    <tr key={i} className="py-2.5">
                      <td className="py-2.5 font-medium">{b.name}</td>
                      <td className="py-2.5 text-right font-bold text-indigo-600">{b.value}</td>
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
