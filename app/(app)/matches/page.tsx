"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { matchAPI } from "@/lib/api";
import { MatchSkeleton } from "@/components/ui/Skeleton";
import type { Match, ApiResponse } from "@/types";

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Server: { success, data: { matches: [...] } }
        const res = (await matchAPI.getMatches()) as {
          success: boolean;
          data?: { matches?: Match[] } | Match[];
        };
        if (res.success && res.data) {
          const list = Array.isArray(res.data) ? res.data : res.data.matches || [];
          setMatches(list);
        }
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b border-border bg-bg-secondary">
        <h1 className="text-xl font-black">المطابقات</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <MatchSkeleton />
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart size={48} className="text-text-muted/30 mb-4" />
            <h3 className="text-lg font-bold mb-2">لا توجد مطابقات بعد</h3>
            <p className="text-text-muted text-sm mb-4">
              استمر في الاكتشاف للحصول على مطابقات جديدة!
            </p>
            <Link
              href="/explore"
              className="gradient-bg text-white px-6 py-2.5 rounded-xl font-bold text-sm"
            >
              اكتشف الآن
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {matches.map((match) => {
              const otherUser = match.user || match.users?.[0];
              return (
                <div
                  key={match._id}
                  className="bg-bg-card border border-border rounded-2xl p-4 text-center hover:border-accent-pink/50 transition-all"
                >
                  <Link href={`/profile/${otherUser?._id}`}>
                    <Avatar
                      src={otherUser?.profileImage}
                      name={otherUser?.name}
                      size="lg"
                      isOnline={otherUser?.isOnline}
                      className="mx-auto mb-3"
                    />
                    <h3 className="font-bold text-sm truncate">
                      {otherUser?.name}
                    </h3>
                  </Link>
                  <Link
                    href={match.conversationId ? `/chats/${match.conversationId}` : "/chats"}
                    className="mt-3 flex items-center justify-center gap-1 text-accent-pink text-sm font-medium hover:underline"
                  >
                    <MessageCircle size={14} />
                    محادثة
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
