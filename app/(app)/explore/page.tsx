"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, RefreshCw, SlidersHorizontal, Star, X, Compass } from "lucide-react";
import SwipeCardView, { type SwipeCardHandle, type SwipeDir } from "@/components/explore/SwipeCard";
import Sheet from "@/components/hala/Sheet";
import Button from "@/components/hala/Button";
import Field from "@/components/hala/Field";
import Avatar from "@/components/hala/Avatar";
import HalaLogo from "@/components/hala/HalaLogo";
import { Chip, EmptyState, IconButton, Spinner } from "@/components/hala/Common";
import { toast } from "@/components/hala/Toast";
import { chatAPI, exploreAPI } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import type { SwipeCard } from "@/types";

type Filters = { gender: "" | "male" | "female"; minAge: number; maxAge: number; lastActiveWithin: "" | "1h" | "1d" | "1w" };
const FKEY = "hala-explore-filters";
const DEFAULT: Filters = { gender: "", minAge: 18, maxAge: 60, lastActiveWithin: "" };

type Match = { conversationId?: string; user?: { _id: string; name: string; profileImage?: string } };

export default function ExplorePage() {
  const router = useRouter();
  const me = useAuthStore((s) => s.user);
  const fetchConversation = useChatStore((s) => s.fetchConversation);
  const [cards, setCards] = useState<SwipeCard[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(DEFAULT);
  const [draft, setDraft] = useState<Filters>(DEFAULT);
  const [showFilters, setShowFilters] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);
  const [msgFor, setMsgFor] = useState<SwipeCard | null>(null);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const topRef = useRef<SwipeCardHandle>(null);
  const seen = useRef(new Set<string>());
  const busy = useRef(false);

  const load = useCallback(async (p: number, f: Filters, replace: boolean) => {
    if (busy.current) return;
    busy.current = true;
    if (replace) setLoading(true);
    const res = await exploreAPI.cards({
      page: p, limit: 10,
      gender: f.gender || undefined,
      minAge: f.minAge !== DEFAULT.minAge ? f.minAge : undefined,
      maxAge: f.maxAge !== DEFAULT.maxAge ? f.maxAge : undefined,
      lastActiveWithin: f.lastActiveWithin || undefined,
    });
    const d = res.data as { cards?: SwipeCard[]; totalPages?: number } | undefined;
    if (res.success && d?.cards) {
      const fresh = d.cards.filter((c) => !seen.current.has(c._id));
      fresh.forEach((c) => seen.current.add(c._id));
      setCards((prev) => (replace ? fresh : [...prev, ...fresh]));
      setPage(p);
      setTotalPages(d.totalPages || 1);
    } else if (!res.success) toast.error(res.message || "تعذّر جلب البطاقات");
    setLoading(false);
    busy.current = false;
  }, []);

  useEffect(() => {
    let f = DEFAULT;
    try { const s = localStorage.getItem(FKEY); if (s) f = { ...DEFAULT, ...JSON.parse(s) }; } catch {}
    setFilters(f); setDraft(f);
    load(1, f, true);
  }, [load]);

  // تحميل مسبق حين يبقى بطاقتان
  useEffect(() => {
    if (!loading && cards.length <= 2 && page < totalPages) load(page + 1, filters, false);
  }, [cards.length, loading, page, totalPages, filters, load]);

  const onSwiped = async (card: SwipeCard, d: SwipeDir) => {
    setCards((c) => c.filter((x) => x._id !== card._id));
    if (d === "superlike") {
      const r = await exploreAPI.superLike(card._id);
      if (r.success) {
        toast.success(`أُرسل سوبر لايك إلى ${card.name} ⭐`);
        const left = (r.data as { remaining?: number } | undefined)?.remaining;
        if (typeof left === "number" && left <= 1) toast.info(left === 0 ? "انتهت سوبر لايك اليوم" : "تبقّت سوبر لايك واحدة اليوم");
      } else {
        toast.error(r.message || "تعذّر إرسال السوبر لايك");
        setCards((c) => [card, ...c]);
      }
      return;
    }
    const r = await exploreAPI.swipe(card._id, d);
    if (!r.success) {
      if (r.status !== 400) toast.error(r.message || "تعذّر الحفظ");
      return;
    }
    const m = (r.data as { match?: Match } | undefined)?.match;
    if (m) {
      setMatch({ ...m, user: m.user || { _id: card._id, name: card.name, profileImage: card.profileImage } });
      if (m.conversationId) fetchConversation(String(m.conversationId));
    }
  };

  const sendRequest = async () => {
    if (!msgFor) return;
    setSending(true);
    const r = await chatAPI.request(msgFor._id, msg.trim() || undefined);
    setSending(false);
    if (r.success) {
      toast.success("أُرسل طلب المحادثة");
      const conv = (r.data as { conversation?: { _id: string }; conversationId?: string } | undefined);
      const cid = conv?.conversation?._id || conv?.conversationId;
      if (cid) fetchConversation(String(cid));
      setCards((c) => c.filter((x) => x._id !== msgFor._id));
      setMsgFor(null); setMsg("");
    } else toast.error(r.message || "تعذّر إرسال الطلب");
  };

  const applyFilters = () => {
    setFilters(draft);
    try { localStorage.setItem(FKEY, JSON.stringify(draft)); } catch {}
    setShowFilters(false);
    seen.current.clear();
    load(1, draft, true);
  };

  const visible = cards.slice(0, 3);
  const top = visible[0];

  return (
    <div className="flex flex-col h-[calc(100dvh-64px-env(safe-area-inset-bottom))] lg:h-dvh">
      <header className="h-14 shrink-0 px-4 flex items-center justify-between">
        <span className="lg:invisible"><HalaLogo size={32} /></span>
        <h1 className="sr-only">الاكتشاف</h1>
        <IconButton label="الفلاتر" onClick={() => { setDraft(filters); setShowFilters(true); }}>
          <SlidersHorizontal size={21} />
        </IconButton>
      </header>

      <div className="flex-1 min-h-0 flex flex-col items-center px-4 pb-3">
        <div className="relative w-full max-w-[420px] flex-1 min-h-[360px] max-h-[640px]">
          {loading && !cards.length ? (
            <div className="absolute inset-0 rounded-[28px] bg-h-chip animate-pulse flex items-center justify-center"><Spinner /></div>
          ) : !top ? (
            <div className="absolute inset-0 rounded-[28px] bg-h-card border border-h-border flex items-center justify-center">
              <EmptyState icon={Compass} title="لا أحد جديد حالياً" text="جرّب توسيع الفلاتر أو عُد بعد قليل."
                action={<Button variant="secondary" onClick={() => { seen.current.clear(); load(1, filters, true); }}><RefreshCw size={18} /> تحديث</Button>} />
            </div>
          ) : (
            [...visible].reverse().map((c) => {
              const depth = visible.indexOf(c);
              return (
                <SwipeCardView key={c._id} ref={depth === 0 ? topRef : undefined} card={c} top={depth === 0} depth={depth}
                  onSwiped={(d) => onSwiped(c, d)} onOpen={() => router.push(`/profile/${c._id}`)} />
              );
            })
          )}
        </div>

        {/* أزرار السحب (SwipeActionButtons) */}
        <div className="flex items-center justify-center gap-4 sm:gap-5 pt-4" aria-label="إجراءات">
          <ActionBtn label="تخطٍّ" disabled={!top} onClick={() => topRef.current?.fling("dislike")} className="w-14 h-14 text-[#EF4444]"><X size={28} strokeWidth={3} /></ActionBtn>
          <ActionBtn label="سوبر لايك" disabled={!top} onClick={() => topRef.current?.fling("superlike")} className="w-12 h-12 text-[#3B82F6]"><Star size={22} strokeWidth={2.6} className="fill-[#3B82F6]/20" /></ActionBtn>
          <ActionBtn label="إعجاب" disabled={!top} onClick={() => topRef.current?.fling("like")} className="w-[68px] h-[68px] !bg-none h-gradient text-white"><Heart size={32} className="fill-white" /></ActionBtn>
          <ActionBtn label="أرسل رسالة" disabled={!top} onClick={() => top && setMsgFor(top)} className="w-12 h-12 text-h-primary"><MessageCircle size={22} strokeWidth={2.6} /></ActionBtn>
        </div>
      </div>

      {/* الفلاتر */}
      <Sheet open={showFilters} onClose={() => setShowFilters(false)} title="الفلاتر">
        <div className="space-y-5 py-2">
          <div>
            <p className="text-sm font-bold mb-2">أظهر لي</p>
            <div className="flex gap-2">
              {([["", "الكل"], ["female", "نساء"], ["male", "رجال"]] as const).map(([v, l]) => (
                <Chip key={v} active={draft.gender === v} onClick={() => setDraft({ ...draft, gender: v })}>{l}</Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold mb-2">العمر: {draft.minAge} – {draft.maxAge}</p>
            <div className="flex gap-3 items-center">
              <input type="range" min={18} max={draft.maxAge} value={draft.minAge} onChange={(e) => setDraft({ ...draft, minAge: +e.target.value })} className="flex-1 accent-[var(--h-primary)]" aria-label="أقل عمر" />
              <input type="range" min={draft.minAge} max={80} value={draft.maxAge} onChange={(e) => setDraft({ ...draft, maxAge: +e.target.value })} className="flex-1 accent-[var(--h-primary)]" aria-label="أعلى عمر" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold mb-2">آخر نشاط</p>
            <div className="flex gap-2 flex-wrap">
              {([["", "أي وقت"], ["1h", "خلال ساعة"], ["1d", "اليوم"], ["1w", "هذا الأسبوع"]] as const).map(([v, l]) => (
                <Chip key={v} active={draft.lastActiveWithin === v} onClick={() => setDraft({ ...draft, lastActiveWithin: v })}>{l}</Chip>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setDraft(DEFAULT)}>إعادة ضبط</Button>
            <Button onClick={applyFilters}>تطبيق</Button>
          </div>
        </div>
      </Sheet>

      {/* رسالة مع طلب المحادثة */}
      <Sheet open={!!msgFor} onClose={() => setMsgFor(null)} title={msgFor ? `رسالة إلى ${msgFor.name}` : ""}>
        <div className="space-y-4 py-2">
          <p className="text-sm text-h-text2 leading-7">تصله كطلب محادثة، ويستطيع قبوله أو رفضه.</p>
          <Field textarea rows={3} maxLength={300} placeholder="اكتب رسالة لطيفة…" value={msg} onChange={(e) => setMsg(e.target.value)} />
          <Button loading={sending} onClick={sendRequest} disabled={!msg.trim()}>إرسال الطلب</Button>
        </div>
      </Sheet>

      {/* تطابق (MatchPopupView) */}
      <Sheet open={!!match} onClose={() => setMatch(null)}>
        {match && (
          <div className="text-center py-6 h-pop">
            <p className="text-3xl font-black h-gradient-text mb-1">تطابق جديد!</p>
            <p className="text-sm text-h-text2 mb-6">أنت و{match.user?.name} أعجبتما ببعض</p>
            <div className="flex justify-center items-center -space-x-4 rtl:space-x-reverse mb-6">
              <Avatar src={me?.profileImage} name={me?.name} size="xl" />
              <span className="relative z-10 w-12 h-12 rounded-full h-gradient flex items-center justify-center text-white shadow-lg"><Heart size={24} className="fill-white" /></span>
              <Avatar src={match.user?.profileImage} name={match.user?.name} size="xl" />
            </div>
            <div className="space-y-3">
              {match.conversationId && (
                <Link href={`/chats/${match.conversationId}`} className="block"><Button>أرسل رسالة</Button></Link>
              )}
              <Button variant="secondary" onClick={() => setMatch(null)}>متابعة الاكتشاف</Button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function ActionBtn({ label, className, children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button aria-label={label} title={label}
      className={`rounded-full bg-h-card border border-h-border h-shadow flex items-center justify-center transition active:scale-90 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 ${className}`}
      {...rest}>
      {children}
    </button>
  );
}
