"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, ShieldCheck } from "lucide-react";
import Avatar from "@/components/hala/Avatar";
import Button from "@/components/hala/Button";
import { CenterSpinner, EmptyState, IconButton, TopBar } from "@/components/hala/Common";
import { toast } from "@/components/hala/Toast";
import { notificationAPI } from "@/lib/api";
import { useBadges } from "@/stores/badgeStore";
import { useAuthStore, myId } from "@/stores/authStore";
import { cn, formatDate, idOf } from "@/lib/utils";

type N = {
  _id: string;
  type: string;
  title?: string;
  body?: string;
  image?: string;
  isOfficial?: boolean;
  sender?: { _id?: string; name?: string; profileImage?: string; isPremium?: boolean; isOfficial?: boolean } | null;
  data?: Record<string, unknown>;
  readBy?: { user?: string }[];
  isRead?: boolean;
  groupCount?: number;
  createdAt: string;
};

const PROFILE_TYPES = new Set(["new_like", "like", "super_like", "new_match", "match", "friend_request", "friend_accepted", "new_follower"]);

/** وجهة الإشعار بحسب نوعه وبياناته */
function targetOf(n: N): string | null {
  const d = n.data || {};
  const conv = (d.conversationId || d.conversation || d.relatedConversation) as string | undefined;
  const sender = idOf(n.sender) || (d.senderId as string) || (d.fromUserId as string) || (d.userId as string);
  if (n.type === "profile_view") return "/visitors";
  if (conv) return `/chats/${conv}`;
  if (PROFILE_TYPES.has(n.type) && sender && (n.groupCount || 1) <= 1) return `/profile/${sender}`;
  if (["new_like", "like", "super_like"].includes(n.type)) return "/premium";
  return null;
}

export default function NotificationsPage() {
  const router = useRouter();
  const me = myId(useAuthStore((s) => s.user));
  const [items, setItems] = useState<N[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);

  const load = useCallback(async (p: number) => {
    if (p === 1) setLoading(true); else setMore(true);
    const res = await notificationAPI.list(p);
    const d = res.data as { notifications?: N[]; totalPages?: number } | undefined;
    if (res.success && d?.notifications) {
      // readBy مأخوذ قبل التعليم التلقائي في الخادم، فنعرض حالة لحظة الفتح
      setItems((prev) => (p === 1 ? d.notifications! : [...prev, ...d.notifications!.filter((n) => !prev.some((x) => x._id === n._id))]));
      setPage(p);
      setTotalPages(d.totalPages || 1);
      // الخادم يعلّم الصفحة المجلوبة مقروءة (markRead=true افتراضياً)
      setTimeout(() => useBadges.getState().refresh(), 1500);
    } else if (!res.success) toast.error(res.message || "تعذّر جلب الإشعارات");
    setLoading(false); setMore(false);
  }, []);

  useEffect(() => { load(1); }, [load]);

  const unread = (n: N) => !(n.isRead || n.readBy?.some((r) => idOf(r.user) === me));

  const readAll = async () => {
    const r = await notificationAPI.readAll();
    if (r.success) {
      useBadges.getState().set(0);
      setItems((l) => l.map((n) => ({ ...n, isRead: true })));
    } else toast.error(r.message || "تعذّر");
  };

  const open = (n: N) => {
    if (unread(n)) {
      notificationAPI.read(n._id);
      setItems((l) => l.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
    }
    const t = targetOf(n);
    if (t) router.push(t);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <TopBar title="الإشعارات" actions={items.some(unread) ? (
        <IconButton label="قراءة الكل" onClick={readAll}><CheckCheck size={21} /></IconButton>
      ) : null} />
      {loading ? <CenterSpinner /> : !items.length ? (
        <EmptyState icon={Bell} title="لا إشعارات بعد" text="الإعجابات والزيارات وطلبات المحادثة تظهر هنا." />
      ) : (
        <>
          <ul className="divide-y divide-h-divider">
            {items.map((n) => {
              const official = n.isOfficial || n.sender?.isOfficial;
              const t = targetOf(n);
              return (
                <li key={n._id}>
                  <button onClick={() => open(n)} disabled={!t && !unread(n)}
                    className={cn("w-full flex items-start gap-3 px-4 py-3.5 text-start transition disabled:cursor-default",
                      unread(n) ? "bg-h-primary/[.06]" : "", t && "hover:bg-h-input/60")}>
                    {official ? (
                      <span className="w-[52px] h-[52px] rounded-full h-gradient flex items-center justify-center text-white shrink-0"><ShieldCheck size={26} /></span>
                    ) : (
                      <Avatar src={n.sender?.profileImage || n.image} name={n.sender?.name || n.title} size="md" premium={n.sender?.isPremium} />
                    )}
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="font-extrabold text-[15px] truncate">{n.title || (official ? "هلا" : n.sender?.name) || "إشعار"}</span>
                        {unread(n) && <span className="w-2 h-2 rounded-full bg-h-primary shrink-0" aria-label="غير مقروء" />}
                      </span>
                      {n.body && <span className="block text-sm text-h-text2 leading-6 mt-0.5 line-clamp-3">{n.body}</span>}
                      <span className="block text-xs text-h-text2 mt-1">{formatDate(n.createdAt)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {page < totalPages && (
            <div className="p-4"><Button variant="secondary" loading={more} onClick={() => load(page + 1)}>المزيد</Button></div>
          )}
        </>
      )}
    </div>
  );
}
