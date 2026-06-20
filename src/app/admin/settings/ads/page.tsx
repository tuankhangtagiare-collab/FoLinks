"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, RefreshCw, Play, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdsterraSettingsPage() {
  const [publisherId, setPublisherId] = useState("");
  const [directLink, setDirectLink] = useState("");
  const [bannerZone, setBannerZone] = useState("");
  const [socialBarZone, setSocialBarZone] = useState("");
  const [nativeZone, setNativeZone] = useState("");
  const [popunderZone, setPopunderZone] = useState("");
  
  const [enableDirectLink, setEnableDirectLink] = useState(false);
  const [enableBanner, setEnableBanner] = useState(false);
  const [enableSocialBar, setEnableSocialBar] = useState(false);
  const [enableNative, setEnableNative] = useState(false);
  const [enablePopunder, setEnablePopunder] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/adsterra");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setPublisherId(data.settings.publisherId || "");
            setDirectLink(data.settings.directLink || "");
            setBannerZone(data.settings.bannerZone || "");
            setSocialBarZone(data.settings.socialBarZone || "");
            setNativeZone(data.settings.nativeZone || "");
            setPopunderZone(data.settings.popunderZone || "");
            setEnableDirectLink(data.settings.enableDirectLink || false);
            setEnableBanner(data.settings.enableBanner || false);
            setEnableSocialBar(data.settings.enableSocialBar || false);
            setEnableNative(data.settings.enableNative || false);
            setEnablePopunder(data.settings.enablePopunder || false);
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/adsterra", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publisherId,
          directLink,
          bannerZone,
          socialBarZone,
          nativeZone,
          popunderZone,
          enableDirectLink,
          enableBanner,
          enableSocialBar,
          enableNative,
          enablePopunder,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra khi lưu");
      
      setSuccessMsg("Cấu hình quảng cáo Adsterra đã được cập nhật thành công.");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/adsterra/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ directLink, bannerZone }),
      });
      const data = await res.json();
      setTestResult(data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Cấu hình quảng cáo Adsterra</h2>
        <p className="text-slate-500 dark:text-slate-400">Quản lý Publisher ID, Zone ID và bật/tắt động các loại quảng cáo khác nhau.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {successMsg && (
          <div className="p-4 bg-green-50 border border-green-200 text-sm text-green-600 rounded-lg flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-sm text-red-600 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Publisher */}
          <Card>
            <CardHeader>
              <CardTitle>Publisher Account</CardTitle>
              <CardDescription>Nhập mã tài khoản nhà quảng cáo của bạn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Publisher ID</label>
                <input
                  type="text"
                  value={publisherId}
                  onChange={(e) => setPublisherId(e.target.value)}
                  placeholder="ID nhà quảng cáo..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Direct Link */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Direct Link</CardTitle>
                <CardDescription>Quảng cáo chuyển hướng trực tiếp.</CardDescription>
              </div>
              <input
                type="checkbox"
                checked={enableDirectLink}
                onChange={(e) => setEnableDirectLink(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Direct Link URL</label>
                <input
                  type="text"
                  value={directLink}
                  onChange={(e) => setDirectLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Banner */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Banner Ads</CardTitle>
                <CardDescription>Các banner quảng cáo kích thước tĩnh.</CardDescription>
              </div>
              <input
                type="checkbox"
                checked={enableBanner}
                onChange={(e) => setEnableBanner(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Banner Zone ID</label>
                <input
                  type="text"
                  value={bannerZone}
                  onChange={(e) => setBannerZone(e.target.value)}
                  placeholder="Mã phân vùng banner..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Social Bar */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Social Bar</CardTitle>
                <CardDescription>Quảng cáo thông báo dạng thanh mạng xã hội.</CardDescription>
              </div>
              <input
                type="checkbox"
                checked={enableSocialBar}
                onChange={(e) => setEnableSocialBar(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Social Bar Zone ID</label>
                <input
                  type="text"
                  value={socialBarZone}
                  onChange={(e) => setSocialBarZone(e.target.value)}
                  placeholder="Mã phân vùng social bar..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Native Banner */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Native Banner</CardTitle>
                <CardDescription>Quảng cáo hiển thị tự nhiên.</CardDescription>
              </div>
              <input
                type="checkbox"
                checked={enableNative}
                onChange={(e) => setEnableNative(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Native Zone ID</label>
                <input
                  type="text"
                  value={nativeZone}
                  onChange={(e) => setNativeZone(e.target.value)}
                  placeholder="Mã phân vùng native..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 6: Popunder */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Popunder Ads</CardTitle>
                <CardDescription>Quảng cáo ẩn trang chuyển tiếp (Anti-Adblock).</CardDescription>
              </div>
              <input
                type="checkbox"
                checked={enablePopunder}
                onChange={(e) => setEnablePopunder(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Popunder Script URL <span className="text-xs text-slate-400 font-normal">(Anti-Adblock JS SYNC)</span></label>
                <input
                  type="text"
                  value={popunderZone}
                  onChange={(e) => setPopunderZone(e.target.value)}
                  placeholder="https://manhoodinvoluntaryplash.com/ff/.../xxx.js"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none font-mono"
                />
                <p className="text-[11px] text-slate-400">Dán URL từ thẻ &lt;script src=&quot;...&quot;&gt; trong mục <strong>ANTI-ADBLOCK JS SYNC</strong> trên Adsterra dashboard.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {testResult && (
          <Card className="border-indigo-100 bg-indigo-50/10">
            <CardContent className="p-4 space-y-2">
              <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">Kết quả chạy thử (Test Result):</h4>
              <ul className="text-xs space-y-1">
                <li>Direct Link URL: {testResult.directLinkValid ? "✅ Hợp lệ" : "❌ Không hợp lệ hoặc bỏ trống"}</li>
                <li>Banner Zone ID: {testResult.bannerZoneValid ? "✅ Hợp lệ" : "❌ Không hợp lệ hoặc bỏ trống"}</li>
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Lưu thay đổi</span>
          </button>
          
          <button
            type="button"
            onClick={handleTest}
            disabled={isTesting}
            className="px-6 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center space-x-2"
          >
            <Play className="h-4 w-4" />
            <span>Chạy thử</span>
          </button>
        </div>
      </form>
    </div>
  );
}
