"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Save,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Sliders,
  DollarSign,
  Share2,
  Lock,
  Globe,
  Settings as SettingsIcon,
} from "lucide-react";

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");

  // Site configurations fields
  const [websiteName, setWebsiteName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [logo, setLogo] = useState("");
  const [favicon, setFavicon] = useState("");
  const [description, setDescription] = useState("");
  const [minimumWithdraw, setMinimumWithdraw] = useState(5.0);
  const [maximumWithdraw, setMaximumWithdraw] = useState(1000.0);
  const [referralPercent, setReferralPercent] = useState(10.0);
  const [defaultCpm, setDefaultCpm] = useState(3.0);
  const [bannerCode, setBannerCode] = useState("");
  const [socialBarCode, setSocialBarCode] = useState("");
  const [interstitialCode, setInterstitialCode] = useState("");
  const [captchaEnabled, setCaptchaEnabled] = useState(true);
  const [countdownSeconds, setCountdownSeconds] = useState(15);
  const [cloudinaryKey, setCloudinaryKey] = useState("");
  const [cloudinarySecret, setCloudinarySecret] = useState("");
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState("");
  const [adsterraPublisherId, setAdsterraPublisherId] = useState("");
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load settings
  const { isLoading } = useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      const d = await res.json();

      setWebsiteName(d.websiteName || "");
      setSupportEmail(d.supportEmail || "");
      setLogo(d.logo || "");
      setFavicon(d.favicon || "");
      setDescription(d.description || "");
      setMinimumWithdraw(Number(d.minimumWithdraw || 5.0));
      setMaximumWithdraw(Number(d.maximumWithdraw || 1000.0));
      setReferralPercent(Number(d.referralPercent || 10.0));
      setDefaultCpm(Number(d.defaultCpm || 3.0));
      setBannerCode(d.bannerCode || "");
      setSocialBarCode(d.socialBarCode || "");
      setInterstitialCode(d.interstitialCode || "");
      setCaptchaEnabled(d.captchaEnabled ?? true);
      setCountdownSeconds(Number(d.countdownSeconds || 15));
      setCloudinaryKey(d.cloudinaryKey || "");
      setCloudinarySecret(d.cloudinarySecret || "");
      setCloudinaryCloudName(d.cloudinaryCloudName || "");
      setAdsterraPublisherId(d.adsterraPublisherId || "");
      setMaintenance(d.maintenance ?? false);
      setMaintenanceMessage(d.maintenanceMessage || "");

      return d;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update settings");
      return data;
    },
    onSuccess: (data) => {
      setSuccessMsg(data.message);
      queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] });
    },
    onError: (err: any) => {
      setErrorMsg(err.message);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    const payload = {
      websiteName,
      supportEmail,
      logo,
      favicon,
      description,
      minimumWithdraw,
      maximumWithdraw,
      referralPercent,
      defaultCpm,
      bannerCode,
      socialBarCode,
      interstitialCode,
      captchaEnabled,
      countdownSeconds,
      cloudinaryKey,
      cloudinarySecret,
      cloudinaryCloudName,
      adsterraPublisherId,
      maintenance,
      maintenanceMessage,
    };

    saveMutation.mutate(payload);
    setIsSaving(false);
  };

  if (isLoading) {
    return <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>;
  }

  const tabs = [
    { id: "general", label: "Cấu hình chung", icon: SettingsIcon },
    { id: "payout", label: "Thanh toán & CPM", icon: DollarSign },
    { id: "ads", label: "Mã Ads Adsterra", icon: Sliders },
    { id: "security", label: "Bảo mật & Captcha", icon: Lock },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Cấu hình hệ thống</h2>
        <p className="text-slate-500 dark:text-slate-400">Thay đổi tên website, liên kết logo, cổng thanh toán hoặc mã quảng cáo.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Settings Navigation tabs */}
        <div className="w-full sm:w-56 shrink-0 flex flex-col space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSuccessMsg("");
                setErrorMsg("");
              }}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-850"
              }`}
            >
              <tab.icon className="h-4.5 w-4.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Box */}
        <div className="flex-1">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSave} className="space-y-6">
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

                {activeTab === "general" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Tên Website</label>
                      <input
                        type="text"
                        required
                        value={websiteName}
                        onChange={(e) => setWebsiteName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Email liên hệ hỗ trợ</label>
                      <input
                        type="email"
                        required
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Mô tả ngắn SEO</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none h-20"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "payout" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Rút tối thiểu ($)</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={minimumWithdraw}
                          onChange={(e) => setMinimumWithdraw(parseFloat(e.target.value))}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Rút tối đa ($)</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={maximumWithdraw}
                          onChange={(e) => setMaximumWithdraw(parseFloat(e.target.value))}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">CPM mặc định ($/1000 click)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={defaultCpm}
                          onChange={(e) => setDefaultCpm(parseFloat(e.target.value))}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Hoa hồng giới thiệu (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={referralPercent}
                          onChange={(e) => setReferralPercent(parseFloat(e.target.value))}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "ads" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Mã Banner Adsterra (HTML / JS Script)</label>
                      <textarea
                        value={bannerCode}
                        onChange={(e) => setBannerCode(e.target.value)}
                        placeholder="Dán script quảng cáo banner 728x90 ở đây..."
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono h-24"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Mã Social Bar Adsterra (HTML / JS Script)</label>
                      <textarea
                        value={socialBarCode}
                        onChange={(e) => setSocialBarCode(e.target.value)}
                        placeholder="Dán script quảng cáo Social Bar ở đây..."
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono h-24"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                      <div>
                        <h4 className="font-semibold text-sm">Yêu cầu CAPTCHA vượt link</h4>
                        <p className="text-xs text-slate-500">Bật/tắt xác thực Turnstile ở bước 3.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={captchaEnabled}
                        onChange={(e) => setCaptchaEnabled(e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Thời gian Countdown đếm ngược (giây)</label>
                      <input
                        type="number"
                        required
                        value={countdownSeconds}
                        onChange={(e) => setCountdownSeconds(parseInt(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-3 rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Lưu cấu hình hệ thống</span>
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
