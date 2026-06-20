"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Mail, Send, CheckCircle, RefreshCw } from "lucide-react";

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const faqs = [
    {
      q: "Folink tính tiền lượt click như thế nào?",
      a: "Chúng tôi ghi nhận thu nhập của bạn dựa trên CPM (giá mỗi 1000 lượt click). Hệ thống sẽ tự động phân loại lượt xem hợp lệ và cộng tiền tương ứng vào số dư ví của bạn.",
    },
    {
      q: "Lượt xem (Click) như thế nào được coi là hợp lệ?",
      a: "Lượt click hợp lệ phải hoàn thành đầy đủ quy trình vượt link (bao gồm đợi countdown, xác minh CAPTCHA và xem quảng cáo). Mỗi địa chỉ IP duy nhất chỉ được tính một lượt click hợp lệ trong vòng 24 giờ.",
    },
    {
      q: "Yêu cầu rút tiền mất bao lâu để phê duyệt?",
      a: "Tất cả các yêu cầu rút tiền đều được xem xét và xử lý thủ công trong vòng 24 - 48 giờ làm việc. Cuối tuần có thể chậm hơn một chút.",
    },
    {
      q: "Ngưỡng thanh toán tối thiểu là bao nhiêu?",
      a: "Số tiền tối thiểu để thực hiện một yêu cầu rút tiền là $5.00 đối với tất cả các phương thức thanh toán.",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setSubject("");
      setMessage("");
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* FAQ Sections */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Trung tâm hỗ trợ & FAQ</h2>
          <p className="text-slate-500 dark:text-slate-400">Tìm câu trả lời nhanh chóng cho các thắc mắc thường gặp hoặc gửi yêu cầu liên hệ.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-start">
                  <HelpCircle className="h-4.5 w-4.5 text-indigo-500 mr-2 shrink-0 mt-0.5" />
                  {faq.q}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-650 dark:text-slate-400">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Support Ticket */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold">Gửi yêu cầu hỗ trợ</h3>
          <p className="text-xs text-slate-500">Chúng tôi thường phản hồi trong vòng 24 giờ.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Liên hệ trực tiếp</CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="p-4 bg-green-50 border border-green-200 text-sm text-green-600 rounded-lg text-center space-y-2">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                <h4 className="font-bold">Đã gửi yêu cầu thành công</h4>
                <p className="text-xs text-green-700">Đội ngũ kỹ thuật của Folink sẽ phản hồi qua email tài khoản của bạn.</p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-2 text-xs font-semibold text-indigo-600 underline"
                >
                  Gửi tiếp tin nhắn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Chủ đề cần hỗ trợ</label>
                  <input
                    type="text"
                    required
                    placeholder="Vấn đề thanh toán, lỗi link..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Nội dung chi tiết</label>
                  <textarea
                    required
                    placeholder="Mô tả cụ thể sự cố hoặc câu hỏi..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none h-24 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Gửi tin nhắn</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Support email fallback info */}
        <div className="flex items-center space-x-2 p-3 border rounded-xl bg-slate-50 dark:bg-slate-900/50">
          <Mail className="h-4 w-4 text-indigo-500" />
          <div className="text-[11px] text-slate-500">
            Email hỗ trợ khẩn cấp: <span className="font-semibold text-indigo-600">support@folink.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
