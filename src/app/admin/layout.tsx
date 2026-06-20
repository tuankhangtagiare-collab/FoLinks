"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Link2,
  ArrowDownCircle,
  BarChart3,
  Settings,
  Shield,
  FileText,
  Megaphone,
  HelpCircle,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  CloudLightning,
  AlertTriangle,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const userSession = session?.user as any;
  const isSuperAdmin = userSession?.role === "SUPER_ADMIN";
  const isAdmin = userSession?.role === "ADMIN" || isSuperAdmin;
  const isModerator = userSession?.role === "MODERATOR";

  // Menu item mapping according to user authorization levels
  const navigation = [
    { name: "Tổng quan Admin", href: "/admin", icon: LayoutDashboard },
    { name: "Người dùng", href: "/admin/users", icon: Users, show: isAdmin || isModerator },
    { name: "Liên kết", href: "/admin/links", icon: Link2, show: isAdmin || isModerator },
    { name: "Xử lý Rút tiền", href: "/admin/withdraw", icon: ArrowDownCircle, show: isAdmin },
    { name: "Hệ thống Ads", href: "/admin/ads", icon: CloudLightning, show: isSuperAdmin },
    { name: "Hoạt động & Logs", href: "/admin/logs", icon: FileText, show: isSuperAdmin },
    { name: "Thông báo hệ thống", href: "/admin/announcements", icon: Megaphone, show: isAdmin },
    { name: "Hỗ trợ khách hàng", href: "/admin/support", icon: HelpCircle, show: isAdmin || isModerator },
    { name: "Cấu hình Website", href: "/admin/settings", icon: Settings, show: isSuperAdmin },
  ].filter((item) => item.show !== false);

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <div className="flex bg-slate-55 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">
        {/* Sidebar for Desktop */}
        <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-900 text-white sticky top-0 h-screen">
          <div className="flex items-center justify-between px-6 h-16 border-b border-slate-800">
            <Link href="/admin" className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-indigo-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">
                Folink Admin
              </span>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-650 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center space-x-3 px-2">
              <div className="h-9 w-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{session?.user?.name || "Admin"}</p>
                <p className="text-xs text-slate-400 truncate">{userSession?.role || "MODERATOR"}</p>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Thoát Admin</span>
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar overlay */}
        {isSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
            <aside className="relative flex flex-col w-64 bg-slate-900 text-white border-r border-slate-800 h-full p-4 z-50 animate-in slide-in-from-left">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">
                  Folink Admin
                </span>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded-lg border border-slate-800">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium ${
                        isActive ? "bg-indigo-650 text-white" : "text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          {/* Top Navbar */}
          <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-bold hidden sm:block">Control Center</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleToggleTheme}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {isDarkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5" />}
              </button>

              <Link
                href="/dashboard"
                className="text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold px-3.5 py-2 rounded-lg transition-colors border border-indigo-250/20"
              >
                Về User Panel
              </Link>
            </div>
          </header>

          {/* Page Main Content */}
          <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
