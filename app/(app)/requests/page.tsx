"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Check, X, MessageCircle, Clock, CheckCircle2 } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import { chatAPI } from "@/lib/api";
import { formatDate, truncate } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import { ChatSkeleton } from "@/components/ui/Skeleton";
import type { User } from "@/types";

export default function RequestsPage() {
  const router = useRouter();
  const { conversations, isLoading, loadConversations } = useChatStore();
  const { user } = useAuthStore();
  const myId = user?._id || user?.id;
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [tab, setTab] = useState<"received" | "sent">("received");

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Split into received vs sent
  const { received, sent } = useMemo(() => {
    const received = conversations.filter((c) => c.status === "pending" && c.creator !== myId);
    const sent = conversations.filter((c) => c.status === "pending" && c.creator === myId);
    return { received, sent };
  }, [conversations, myId]);

  const list = tab === "received" ? received : sent;

  const handleAccept = async (id: string) => {
    setRespondingTo(id);
    try {
      const res = (await chatAPI.acceptRequest(id)) as { success: boolean };
      if (res.success) { toast("تم قبول الطلب", "success"); loadConversations(); }
    } catch { toast("حدث خطأ", "error"); }
    finally { setRespondingTo(null); }
  };

  const handleAcceptAndOpen = async (id: string) => {
    setRespondingTo(id);
    try {
      const res = (await chatAPI.acceptRequest(id)) as { success: boolean };
      if (res.success) router.push(`/chats/${id}`);
    } catch { toast("حدث خطأ", "error"); }
    finally { setRespondingTo(null); }
  };

  const handleReject = async (id: string) => {
    setRespondingTo(id);
    try {
      const res = (await chatAPI.rejectRequest(id)) as { success: boolean };
      if (res.success) { toast("تم الرفض", "info"); loadConversations(); }
    } catch { toast("حدث خطأ", "error"); }
    finally { setRespondingTo(null); }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-bg-secondary">
        <h1 className="text-xl font-black mb-3">طلبات المحادثة</h1>

        {/* Tabs */}
        <div className="flex gap-2 bg-bg-input p-1 rounded-xl">
          <button
            onClick={() => setTab("received")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
              tab === "received" ? "bg-accent-pink text-white shadow-md" : "text-text-muted"
            }`}
          >
            وصلتني {received.length > 0 && <span className="mr-1">({received.length})</span>}
          </button>
          <button
            onClick={() => setTab("sent")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
              tab === "sent" ? "bg-accent-pink text-white shadow-md" : "text-text-muted"
            }`}
          >
            أرسلتها {sent.length > 0 && <span className="mr-1">({sent.length})</span>}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ChatSkeleton />
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <UserPlus size={48} className="text-text-muted/30 mb-4" />
            <h3 className="text-lg font-bold mb-2">
              {tab === "received" ? "لا توجد طلبات جديدة" : "لم ترسل أي طلبات"}
            </h3>
            <p className="text-text-muted text-sm mb-4">
              {tab === "received" ? "ستظهر الطلبات هنا" : "اكتشف أشخاص جدد وابدأ المحادثة"}
            </p>
            <Link href="/explore" className="gradient-bg text-white px-6 py-2.5 rounded-xl font-bold text-sm">
              اكتشف الآن
            </Link>
          </div>
        ) : (
          list.map((conv) => {
            const otherUser = conv.participants?.find((p: User) => p._id !== myId) as User | undefined;
            const isResponding = respondingTo === conv._id;
            const initialMsg = conv.lastMessage?.content;
            const msgTime = conv.lastMessage?.createdAt || conv.createdAt;

            return (
              <div key={conv._id} className="p-4 border-b border-border/50 bg-accent-pink/[0.02]">
                <div className="flex items-center gap-3 mb-3">
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
                    <Link href={`/profile/${otherUser?._id}`}>
                      <h3 className="font-bold text-sm truncate flex items-center gap-1.5">
                        {otherUser?.name || "مستخدم"}
                        {otherUser?.isVerified && <CheckCircle2 size={12} className="text-accent-pink" />}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      {otherUser?.country && <span>{otherUser.country}</span>}
                      {msgTime && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {formatDate(msgTime)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {initialMsg && (
                  <div className="mr-14 mb-3 p-3 bg-bg-card border-r-2 border-accent-pink/40 rounded-lg">
                    <p className="text-sm leading-relaxed">{truncate(initialMsg, 200)}</p>
                  </div>
                )}

                {tab === "received" ? (
                  <div className="flex items-center gap-2 mr-14">
                    <button
                      onClick={() => handleAcceptAndOpen(conv._id)}
                      disabled={isResponding}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl gradient-bg text-white text-sm font-bold disabled:opacity-50 shadow-md shadow-accent-pink/20"
                    >
                      <MessageCircle size={16} />
                      قبول وفتح
                    </button>
                    <button
                      onClick={() => handleAccept(conv._id)}
                      disabled={isResponding}
                      className="px-3 py-2.5 rounded-xl bg-success/10 text-success hover:bg-success/20 disabled:opacity-50"
                      title="قبول فقط"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => handleReject(conv._id)}
                      disabled={isResponding}
                      className="px-3 py-2.5 rounded-xl bg-error/10 text-error hover:bg-error/20 disabled:opacity-50"
                      title="رفض"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="mr-14 flex items-center justify-between">
                    <span className="text-xs text-warning flex items-center gap-1">
                      <Clock size={12} />
                      بانتظار الرد
                    </span>
                    <button
                      onClick={() => handleReject(conv._id)}
                      disabled={isResponding}
                      className="text-xs text-error hover:underline disabled:opacity-50"
                    >
                      إلغاء الطلب
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
