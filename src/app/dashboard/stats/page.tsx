"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  Eye,
  Percent,
  Sparkles,
  BarChart3,
  AlertCircle,
  HelpCircle,
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

interface StatsResponse {
  summary: {
    totalViews: number;
    validViews: number;
    invalidViews: number;
    fraudViews: number;
    revenue: number;
    avgCpm: number;
  };
  chartData: Array<{
    name: string;
    views: number;
    validViews: number;
    revenue: number;
  }>;
}

export default function StatisticsPage() {
  const [period, setPeriod] = useState("7days");

  const { data, isLoading, error } = useQuery<StatsResponse>({
    queryKey: ["statistics-charts", period],
    queryFn: async () => {
      const res = await fetch(`/api/user/stats?period=${period}`);
      if (!res.ok) throw new Error("Failed to load statistics");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Thống kê chi tiết</h2>
          <p className="text-slate-500 dark:text-slate-400">Xem phân tích doanh thu, CPM và chất lượng lượng truy cập của bạn.</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
          >
            <option value="7days">7 ngày gần nhất</option>
            <option value="30days">30 ngày gần nhất</option>
            <option value="thisMonth">Tháng này</option>
            <option value="thisYear">Năm nay</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
        </div>
      ) : error || !data ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed rounded-2xl border-red-200 bg-red-50/50 p-6">
          <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
          <h3 className="text-sm font-bold text-red-600">Lỗi khi tải dữ liệu thống kê</h3>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">{data.summary.totalViews}</div>
                <span className="text-xs text-slate-500 uppercase">Tổng lượt Click</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {data.summary.validViews}
                </div>
                <span className="text-xs text-slate-500 uppercase">Lượt Click Hợp Lệ</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-red-500">
                  {data.summary.invalidViews + data.summary.fraudViews}
                </div>
                <span className="text-xs text-slate-500 uppercase">Lượt Click Bị Loại bỏ</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(data.summary.revenue)}
                </div>
                <span className="text-xs text-slate-500 uppercase">Doanh thu đạt được</span>
              </CardContent>
            </Card>
          </div>

          {/* Average CPM banner */}
          <Card className="bg-slate-50 dark:bg-slate-900 border">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Percent className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">CPM Trung Bình của bạn</h4>
                  <p className="text-xs text-slate-500">Được tính dựa trên doanh thu của các lượt click hợp lệ.</p>
                </div>
              </div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                ${data.summary.avgCpm.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ doanh thu lũy kế ($)</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenueStats" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-xs text-slate-500" />
                  <YAxis tickLine={false} axisLine={false} className="text-xs text-slate-500" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4F46E5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenueStats)"
                    name="Doanh thu ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Click Volume Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ phân tích lượt xem</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-xs text-slate-500" />
                  <YAxis tickLine={false} axisLine={false} className="text-xs text-slate-500" />
                  <Tooltip />
                  <Bar dataKey="views" fill="#D1D5DB" name="Tổng click" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="validViews" fill="#4F46E5" name="Click hợp lệ" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
