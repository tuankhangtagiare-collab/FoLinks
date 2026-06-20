"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HelpCircle,
  MessageSquare,
  Send,
  XCircle,
  AlertCircle,
  User,
  Clock,
} from "lucide-react";

interface TicketItem {
  id: string;
  title: string;
  status: "OPEN" | "ASSIGNED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  createdAt: string;
  user: {
    username: string;
    email: string;
  };
}

interface Message {
  id: string;
  message: string;
  createdAt: string;
  sender: {
    username: string;
    role: string;
  };
}

interface TicketDetail extends TicketItem {
  messages: Message[];
}

export default function AdminSupportPage() {
  const queryClient = useQueryClient();
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load ticket list
  const { data: ticketsList, isLoading: listLoading } = useQuery<TicketItem[]>({
    queryKey: ["admin-tickets-list"],
    queryFn: async () => {
      const res = await fetch("/api/admin/support");
      if (!res.ok) throw new Error("Failed to load tickets");
      return res.json();
    },
  });

  // Load ticket details chat
  const { data: activeTicket, isLoading: detailLoading } = useQuery<TicketDetail>({
    queryKey: ["admin-ticket-chat", activeTicketId],
    queryFn: async () => {
      if (!activeTicketId) return null as any;
      const res = await fetch(`/api/admin/support/${activeTicketId}`);
      if (!res.ok) throw new Error("Failed to load chat details");
      return res.json();
    },
    enabled: !!activeTicketId,
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch(`/api/admin/support/${activeTicketId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error("Failed to send reply");
      return res.json();
    },
    onSuccess: () => {
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["admin-ticket-chat", activeTicketId] });
    },
  });

  // Close ticket mutation
  const closeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/support/${activeTicketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CLOSED" }),
      });
      if (!res.ok) throw new Error("Failed to close ticket");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-ticket-chat", activeTicketId] });
    },
  });

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    replyMutation.mutate(replyText);
    setIsSubmitting(false);
  };

  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case "URGENT":
        return "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400";
      case "HIGH":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[500px]">
      {/* Left List Column */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Ticket hỗ trợ khách hàng</h3>
        <p className="text-xs text-slate-500 mt-0.5">Danh sách các yêu cầu hỗ trợ từ thành viên.</p>

        {listLoading ? (
          <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
        ) : !ticketsList || ticketsList.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">Chưa có ticket hỗ trợ nào.</div>
        ) : (
          <div className="space-y-3">
            {ticketsList.map((ticket) => (
              <Card
                key={ticket.id}
                onClick={() => setActiveTicketId(ticket.id)}
                className={`cursor-pointer transition-colors ${
                  activeTicketId === ticket.id
                    ? "border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/10"
                    : "hover:bg-slate-50/50 dark:hover:bg-slate-800/10"
                }`}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getPriorityBadge(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className={`text-[10px] font-semibold ${
                      ticket.status === "CLOSED" ? "text-slate-400" : "text-green-500"
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm truncate">{ticket.title}</h4>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t">
                    <span>@{ticket.user.username}</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Right Chat Column */}
      <div className="md:col-span-2">
        {!activeTicketId ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[300px]">
            <MessageSquare className="h-12 w-12 text-slate-350 mb-4" />
            <h3 className="text-lg font-bold">Chưa chọn Ticket</h3>
            <p className="text-sm text-slate-500 max-w-xs mt-1">Chọn một hỗ trợ bên trái để xem nội dung chat hội thoại chi tiết.</p>
          </Card>
        ) : detailLoading || !activeTicket ? (
          <div className="h-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
        ) : (
          <Card className="flex flex-col h-full justify-between">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-base">{activeTicket.title}</CardTitle>
                <CardDescription className="text-xs">Được tạo bởi @{activeTicket.user.username} vào {new Date(activeTicket.createdAt).toLocaleString("vi-VN")}</CardDescription>
              </div>

              {activeTicket.status !== "CLOSED" && (
                <button
                  onClick={() => closeMutation.mutate()}
                  className="inline-flex items-center text-xs font-semibold text-red-500 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Đóng ticket
                </button>
              )}
            </CardHeader>

            {/* Chat Body */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[350px]">
              {activeTicket.messages.map((msg) => {
                const isAdminMsg = msg.sender.role !== "USER";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAdminMsg ? "items-end" : "items-start"}`}
                  >
                    <div className="text-[10px] text-slate-400 mb-0.5">
                      {msg.sender.username} ({msg.sender.role})
                    </div>
                    <div
                      className={`p-3 rounded-2xl text-xs max-w-sm ${
                        isAdminMsg
                          ? "bg-indigo-600 text-white rounded-tr-none"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })}
            </CardContent>

            {/* Chat Footer Input */}
            {activeTicket.status !== "CLOSED" ? (
              <div className="p-4 border-t">
                <form onSubmit={handleReplySubmit} className="flex items-center space-x-2">
                  <input
                    type="text"
                    required
                    placeholder="Viết phản hồi hỗ trợ..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shrink-0"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-4 border-t bg-slate-50 dark:bg-slate-900/50 text-center text-xs text-slate-500 font-semibold">
                Ticket này đã được đóng. Bạn không thể phản hồi thêm.
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
const MessageCircle = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
