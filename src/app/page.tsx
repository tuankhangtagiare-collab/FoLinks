"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LinkIcon,
  BarChart3,
  Shield,
  Zap,
  Globe,
  Wallet,
  Code2,
  ChevronDown,
  ArrowRight,
  Star,
  Users,
  TrendingUp,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-white/5">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <LinkIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Folink
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Tính năng</a>
          <a href="#pricing" className="hover:text-white transition-colors">Bảng giá</a>
          <a href="#api" className="hover:text-white transition-colors">API</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/api/auth/signin"
            className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
          >
            Đăng nhập
          </Link>
          <Link
            href="/api/auth/signin"
            className="px-5 py-2.5 text-sm font-semibold rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:shadow-lg hover:shadow-violet-500/25 transition-all hover:scale-105"
          >
            Bắt đầu miễn phí
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-6 pb-6 space-y-4"
        >
          <a href="#features" className="block text-slate-300 hover:text-white" onClick={() => setOpen(false)}>Tính năng</a>
          <a href="#pricing" className="block text-slate-300 hover:text-white" onClick={() => setOpen(false)}>Bảng giá</a>
          <a href="#api" className="block text-slate-300 hover:text-white" onClick={() => setOpen(false)}>API</a>
          <a href="#faq" className="block text-slate-300 hover:text-white" onClick={() => setOpen(false)}>FAQ</a>
          <div className="pt-4 border-t border-white/10 space-y-3">
            <Link href="/api/auth/signin" className="block text-center px-4 py-2.5 rounded-full border border-white/10 text-white">
              Đăng nhập
            </Link>
            <Link href="/api/auth/signin" className="block text-center px-4 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold">
              Bắt đầu miễn phí
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

