"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { MessageCircle, Search } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import { formatDate, truncate } from "@/lib/utils";
import type { User } from "@/types";
import { cn } from "@/lib/utils";
import { ChatSkeleton } from "@/components/ui/Skeleton";

export default function ChatsPage() {
  const { conversations, isLoading, loadConversations } = useChatStore();
  const { user } = useAuthStore();
  const myId = user?._id || user?.id;
  const [search, setSearch] = useState("");

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.trim().toLowerCase();
    return conversations.filter((conv) => {
      const other = conv.participants?.find((p: User) => p._id !== myId);
      return other?.name?.toLowerCase().includes(q);
    });
  }, [conversations, search, myId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

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

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ChatSkeleton />
        ) : filteredConversations.length === 0 ? (
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
                      {conv.lastMessage
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
      </div>
    </div>
  );
}
