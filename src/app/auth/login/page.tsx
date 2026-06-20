"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LinkIcon, Key, Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        usernameOrEmail,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Tên đăng nhập hoặc mật khẩu không chính xác.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[450px] bg-gradient-to-b from-violet-600/20 via-cyan-500/10 to-transparent rounded-full blur-3xl" />
      
      {/* Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl shadow-violet-950/20"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/25">
            <LinkIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Chào mừng trở lại!</h1>
          <p className="text-slate-400 text-sm text-center">
            Đăng nhập vào bảng điều khiển Folink của bạn.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Tên đăng nhập hoặc Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                required
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="you@example.com hoặc username"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 outline-none focus:border-violet-500/50 transition-colors text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-300">Mật khẩu</label>
              <a href="/auth/forgot-password" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                Quên mật khẩu?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 outline-none focus:border-violet-500/50 transition-colors text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:shadow-lg hover:shadow-violet-500/25 text-white font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Đăng nhập <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Chưa có tài khoản?{" "}
          <a href="/auth/register" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">
            Đăng ký miễn phí
          </a>
        </div>
      </motion.div>
    </div>
  );
}
