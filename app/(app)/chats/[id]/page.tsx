"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  Send,
  Image as ImageIcon,
  Mic,
  MoreVertical,
  Phone,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import { chatAPI } from "@/lib/api";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Message, User, ApiResponse } from "@/types";

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  const { user } = useAuthStore();
  const { messages, loadMessages, addMessage } = useChatStore();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessages = messages[conversationId] || [];

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    }
  }, [conversationId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = (await chatAPI.sendMessage(
        conversationId,
        text.trim()
      )) as ApiResponse<Message>;
      if (res.success && res.data) {
        addMessage(conversationId, res.data);
        setText("");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-bg-secondary">
        <button
          onClick={() => router.push("/chats")}
          className="text-text-muted hover:text-text-primary lg:hidden"
        >
          <ArrowRight size={22} />
        </button>
        <Avatar src={undefined} name="مستخدم" size="md" isOnline />
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-sm">مستخدم</h2>
          <p className="text-xs text-success">متصل الآن</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-hover rounded-xl transition-colors">
            <Phone size={18} />
          </button>
          <button className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-hover rounded-xl transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">
            ابدأ المحادثة بإرسال رسالة...
          </div>
        ) : (
          chatMessages.map((msg) => {
            const senderId =
              typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
            const isMine = senderId === user?._id;
            return (
              <div
                key={msg._id}
                className={cn("flex", isMine ? "justify-start" : "justify-end")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5",
                    isMine
                      ? "gradient-bg text-white rounded-br-md"
                      : "bg-bg-card border border-border text-text-primary rounded-bl-md"
                  )}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p
                    className={cn(
                      "text-[10px] mt-1",
                      isMine ? "text-white/60" : "text-text-muted"
                    )}
                  >
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-bg-secondary">
        <div className="flex items-center gap-2">
          <button className="p-2 text-text-muted hover:text-accent-pink rounded-xl transition-colors">
            <ImageIcon size={22} />
          </button>
          <button className="p-2 text-text-muted hover:text-accent-pink rounded-xl transition-colors">
            <Mic size={22} />
          </button>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="اكتب رسالتك..."
            className="flex-1 bg-bg-input border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-accent-pink"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="p-2.5 gradient-bg rounded-xl text-white disabled:opacity-50 transition-opacity"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