function HeroSection() {
  const [url, setUrl] = useState("");
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-violet-600/20 via-cyan-500/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-900/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-cyan-900/20 rounded-full blur-3xl" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          {/* Badge */}
          <motion.div variants={fadeInUp} className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Nền tảng rút gọn link #1 Việt Nam
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6"
          >
            <span className="text-white">Rút gọn link.</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Kiếm tiền thật.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Mỗi lượt truy cập đều là tiền. CPM cao nhất thị trường, đối soát tự động,
            rút tiền nhanh chóng. Hoàn toàn <strong className="text-white">miễn phí</strong>.
          </motion.p>

          {/* URL Input */}
          <motion.div
            variants={fadeInUp}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="flex flex-col sm:flex-row items-stretch gap-3 p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex-1 flex items-center gap-3 px-4">
                <LinkIcon className="w-5 h-5 text-slate-500 shrink-0" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Dán link cần rút gọn tại đây..."
                  className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none py-3 text-base"
                />
              </div>
              <Link
                href="/api/auth/signin"
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all hover:scale-[1.02] text-center whitespace-nowrap"
              >
                Rút gọn ngay
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-sm text-slate-500"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-400" />
              <span><strong className="text-white">10K+</strong> người dùng</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span><strong className="text-white">5M+</strong> link đã tạo</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span><strong className="text-white">4.9/5</strong> đánh giá</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: Zap,
    title: "CPM cao nhất",
    desc: "Tỷ lệ CPM hàng đầu thị trường, tối ưu doanh thu cho mỗi lượt truy cập.",
    color: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/20",
  },
  {
    icon: BarChart3,
    title: "Thống kê realtime",
    desc: "Dashboard theo dõi lượt click, doanh thu, quốc gia, thiết bị theo thời gian thực.",
    color: "from-violet-500 to-purple-500",
    shadow: "shadow-violet-500/20",
  },
  {
    icon: Shield,
    title: "Chống gian lận",
    desc: "Hệ thống Anti-Fraud AI tự động phát hiện bot, click ảo, proxy và VPN.",
    color: "from-emerald-500 to-green-500",
    shadow: "shadow-emerald-500/20",
  },
  {
    icon: Globe,
    title: "Toàn cầu",
    desc: "Hỗ trợ traffic từ 200+ quốc gia với tỷ lệ CPM tùy chỉnh theo vùng.",
    color: "from-cyan-500 to-blue-500",
    shadow: "shadow-cyan-500/20",
  },
  {
    icon: Wallet,
    title: "Rút tiền nhanh",
    desc: "Rút tiền qua Momo, ngân hàng, USDT. Xử lý trong 24h, tối thiểu 50.000đ.",
    color: "from-pink-500 to-rose-500",
    shadow: "shadow-pink-500/20",
  },
  {
    icon: Code2,
    title: "API mạnh mẽ",
    desc: "REST API đầy đủ cho phép tích hợp vào website, tool, launcher, game.",
    color: "from-indigo-500 to-violet-500",
    shadow: "shadow-indigo-500/20",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 md:py-32 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-sm font-semibold uppercase tracking-widest text-violet-400 mb-3">
            Tính năng
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-4">
            Mọi thứ bạn cần để kiếm tiền
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-slate-400 max-w-2xl mx-auto text-lg">
            Hệ thống toàn diện từ rút gọn link, theo dõi thống kê, đến rút tiền tự động.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeInUp}
              className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.05] transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg ${f.shadow} group-hover:scale-110 transition-transform`}
              >
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { step: "01", title: "Đăng ký miễn phí", desc: "Tạo tài khoản trong 30 giây, không cần xác minh." },
    { step: "02", title: "Tạo link rút gọn", desc: "Dán URL gốc, hệ thống tự tạo link kiếm tiền." },
    { step: "03", title: "Chia sẻ link", desc: "Chia sẻ lên mạng xã hội, blog, YouTube, forum." },
    { step: "04", title: "Nhận tiền", desc: "Xem doanh thu realtime và rút tiền khi đủ mức tối thiểu." },
  ];
  return (
    <section className="py-24 md:py-32 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-900/10 rounded-full blur-3xl" />
      <div className="relative max-w-5xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-sm font-semibold uppercase tracking-widest text-cyan-400 mb-3">
            Hướng dẫn
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white">
            Bắt đầu trong 4 bước
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((s) => (
            <motion.div key={s.step} variants={fadeInUp} className="relative text-center p-6">
              <div className="text-6xl font-black text-white/[0.04] mb-4">{s.step}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-slate-400 text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "0đ",
      desc: "Dành cho người mới bắt đầu",
      features: ["Tạo link không giới hạn", "Thống kê cơ bản", "CPM tiêu chuẩn", "Rút tiền từ 50.000đ", "Hỗ trợ qua ticket"],
      cta: "Bắt đầu miễn phí",
      popular: false,
    },
    {
      name: "Pro",
      price: "99.000đ",
      period: "/tháng",
      desc: "Dành cho Publisher chuyên nghiệp",
      features: ["Tất cả của Free", "CPM cao hơn 30%", "API truy cập đầy đủ", "Thống kê nâng cao", "Custom domain", "Ưu tiên hỗ trợ 24/7"],
      cta: "Nâng cấp Pro",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Liên hệ",
      desc: "Dành cho doanh nghiệp, mạng lưới lớn",
      features: ["Tất cả của Pro", "CPM tùy chỉnh", "Webhook & API nâng cao", "Account Manager riêng", "SLA 99.9%", "White-label solution"],
      cta: "Liên hệ ngay",
      popular: false,
    },
  ];
  return (
    <section id="pricing" className="py-24 md:py-32 bg-slate-950 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-3">
            Bảng giá
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-4">
            Chọn gói phù hợp
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-slate-400 text-lg">
            Bắt đầu miễn phí, nâng cấp khi bạn sẵn sàng.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid md:grid-cols-3 gap-6"
        >
          {plans.map((p) => (
            <motion.div
              key={p.name}
              variants={fadeInUp}
              className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                p.popular
                  ? "bg-gradient-to-b from-violet-500/10 to-transparent border-violet-500/30 shadow-xl shadow-violet-500/10 scale-[1.02]"
                  : "bg-white/[0.02] border-white/[0.06] hover:border-white/10"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-semibold">
                  Phổ biến nhất
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-1">{p.name}</h3>
              <p className="text-slate-400 text-sm mb-5">{p.desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">{p.price}</span>
                {p.period && <span className="text-slate-400 text-sm">{p.period}</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-sm text-slate-300">
                    <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/api/auth/signin"
                className={`block text-center py-3 rounded-xl font-semibold transition-all text-sm ${
                  p.popular
                    ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:shadow-lg hover:shadow-violet-500/25 hover:scale-[1.02]"
                    : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                }`}
              >
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function APISection() {
  return (
    <section id="api" className="py-24 md:py-32 bg-slate-950 relative overflow-hidden">
      <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-indigo-900/15 rounded-full blur-3xl" />
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.p variants={fadeInUp} className="text-sm font-semibold uppercase tracking-widest text-indigo-400 mb-3">
              Developer API
            </motion.p>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mb-5">
              Tích hợp mọi nơi với Folink API
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-slate-400 text-lg mb-8 leading-relaxed">
              REST API mạnh mẽ cho phép tạo link, quản lý key, kiểm tra trạng thái
              và nhận webhook. Tích hợp vào website, tool, launcher hoặc game chỉ trong 5 phút.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-3">
              <Link href="/api/auth/signin" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors text-sm">
                Lấy API Key <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors text-sm">
                Tài liệu API <ExternalLink className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="rounded-2xl bg-slate-900/80 border border-white/[0.06] p-6 font-mono text-sm overflow-x-auto">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-slate-500 text-xs ml-2">api-example.js</span>
              </div>
              <pre className="text-slate-300 leading-relaxed">
                <code>{`// Tạo link rút gọn
