import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Folink - Smart Link Monetization Platform",
  description: "Rút gọn liên kết kiếm tiền với CPM cao nhất, hệ thống đối soát tự động, rút tiền nhanh chóng và bảo mật tuyệt đối.",
  keywords: ["rút gọn link kiếm tiền", "url shortener", "folink", "cpm cao", "yeumoney", "link4m"],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${inter.variable} font-sans antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
