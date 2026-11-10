"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, CheckCheck, Image as ImageIcon, Inbox, MessageCircle, Search, BellOff } from "lucide-react";
import Avatar from "@/components/hala/Avatar";
import { NameBadges } from "@/components/hala/Badges";
import { Chip, EmptyState, Spinner, TopBar } from "@/components/hala/Common";
import { useChatStore, senderIdOf } from "@/stores/chatStore";
import { usePresence } from "@/stores/presenceStore";
import { chatTime, cn, idOf, isRecentlyActive } from "@/lib/utils";
import type { Conversation, Message, User } from "@/types";

type Tab = "all" | "unread" | "requests" | "sent";

export function partnerOf(c: Conversation, me: string): User | undefined {
  return c.participants?.find((p) => idOf(p) !== me) || c.participants?.[0];
}

export function blockStateOf(c?: Conversation | null): "iBlocked" | "blockedMe" | null {
  const b = c?.blockState;
  if (!b) return null;
  if (typeof b === "string") return b;
  return b.iBlocked ? "iBlocked" : b.blockedMe ? "blockedMe" : null;
}

export function previewText(m?: Message | null): string {
  if (!m) return "";
  if (m.isDeleted) return "تم حذف هذه الرسالة";
  switch (m.type) {
    case "image": return m.imageSource === "sticker" ? "ملصق" : "📷 صورة";
    case "audio": return "🎤 رسالة صوتية";
    case "video": return "🎥 فيديو";
    case "location": return "📍 موقع";
    case "game": return "🎲 لعبة";
    case "sticker": return "ملصق";
    default: return m.content || "";
  }
}

export default function ConversationList() {
  const pathname = usePathname();
  const { conversations, loaded, me, typing } = useChatStore();
  const online = usePresence((s) => s.online);
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");

  const requests = conversations.filter((c) => c.status === "pending" && c.creator !== me);
  const sent = conversations.filter((c) => c.status === "pending" && c.creator === me);

  const list = useMemo(() => {
    let l: Conversation[];
    if (tab === "requests") l = requests;
    else if (tab === "sent") l = sent;
    else {
      l = conversations.filter((c) => c.status !== "pending");
      if (tab === "unread") l = l.filter((c) => (c.unreadCount || 0) > 0);
    }
    const s = q.trim();
    if (s) l = l.filter((c) => partnerOf(c, me)?.name?.includes(s));
    return l;
  }, [conversations, tab, q, me, requests, sent]);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="المحادثات" sub={
        <div className="px-3 sm:px-5 pb-3 space-y-3">
          <label className="flex items-center gap-2 h-10 px-3 rounded-xl bg-h-input text-h-text2">
            <Search size={18} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم" className="bg-transparent outline-none flex-1 text-sm text-h-text" aria-label="بحث في المحادثات" />
          </label>
          <div className="flex gap-2 overflow-x-auto h-no-scrollbar">
            <Chip active={tab === "all"} onClick={() => setTab("all")}>الكل</Chip>
            <Chip active={tab === "unread"} onClick={() => setTab("unread")}>غير مقروءة</Chip>
            <Chip active={tab === "requests"} onClick={() => setTab("requests")}>الطلبات{requests.length ? ` (${requests.length})` : ""}</Chip>
            <Chip active={tab === "sent"} onClick={() => setTab("sent")}>طلباتي</Chip>
          </div>
        </div>
      } />

      <div className="flex-1 overflow-y-auto h-scroll">
        {!loaded && !conversations.length ? (
          <div className="py-16 flex justify-center"><Spinner /></div>
        ) : !list.length ? (
          tab === "requests" ? <EmptyState icon={Inbox} title="لا طلبات جديدة" text="طلبات المحادثة التي تصلك تظهر هنا." />
            : tab === "sent" ? <EmptyState icon={Inbox} title="لا طلبات مُرسلة" text="الطلبات التي ترسلها بانتظار القبول تظهر هنا." />
            : <EmptyState icon={MessageCircle} title={q ? "لا نتائج" : "لا محادثات بعد"} text={q ? undefined : "ابدأ من الاكتشاف: أعجب أو أرسل رسالة."} />
        ) : (
          <ul>
            {list.map((c) => {
              const p = partnerOf(c, me);
              const active = pathname === `/chats/${c._id}`;
              const unread = c.unreadCount || 0;
              const lm = c.lastMessage;
              const mine = lm && senderIdOf(lm) === me;
              const isOnline = p && (online[idOf(p)] ?? isRecentlyActive(p));
              const blocked = blockStateOf(c);
              const preview = typing[c._id] ? "يكتب…" : c.status === "pending" && c.creator !== me
                ? (c.initialMessage?.content || "يريد محادثتك")
                : previewText(lm) || (c.status === "pending" ? "بانتظار القبول" : "ابدأ المحادثة");
              return (
                <li key={c._id}>
                  <Link href={`/chats/${c._id}`}
                    className={cn("flex items-center gap-3 px-4 py-3 transition", active ? "bg-h-primary/10" : "hover:bg-h-input/60")}>
                    <Avatar src={blocked === "blockedMe" ? null : p?.profileImage} name={p?.name} size="md" online={!blocked && !!isOnline} premium={p?.isPremium} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("truncate text-[15px]", unread ? "font-extrabold" : "font-bold")}>{p?.name || "مستخدم"}</span>
                        <NameBadges u={p} size={14} />
                        {c.isMuted && <BellOff size={13} className="text-h-text2" />}
                        <span className={cn("ms-auto text-xs shrink-0", unread ? "text-h-primary font-bold" : "text-h-text2")}>
                          {lm?.createdAt ? chatTime(lm.createdAt) : c.updatedAt ? chatTime(c.updatedAt) : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {mine && !typing[c._id] && (lm?.isRead ? <CheckCheck size={15} className="text-h-primary shrink-0" /> : lm?.isDelivered ? <CheckCheck size={15} className="text-h-text2 shrink-0" /> : <Check size={15} className="text-h-text2 shrink-0" />)}
                        {lm?.type === "image" && !typing[c._id] && <ImageIcon size={14} className="text-h-text2 shrink-0 hidden" />}
                        <span className={cn("truncate text-sm", typing[c._id] ? "text-h-primary font-semibold" : unread ? "text-h-text font-semibold" : "text-h-text2")}>
                          {blocked === "blockedMe" ? "غير متاح" : blocked === "iBlocked" ? "محظور" : preview}
                        </span>
                        {unread > 0 && (
                          <span className="ms-auto min-w-[20px] h-5 px-1.5 rounded-full h-gradient text-white text-[11px] font-extrabold flex items-center justify-center shrink-0">{unread > 99 ? "99+" : unread}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