const res = await fetch(
  "https://folink.vn/api/link/create",
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer YOUR_API_KEY",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url: "https://example.com/long-url",
      alias: "custom-name"
    })
  }
);

const data = await res.json();
console.log(data.shortUrl);
// → https://folink.vn/l/custom-name`}</code>
              </pre>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    { q: "Folink hoàn toàn miễn phí?", a: "Có! Bạn có thể sử dụng tất cả tính năng cơ bản hoàn toàn miễn phí. Gói Pro và Enterprise dành cho người dùng muốn CPM cao hơn và API nâng cao." },
    { q: "CPM của Folink là bao nhiêu?", a: "CPM phụ thuộc vào quốc gia traffic. Trung bình từ $1-5 cho traffic Việt Nam, $3-15 cho traffic Tier 1 (US, UK, EU)." },
    { q: "Rút tiền tối thiểu bao nhiêu?", a: "Mức rút tiền tối thiểu là 50.000đ. Hỗ trợ rút qua Momo, chuyển khoản ngân hàng và USDT." },
    { q: "Có hỗ trợ API không?", a: "Có! Folink cung cấp REST API đầy đủ để tạo link, quản lý key, webhook. Phù hợp cho website, tool, launcher, game." },
    { q: "Link rút gọn có hết hạn không?", a: "Không! Link tạo ra sẽ hoạt động vĩnh viễn trừ khi bạn tự xóa hoặc vi phạm điều khoản." },
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 md:py-32 bg-slate-950">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.p variants={fadeInUp} className="text-sm font-semibold uppercase tracking-widest text-amber-400 mb-3">
            FAQ
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white">
            Câu hỏi thường gặp
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="space-y-3"
        >
          {faqs.map((f, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden"
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium text-white">{f.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform ${openIdx === i ? "rotate-180" : ""}`}
                />
              </button>
              {openIdx === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="px-5 pb-5 text-slate-400 text-sm leading-relaxed"
                >
                  {f.a}
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 md:py-32 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-cyan-500/10 to-violet-600/10" />
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-white mb-5">
            Sẵn sàng kiếm tiền từ link?
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Tham gia cùng hàng nghìn Publisher đang kiếm tiền mỗi ngày với Folink.
            Đăng ký miễn phí, bắt đầu ngay hôm nay.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/api/auth/signin"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-lg hover:shadow-xl hover:shadow-violet-500/25 transition-all hover:scale-105"
            >
              Tạo tài khoản miễn phí
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all"
            >
              Xem thêm tính năng
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
                <LinkIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Folink</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Nền tảng rút gọn link kiếm tiền hàng đầu Việt Nam. CPM cao, rút tiền nhanh, an toàn.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Sản phẩm</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li><a href="#features" className="hover:text-white transition-colors">Tính năng</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Bảng giá</a></li>
              <li><a href="#api" className="hover:text-white transition-colors">API</a></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Hỗ trợ</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Điều khoản</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chính sách</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Liên kết</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Telegram</a></li>
              <li><a href="#" className="hover:text-white transition-colors">YouTube</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 text-center text-sm text-slate-600">
          © {new Date().getFullYear()} Folink. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="bg-slate-950 text-white min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <PricingSection />
      <APISection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
