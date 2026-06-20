"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LinkIcon, User, Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Có lỗi xảy ra trong quá trình đăng ký.");
      } else {
        setSuccess("Đăng ký thành công! Hãy kiểm tra hòm thư của bạn để xác minh email.");
        setUsername("");
        setEmail("");
        setPassword("");
        // Sau 3 giây tự động sang trang login
        setTimeout(() => {
          router.push("/auth/login");
        }, 4000);
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[450px] bg-gradient-to-b from-cyan-600/20 via-violet-500/10 to-transparent rounded-full blur-3xl" />

      {/* Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl shadow-cyan-950/20"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/25">
            <LinkIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Đăng ký tài khoản</h1>
          <p className="text-slate-400 text-sm text-center">
            Bắt đầu kiếm tiền từ các liên kết của bạn hoàn toàn miễn phí.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Tên đăng nhập</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 outline-none focus:border-cyan-500/50 transition-colors text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 outline-none focus:border-cyan-500/50 transition-colors text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 outline-none focus:border-cyan-500/50 transition-colors text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:shadow-lg hover:shadow-cyan-500/25 text-white font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Đăng ký tài khoản <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Đã có tài khoản?{" "}
          <a href="/auth/login" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
            Đăng nhập ngay
          </a>
        </div>
      </motion.div>
    </div>
  );
}
