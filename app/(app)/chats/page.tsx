"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { MessageCircle, Search, Check, X, UserPlus, ChevronDown, ChevronUp } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import { chatAPI } from "@/lib/api";
import { formatDate, truncate } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import type { User, Conversation } from "@/types";
import { cn } from "@/lib/utils";
import { ChatSkeleton } from "@/components/ui/Skeleton";

export default function ChatsPage() {
  const { conversations, isLoading, loadConversations } = useChatStore();
  const { user } = useAuthStore();
  const myId = user?._id || user?.id;
  const [search, setSearch] = useState("");
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [showRequests, setShowRequests] = useState(false);

  // Split conversations into accepted and pending requests
  const { accepted, pending } = useMemo(() => {
    const accepted: Conversation[] = [];
    const pending: Conversation[] = [];
    conversations.forEach((conv) => {
      if (conv.status === "pending") {
        // Show as pending request only if someone ELSE sent it to me
        const creatorId = conv.creator;
        const iAmCreator = creatorId === myId;
        if (!iAmCreator) {
          pending.push(conv);
        } else {
          // I sent this request — show in accepted list as "بانتظار القبول"
          accepted.push(conv);
        }
      } else {
        // accepted, rejected, expired, or no status → show in main list
        accepted.push(conv);
      }
    });
    return { accepted, pending };
  }, [conversations, myId]);

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return accepted;
    const q = search.trim().toLowerCase();
    return accepted.filter((conv) => {
      const other = conv.participants?.find((p: User) => p._id !== myId);
      return other?.name?.toLowerCase().includes(q);
    });
  }, [accepted, search, myId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleAccept = async (convId: string) => {
    setRespondingTo(convId);
    try {
      const res = (await chatAPI.acceptRequest(convId)) as { success: boolean; message?: string };
      if (res.success) {
        toast("تم قبول الطلب", "success");
        loadConversations();
      } else {
        toast(res.message || "فشل القبول", "error");
      }
    } catch {
      toast("حدث خطأ", "error");
    } finally {
      setRespondingTo(null);
    }
  };

  const handleReject = async (convId: string) => {
    setRespondingTo(convId);
    try {
      const res = (await chatAPI.rejectRequest(convId)) as { success: boolean; message?: string };
      if (res.success) {
        toast("تم رفض الطلب", "info");
        loadConversations();
      } else {
        toast(res.message || "فشل الرفض", "error");
      }
    } catch {
      toast("حدث خطأ", "error");
    } finally {
      setRespondingTo(null);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-bg-secondary">
        <h1 className="text-xl font-black mb-3">المحادثات</h1>
        <div className="relative">
          <Search
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="بحث في المحادثات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-input border border-border rounded-xl pr-10 pl-4 py-2.5 text-sm text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-accent-pink"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ChatSkeleton />
        ) : (
          <>
            {/* Pending Requests */}
            {pending.length > 0 && (
              <div className="border-b border-border">
                <button
                  onClick={() => setShowRequests(!showRequests)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-accent-pink/5 hover:bg-accent-pink/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <UserPlus size={16} className="text-accent-pink" />
                    <span className="text-sm font-bold text-accent-pink">
                      طلبات محادثة ({pending.length})
                    </span>
                  </div>
                  {showRequests ? (
                    <ChevronUp size={18} className="text-accent-pink" />
                  ) : (
                    <ChevronDown size={18} className="text-accent-pink" />
                  )}
                </button>
                {showRequests && pending.map((conv) => {
                  const otherUser = conv.participants?.find(
                    (p: User) => p._id !== myId
                  ) as User | undefined;
                  const isResponding = respondingTo === conv._id;
                  return (
                    <div
                      key={conv._id}
                      className="flex items-center gap-3 p-4 border-b border-border/50 bg-accent-pink/[0.02]"
                    >
                      <Link href={`/profile/${otherUser?._id}`}>
                        <Avatar
                          src={otherUser?.profileImage}
                          name={otherUser?.name || "مستخدم"}
                          size="md"
                          isOnline={otherUser?.isOnline}
                          isPremium={otherUser?.isPremium}
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate">
                          {otherUser?.name || "مستخدم"}
                        </h3>
                        <p className="text-xs text-text-muted">
                          {conv.lastMessage
                            ? truncate(conv.lastMessage.content || "طلب محادثة", 30)
                            : "يريد التحدث معك"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleAccept(conv._id)}
                          disabled={isResponding}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-success/10 text-success text-sm font-bold hover:bg-success/20 transition-colors disabled:opacity-50"
                        >
                          <Check size={16} />
                          قبول
                        </button>
                        <button
                          onClick={() => handleReject(conv._id)}
                          disabled={isResponding}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-error/10 text-error text-sm font-bold hover:bg-error/20 transition-colors disabled:opacity-50"
                        >
                          <X size={16} />
                          رفض
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Accepted Conversations */}
            {filteredConversations.length === 0 && pending.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <MessageCircle size={48} className="text-text-muted/30 mb-4" />
                <h3 className="text-lg font-bold mb-2">لا توجد محادثات</h3>
                <p className="text-text-muted text-sm">
                  اكتشف أشخاص جدد وابدأ محادثتك الأولى!
                </p>
                <Link
                  href="/explore"
                  className="mt-4 gradient-bg text-white px-6 py-2.5 rounded-xl font-bold text-sm"
                >
                  اكتشف الآن
                </Link>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const otherUser = conv.participants?.find(
                  (p: User) => p._id !== myId
                ) as User | undefined;
                return (
                  <Link
                    key={conv._id}
                    href={`/chats/${conv._id}`}
                    className="flex items-center gap-3 p-4 hover:bg-bg-hover border-b border-border/50 transition-colors"
                  >
                    <Avatar
                      src={otherUser?.profileImage}
                      name={otherUser?.name || "مستخدم"}
                      size="md"
                      isOnline={otherUser?.isOnline}
                      isPremium={otherUser?.isPremium}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm truncate">
                          {otherUser?.name || "مستخدم"}
                        </h3>
                        <span className="text-xs text-text-muted shrink-0 mr-2">
                          {conv.lastMessage
                            ? formatDate(conv.lastMessage.createdAt)
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-text-muted truncate">
                          {conv.status === "pending" && conv.creator === myId
                            ? "⏳ بانتظار القبول"
                            : conv.lastMessage
                              ? truncate(conv.lastMessage.content || "صورة", 40)
                              : "ابدأ المحادثة..."}
                        </p>
                        {(conv.unreadCount ?? 0) > 0 && (
                          <span className="bg-accent-pink text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mr-2">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}
