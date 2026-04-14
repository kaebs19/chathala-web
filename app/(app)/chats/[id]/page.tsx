"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Send,
  Image as ImageIcon,
  Mic,
  MoreVertical,
  Phone,
  Flag,
  User as UserIcon,
  ChevronDown,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import { chatAPI } from "@/lib/api";
import { formatTime, getImageUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useSocket } from "@/hooks/useSocket";
import { getSocket, SocketEvents } from "@/lib/socket";
import { toast } from "@/components/ui/Toast";
import ReportModal from "@/components/ui/ReportModal";
import type { Message, User } from "@/types";

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  const { user } = useAuthStore();
  const { messages, conversations, loadMessages, loadConversations, addMessage, setActiveConversation } = useChatStore();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const chatMessages = messages[conversationId] || [];
  const { joinConversation, leaveConversation, emitTyping, emitStopTyping, markRead } = useSocket();
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distanceFromBottom > 200);
  };

  // Group messages by date
  const getDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "اليوم";
    if (d.toDateString() === yesterday.toDateString()) return "أمس";
    return d.toLocaleDateString("ar-SA", { day: "numeric", month: "long" });
  };

  const otherUser = useMemo(() => {
    const conv = conversations.find((c) => c._id === conversationId);
    if (!conv?.participants) return null;
    const myId = user?._id || user?.id;
    return conv.participants.find((p) => p._id !== myId) || conv.participants[0] || null;
  }, [conversations, conversationId, user]);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
      joinConversation(conversationId);
      markRead(conversationId);
      setActiveConversation(conversationId);
      if (conversations.length === 0) loadConversations();

      const socket = getSocket();
      const handleTyping = (data: { userId: string }) => {
        const myId = user?._id || user?.id;
        if (data.userId !== myId) setIsTyping(true);
      };
      const handleStopTyping = () => setIsTyping(false);

      socket?.on(SocketEvents.USER_TYPING, handleTyping);
      socket?.on("stop-typing", handleStopTyping);

      return () => {
        setActiveConversation(null);
        leaveConversation(conversationId);
        socket?.off(SocketEvents.USER_TYPING, handleTyping);
        socket?.off("stop-typing", handleStopTyping);
      };
    }
  }, [conversationId, loadMessages, loadConversations, conversations.length, joinConversation, leaveConversation, markRead, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const content = text.trim();
    setSending(true);
    setText("");
    try {
      // Server: { success, data: { message: {...} }, message?: string, warning?: {...} }
      const res = (await chatAPI.sendMessage(
        conversationId,
        content
      )) as {
        success: boolean;
        data?: { message?: Message } | Message;
        message?: string;
        warning?: { message: string };
      };
      if (res.success && res.data) {
        const msg = res.data && "message" in (res.data as object)
          ? (res.data as { message: Message }).message
          : (res.data as Message);
        if (msg) {
          addMessage(conversationId, msg);
        }
        if (res.warning) {
          toast(res.warning.message, "error", 5000);
        }
      } else {
        setText(content);
        toast(res.message || "فشل إرسال الرسالة", "error");
      }
    } catch {
      setText(content);
      toast("حدث خطأ في الاتصال", "error");
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
          className="text-text-muted hover:text-text-primary"
        >
          <ArrowRight size={22} />
        </button>
        <Link href={otherUser?._id ? `/profile/${otherUser._id}` : "#"}>
          <Avatar src={otherUser?.profileImage} name={otherUser?.name || "مستخدم"} size="md" isOnline={otherUser?.isOnline} />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={otherUser?._id ? `/profile/${otherUser._id}` : "#"}>
            <h2 className="font-bold text-sm">{otherUser?.name || "مستخدم"}</h2>
          </Link>
          <p className={cn("text-xs", otherUser?.isOnline ? "text-success" : "text-text-muted")}>
            {otherUser?.isOnline ? "متصل الآن" : "غير متصل"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-hover rounded-xl transition-colors">
            <Phone size={18} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-hover rounded-xl transition-colors"
            >
              <MoreVertical size={18} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                <div className="absolute left-0 top-full mt-1 z-40 bg-bg-card border border-border rounded-xl shadow-lg overflow-hidden min-w-[160px] animate-fade-in-up" style={{ animationDuration: "0.15s" }}>
                  <Link
                    href={otherUser?._id ? `/profile/${otherUser._id}` : "#"}
                    className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-bg-hover transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    <UserIcon size={16} className="text-text-muted" />
                    عرض البروفايل
                  </Link>
                  <button
                    onClick={() => { setShowMenu(false); setShowReport(true); }}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-error/80 hover:bg-error/5 transition-colors w-full text-right"
                  >
                    <Flag size={16} />
                    إبلاغ
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-3 relative">
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">
            ابدأ المحادثة بإرسال رسالة...
          </div>
        ) : (
          chatMessages.map((msg, idx) => {
            // Date separator
            const prevMsg = idx > 0 ? chatMessages[idx - 1] : null;
            const showDate = !prevMsg || new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();

            const senderId =
              typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
            const isMine = senderId === (user?._id || user?.id);
            const msgBubble = (
              <div
                className={cn("flex animate-fade-in-up", isMine ? "justify-end" : "justify-start")}
                style={{ animationDuration: "0.2s" }}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl overflow-hidden",
                    msg.type === "image" ? "p-1" : "px-4 py-2.5",
                    isMine
                      ? "gradient-bg text-white rounded-bl-md"
                      : "bg-bg-card border border-border text-text-primary rounded-br-md"
                  )}
                >
                  {/* Reply preview */}
                  {msg.replyTo && (
                    <div className={cn(
                      "text-xs px-3 py-1.5 rounded-lg mb-1.5 border-r-2",
                      isMine ? "bg-white/10 border-white/40" : "bg-bg-hover border-accent-pink/40"
                    )}>
                      <p className="truncate opacity-70">{msg.replyTo.content}</p>
                    </div>
                  )}

                  {/* Image message */}
                  {msg.type === "image" && (msg.imageUrl || msg.content) && (
                    <img
                      src={getImageUrl(msg.imageUrl || msg.content)}
                      alt="صورة"
                      className="rounded-xl max-h-64 w-auto"
                    />
                  )}

                  {/* Audio message */}
                  {msg.type === "audio" && (
                    <div className="flex items-center gap-2 min-w-[180px]">
                      <button className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", isMine ? "bg-white/20" : "bg-accent-pink/20")}>
                        <span className="text-xs">&#9654;</span>
                      </button>
                      <div className="flex-1 h-1 rounded-full bg-white/20">
                        <div className="h-full w-1/3 rounded-full bg-white/60" />
                      </div>
                      {msg.audioDuration && (
                        <span className="text-[10px] shrink-0">{Math.floor(msg.audioDuration / 60)}:{String(msg.audioDuration % 60).padStart(2, "0")}</span>
                      )}
                    </div>
                  )}

                  {/* Text message */}
                  {(msg.type === "text" || (!msg.type && msg.content)) && (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  )}

                  {/* System message */}
                  {msg.type === "system" && (
                    <p className="text-xs text-center opacity-60">{msg.content}</p>
                  )}

                  <div className={cn("flex items-center gap-1 mt-1", isMine ? "justify-end" : "justify-start")}>
                    <span className={cn("text-[10px]", isMine ? "text-white/60" : "text-text-muted")}>
                      {formatTime(msg.createdAt)}
                    </span>
                    {isMine && (
                      <span className={cn("text-[10px]", msg.isRead ? "text-blue-300" : "text-white/40")}>
                        {msg.isRead ? "✓✓" : msg.isDelivered ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );

            return (
              <div key={msg._id}>
                {showDate && (
                  <div className="flex items-center justify-center my-4">
                    <div className="px-4 py-1.5 rounded-full bg-bg-card/80 border border-border/50 text-xs text-text-muted backdrop-blur-sm">
                      {getDateLabel(msg.createdAt)}
                    </div>
                  </div>
                )}
                {msgBubble}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />

        {/* Scroll to bottom */}
        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            className="sticky bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-accent-pink/80 text-white flex items-center justify-center shadow-lg hover:bg-accent-pink transition-colors z-10"
          >
            <ChevronDown size={20} />
          </button>
        )}
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="px-4 py-1.5 text-xs text-accent-pink animate-pulse">
          {otherUser?.name || "المستخدم"} يكتب...
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border bg-bg-secondary">
        <div className="flex items-center gap-2">
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            // TODO: implement image upload via API when endpoint is ready
            toast("إرسال الصور قريباً", "info");
          }} />
          <button onClick={() => imageInputRef.current?.click()} className="p-2 text-text-muted hover:text-accent-pink rounded-xl transition-colors">
            <ImageIcon size={22} />
          </button>
          <button className="p-2 text-text-muted hover:text-accent-pink rounded-xl transition-colors">
            <Mic size={22} />
          </button>
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              emitTyping(conversationId);
              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => emitStopTyping(conversationId), 2000);
            }}
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

      {/* Report Modal */}
      {showReport && otherUser && (
        <ReportModal
          userId={otherUser._id!}
          userName={otherUser.name}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
