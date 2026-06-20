"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Users2,
  Copy,
  Check,
  Gift,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface Referee {
  id: string;
  username: string;
  createdAt: string;
  commission: number;
}

interface ReferralResponse {
  referralCode: string;
  referralPercent: number;
  stats: {
    totalReferrals: number;
    totalCommissions: number;
    todayCommissions: number;
    monthCommissions: number;
  };
  referees: Referee[];
}

export default function ReferralPage() {
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = useQuery<ReferralResponse>({
    queryKey: ["referral-details"],
    queryFn: async () => {
      const res = await fetch("/api/user/referral");
      if (!res.ok) throw new Error("Failed to load referral details");
      return res.json();
    },
  });

  const getReferralLink = () => {
    if (!data) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/auth/register?ref=${data.referralCode}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getReferralLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Chương trình giới thiệu (Referral)</h2>
        <p className="text-slate-500 dark:text-slate-400">Mời bạn bè tham gia Folink và nhận trọn đời hoa hồng từ doanh thu của họ.</p>
      </div>

      {isLoading ? (
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
      ) : error || !data ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed rounded-xl p-8">
          <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
          <h3 className="font-semibold text-red-600">Lỗi khi tải thông tin giới thiệu</h3>
        </div>
      ) : (
        <>
          {/* Banner Referral Program info */}
          <div className="bg-indigo-600 text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-2">
              <h3 className="text-xl font-bold inline-flex items-center">
                <Gift className="h-6 w-6 mr-2 animate-bounce" />
                Nhận ngay {data.referralPercent}% hoa hồng trọn đời!
              </h3>
              <p className="text-sm text-indigo-100 max-w-xl">
                Sao chép liên kết giới thiệu độc quyền của bạn dưới đây, chia sẻ trên mạng xã hội, diễn đàn hoặc blog. Khi có người đăng ký, bạn nhận ngay phần trăm hoa hồng từ mỗi click hợp lệ của họ.
              </p>
            </div>

            {/* Quick Copy Link Box */}
            <div className="w-full md:w-80 shrink-0 bg-white/10 p-2.5 rounded-xl border border-white/20">
              <span className="text-xs text-indigo-200 font-semibold uppercase block mb-1">Mã giới thiệu của bạn</span>
              <div className="flex items-center space-x-2 bg-white text-slate-900 p-1.5 rounded-lg">
                <input
                  type="text"
                  readOnly
                  value={getReferralLink()}
                  className="flex-1 bg-transparent border-none text-xs font-semibold px-2 text-indigo-600 focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="p-1.5 bg-indigo-50 border hover:bg-indigo-100 rounded-md transition-colors shrink-0"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-indigo-600" />}
                </button>
              </div>
            </div>
          </div>

          {/* Referral Stats widgets */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">{data.stats.totalReferrals}</div>
                <span className="text-xs text-slate-500 uppercase">Tổng số người mời</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(data.stats.totalCommissions)}
                </div>
                <span className="text-xs text-slate-500 uppercase">Tổng hoa hồng nhận</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(data.stats.todayCommissions)}
                </div>
                <span className="text-xs text-slate-500 uppercase">Hoa hồng hôm nay</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(data.stats.monthCommissions)}
                </div>
                <span className="text-xs text-slate-500 uppercase">Hoa hồng tháng này</span>
              </CardContent>
            </Card>
          </div>

          {/* Referred users list */}
          <Card>
            <CardHeader>
              <CardTitle className="inline-flex items-center">
                <Users2 className="h-5 w-5 mr-2 text-indigo-500" />
                Danh sách người được giới thiệu
              </CardTitle>
              <CardDescription>Thống kê chi tiết tài khoản đăng ký qua mã giới thiệu của bạn.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                  <tr>
                    <th className="px-6 py-3 rounded-l-lg">Tên đăng nhập</th>
                    <th className="px-6 py-3">Ngày tham gia</th>
                    <th className="px-6 py-3 rounded-r-lg text-right">Hoa hồng tích lũy thu được</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.referees.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-slate-400">Bạn chưa có thành viên giới thiệu nào. Hãy chia sẻ đường dẫn để mời bạn bè ngay!</td>
                    </tr>
                  ) : (
                    data.referees.map((ref) => (
                      <tr key={ref.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{ref.username}</td>
                        <td className="px-6 py-4">{new Date(ref.createdAt).toLocaleDateString("vi-VN")}</td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(ref.commission)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
