"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, MessageCircle, MoreHorizontal, UserMinus, UserPlus, Users, X } from "lucide-react";
import Avatar from "@/components/hala/Avatar";
import { NameBadges } from "@/components/hala/Badges";
import Sheet, { Confirm } from "@/components/hala/Sheet";
import { Chip, EmptyState, Spinner, TopBar } from "@/components/hala/Common";
import { toast } from "@/components/hala/Toast";
import { friendAPI } from "@/lib/api";
import { useChatStore } from "@/stores/chatStore";
import { usePresence } from "@/stores/presenceStore";
import { formatDate, isRecentlyActive, lastSeenText } from "@/lib/utils";
import type { User } from "@/types";

type Friend = { friendshipId: string; since?: string; conversationId?: string | null; user: User & { _id: string } };
type Req = { friendshipId: string; createdAt: string; user: User & { _id: string } };
type Sug = { conversationId?: string; messageCount?: number; user: User & { _id: string } };
type Tab = "friends" | "requests" | "suggestions";

export default function FriendsPage() {
  const [tab, setTab] = useState<Tab>("friends");
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [requests, setRequests] = useState<Req[]>([]);
  const [sugs, setSugs] = useState<Sug[]>([]);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [menu, setMenu] = useState<Friend | null>(null);
  const [remove, setRemove] = useState<Friend | null>(null);
  const online = usePresence((s) => s.online);
  const fetchConversation = useChatStore((s) => s.fetchConversation);

  const load = useCallback(async () => {
    const r = await friendAPI.bootstrap();
    const d = r.data as { friends?: { friends?: Friend[] }; requests?: { requests?: Req[] }; suggestions?: { suggestions?: Sug[] } } | undefined;
    if (r.success && d) {
      setFriends(d.friends?.friends || []);
      setRequests(d.requests?.requests || []);
      setSugs(d.suggestions?.suggestions || []);
    } else { setFriends([]); toast.error(r.message || "تعذّر جلب الأصدقاء"); }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (friends && !friends.length && requests.length) setTab("requests"); }, [friends, requests.length]);

  const respond = async (q: Req, accept: boolean) => {
    const r = accept ? await friendAPI.accept(q.friendshipId) : await friendAPI.decline(q.friendshipId);
    if (!r.success) return toast.error(r.message || "تعذّر");
    setRequests((l) => l.filter((x) => x.friendshipId !== q.friendshipId));
    if (accept) {
      toast.success(`أصبحت صديقاً لـ${q.user.name}`);
      const cid = (r.data as { conversationId?: string } | undefined)?.conversationId;
      if (cid) fetchConversation(String(cid));
      load();
    }
  };

  const add = async (s: Sug) => {
    const r = await friendAPI.request(s.user._id);
    if (r.success || r.status === 409) { setSent((x) => new Set(x).add(s.user._id)); if (r.success) toast.success("أُرسل طلب الصداقة"); }
    else toast.error(r.message || "تعذّر");
  };

  const doRemove = async () => {
    if (!remove) return;
    const r = await friendAPI.remove(remove.user._id);
    if (r.success) { setFriends((l) => (l || []).filter((x) => x.friendshipId !== remove.friendshipId)); toast.success("أُزيل من الأصدقاء"); }
    else toast.error(r.message || "تعذّر");
    setRemove(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <TopBar title="الأصدقاء" back sub={
        <div className="px-3 sm:px-5 pb-3 flex gap-2 overflow-x-auto h-no-scrollbar">
          <Chip active={tab === "friends"} onClick={() => setTab("friends")}>أصدقائي{friends?.length ? ` (${friends.length})` : ""}</Chip>
          <Chip active={tab === "requests"} onClick={() => setTab("requests")}>الطلبات{requests.length ? ` (${requests.length})` : ""}</Chip>
          <Chip active={tab === "suggestions"} onClick={() => setTab("suggestions")}>اقتراحات</Chip>
        </div>
      } />

      {!friends ? <div className="py-20 flex justify-center"><Spinner /></div> : (
        <ul className="divide-y divide-h-divider">
          {tab === "friends" && (friends.length ? friends.map((f) => {
            const on = online[f.user._id] ?? isRecentlyActive(f.user);
            return (
              <li key={f.friendshipId} className="flex items-center gap-3 px-4 py-3">
                <Link href={`/profile/${f.user._id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar src={f.user.profileImage} name={f.user.name} size="md" online={!!on} premium={f.user.isPremium} />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5"><span className="font-bold truncate">{f.user.name}</span><NameBadges u={f.user} size={14} /></span>
                    <span className="block text-xs text-h-text2 truncate">{on ? "متصل الآن" : lastSeenText(f.user) || (f.since ? `صديقان منذ ${formatDate(f.since)}` : "")}</span>
                  </span>
                </Link>
                {f.conversationId && <Link href={`/chats/${f.conversationId}`} aria-label={`مراسلة ${f.user.name}`} className="w-10 h-10 rounded-full bg-h-primary/10 text-h-primary flex items-center justify-center"><MessageCircle size={19} /></Link>}
                {/* ••• ظاهر دائماً (كان الحذف في الضغط المطوّل وحده في iOS) */}
                <button onClick={() => setMenu(f)} aria-label="خيارات" className="w-10 h-10 rounded-full hover:bg-h-input flex items-center justify-center text-h-text2"><MoreHorizontal size={20} /></button>
              </li>
            );
          }) : <EmptyState icon={Users} title="لا أصدقاء بعد" text="أضف من تحادثهم من ملفاتهم، أو من الاقتراحات." action={<button onClick={() => setTab("suggestions")} className="text-h-primary font-bold">عرض الاقتراحات</button>} />)}

          {tab === "requests" && (requests.length ? requests.map((q) => (
            <li key={q.friendshipId} className="flex items-center gap-3 px-4 py-3">
              <Link href={`/profile/${q.user._id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar src={q.user.profileImage} name={q.user.name} size="md" premium={q.user.isPremium} />
                <span className="min-w-0"><span className="block font-bold truncate">{q.user.name}</span><span className="block text-xs text-h-text2">{formatDate(q.createdAt)}</span></span>
              </Link>
              <button onClick={() => respond(q, true)} aria-label={`قبول ${q.user.name}`} className="h-9 px-3 rounded-full h-gradient text-white text-sm font-bold flex items-center gap-1"><Check size={16} /> قبول</button>
              <button onClick={() => respond(q, false)} aria-label={`رفض ${q.user.name}`} className="w-9 h-9 rounded-full bg-h-chip text-h-text2 flex items-center justify-center"><X size={17} /></button>
            </li>
          )) : <EmptyState icon={UserPlus} title="لا طلبات صداقة" />)}

          {tab === "suggestions" && (sugs.length ? sugs.map((s) => (
            <li key={s.user._id} className="flex items-center gap-3 px-4 py-3">
              <Link href={`/profile/${s.user._id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar src={s.user.profileImage} name={s.user.name} size="md" premium={s.user.isPremium} />
                <span className="min-w-0"><span className="block font-bold truncate">{s.user.name}</span>{!!s.messageCount && <span className="block text-xs text-h-text2">تتحادثان ({s.messageCount} رسالة)</span>}</span>
              </Link>
              {sent.has(s.user._id)
                ? <span className="text-sm text-h-text2 font-bold">أُرسل</span>
                : <button onClick={() => add(s)} className="h-9 px-3 rounded-full bg-h-primary/10 text-h-primary text-sm font-bold flex items-center gap-1"><UserPlus size={16} /> إضافة</button>}
            </li>
          )) : <EmptyState icon={Users} title="لا اقتراحات الآن" text="نقترح عليك من تتحادثان كثيراً." />)}
        </ul>
      )}

      <Sheet open={!!menu} onClose={() => setMenu(null)} title={menu?.user.name}>
        <div className="py-2 divide-y divide-h-divider">
          {menu && <Link href={`/profile/${menu.user._id}`} className="flex items-center gap-3 py-3.5 font-bold">عرض الملف</Link>}
          <button onClick={() => { setRemove(menu); setMenu(null); }} className="w-full flex items-center gap-3 py-3.5 font-bold text-h-error"><UserMinus size={19} /> إزالة من الأصدقاء</button>
        </div>
      </Sheet>
      <Confirm open={!!remove} onClose={() => setRemove(null)} onConfirm={doRemove} danger confirmText="إزالة" title={`إزالة ${remove?.user.name || ""} من الأصدقاء؟`} message="تبقى محادثتكما كما هي." />
    </div>
  );
}
