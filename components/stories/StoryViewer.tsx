"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Camera, ChevronLeft, ChevronRight, Eye, EyeOff, Flag, Heart, Loader2, MoreHorizontal, SendHorizontal, X, Crown } from "lucide-react";
import Avatar from "@/components/hala/Avatar";
import { NameBadges } from "@/components/hala/Badges";
import Sheet, { Confirm } from "@/components/hala/Sheet";
import Button from "@/components/hala/Button";
import { toast } from "@/components/hala/Toast";
import { userAPI } from "@/lib/api";
import { storyApi, STORY_REACTIONS, type Story, type StoryOwner, type StoryViewersData } from "@/lib/storyApi";
import { storyBackground } from "@/lib/storyBackgrounds";
import { useStoryStore } from "@/stores/storyStore";
import { useAuthStore, myId } from "@/stores/authStore";
import { cn, formatDate, getImageUrl } from "@/lib/utils";

const DURATION = 5000;

export type OwnerInfo = { _id: string; name: string; profileImage?: string | null; isPremium?: boolean; isVerified?: boolean };
export type StoryReplyHandler = (owner: OwnerInfo, story: Story, text: string) => Promise<boolean>;

const REPORT_REASONS: [string, string][] = [
  ["inappropriate", "محتوى غير لائق"],
  ["harassment", "تحرّش أو إساءة"],
  ["spam", "إزعاج أو رسائل مكرّرة"],
  ["fake_profile", "حساب مزيّف أو انتحال"],
  ["other", "سبب آخر"],
];

export default function StoryViewer({ ownerIds, startIndex, mine, onClose, onReply }: {
  ownerIds: string[]; startIndex: number; mine?: boolean; onClose: () => void; onReply?: StoryReplyHandler;
}) {
  const me = useAuthStore((s) => s.user);
  const meId = myId(me);
  const feed = useStoryStore((s) => s.feed);
  const markSeen = useStoryStore((s) => s.markSeen);
  const refreshMine = useStoryStore((s) => s.refreshMine);

  const [ownerIdx, setOwnerIdx] = useState(startIndex);
  const [owner, setOwner] = useState<OwnerInfo | null>(null);
  const [stories, setStories] = useState<Story[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [holding, setHolding] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [sheet, setSheet] = useState<null | "options" | "report" | "viewers" | "delete">(null);
  const [replyFocus, setReplyFocus] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [viewers, setViewers] = useState<StoryViewersData | null>(null);
  const [reason, setReason] = useState("");
  const elapsed = useRef(0);
  const downAt = useRef(0);

  const ownerId = ownerIds[ownerIdx];
  const isMine = !!mine || ownerId === meId;
  const story = stories?.[idx];
  const paused = holding || hidden || !!sheet || replyFocus || !loaded || sending;

  // ── تحميل قصص صاحبها
  useEffect(() => {
    let alive = true;
    setStories(null); setIdx(0); setProgress(0); elapsed.current = 0;
    const fromFeed = feed.find((o) => o._id === ownerId) as StoryOwner | undefined;
    if (isMine && me) setOwner({ _id: meId, name: me.name, profileImage: me.profileImage, isPremium: me.isPremium });
    else if (fromFeed) setOwner(fromFeed);
    else {
      setOwner(null);
      userAPI.profile(ownerId).then((r) => {
        const u = (r.data as { user?: OwnerInfo } | undefined)?.user;
        if (alive && u) setOwner({ _id: ownerId, name: u.name, profileImage: u.profileImage, isPremium: u.isPremium });
      });
    }
    (isMine ? storyApi.me() : storyApi.user(ownerId)).then((r) => {
      if (!alive) return;
      const list = r.data?.stories || [];
      if (!list.length) { advanceOwner(1); return; }
      setStories(list);
      // ابدأ من أول غير مشاهَدة (للآخرين)
      const first = isMine ? 0 : Math.max(0, list.findIndex((s) => !s.viewed));
      setIdx(first === -1 ? 0 : first);
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId]);

  const advanceOwner = useCallback((dir: 1 | -1) => {
    const n = ownerIdx + dir;
    if (n < 0 || n >= ownerIds.length) { if (dir === 1) onClose(); return; }
    setOwnerIdx(n);
  }, [ownerIdx, ownerIds.length, onClose]);

  const next = useCallback(() => {
    if (!stories) return;
    if (idx + 1 < stories.length) { setIdx(idx + 1); setProgress(0); elapsed.current = 0; }
    else advanceOwner(1);
  }, [stories, idx, advanceOwner]);

  const prev = useCallback(() => {
    if (idx > 0) { setIdx(idx - 1); setProgress(0); elapsed.current = 0; }
    else if (ownerIdx > 0) advanceOwner(-1);
    else { setProgress(0); elapsed.current = 0; }
  }, [idx, ownerIdx, advanceOwner]);

  // ── عند عرض كل قصة: مشاهدة + حالة التحميل
  useEffect(() => {
    if (!story) return;
    setLoaded(story.kind === "text");
    setReply("");
    if (!isMine && !story.viewed) {
      storyApi.view(story._id);
      setStories((l) => l?.map((s) => (s._id === story._id ? { ...s, viewed: true } : s)) || l);
    }
    if (!isMine && stories && idx === stories.length - 1) markSeen(ownerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?._id]);

  // ── المؤقّت
  useEffect(() => {
    if (!story || paused) return;
    let raf = 0, last = performance.now();
    const tick = (t: number) => {
      elapsed.current += t - last; last = t;
      const p = Math.min(1, elapsed.current / DURATION);
      setProgress(p);
      if (p >= 1) { next(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [story, paused, next]);

  // ── لوحة المفاتيح والصفحة المخفية
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (sheet || replyFocus) return;
      if (e.key === "Escape") onClose();
      // RTL: السهم الأيسر = التالية، الأيمن = السابقة
      else if (e.key === "ArrowLeft") next();
      else if (e.key === "ArrowRight") prev();
    };
    const onVis = () => setHidden(document.visibilityState !== "visible");
    document.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVis);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVis);
      document.body.style.overflow = prevOverflow;
    };
  }, [next, prev, onClose, sheet, replyFocus]);

  const react = async (emoji: string) => {
    if (!story) return;
    const nextEmoji = story.myReaction === emoji ? null : emoji;
    setStories((l) => l?.map((s) => (s._id === story._id ? { ...s, myReaction: nextEmoji } : s)) || l);
    const r = await storyApi.react(story._id, nextEmoji);
    if (!r.success) {
      toast.error(r.message || "تعذّر التفاعل");
      setStories((l) => l?.map((s) => (s._id === story._id ? { ...s, myReaction: story.myReaction } : s)) || l);
    }
  };

  const sendReply = async () => {
    if (!story || !owner || !reply.trim() || !onReply) return;
    setSending(true);
    const ok = await onReply(owner, story, reply.trim());
    setSending(false);
    if (ok) { setReply(""); setReplyFocus(false); toast.success("أُرسل ردّك"); }
  };

  const openViewers = async () => {
    if (!story) return;
    setSheet("viewers"); setViewers(null);
    const r = await storyApi.viewers(story._id);
    if (r.success && r.data) setViewers(r.data); else toast.error(r.message || "تعذّر جلب المشاهدين");
  };

  const del = async () => {
    if (!story) return;
    const r = await storyApi.remove(story._id);
    if (!r.success) { toast.error(r.message || "تعذّر الحذف"); return; }
    toast.success("حُذفت القصة");
    setSheet(null);
    refreshMine();
    const left = (stories || []).filter((s) => s._id !== story._id);
    if (!left.length) { onClose(); return; }
    setStories(left); setIdx(Math.min(idx, left.length - 1)); setProgress(0); elapsed.current = 0;
  };

  const mute = async () => {
    if (!owner) return;
    const r = await storyApi.mute(owner._id);
    setSheet(null);
    if (r.success) { toast.success(`أُخفيت قصص ${owner.name}`); advanceOwner(1); }
    else toast.error(r.message || "تعذّر");
  };

  const report = async () => {
    if (!story || !owner || !reason) return;
    const r = await storyApi.report(owner._id, story._id, reason);
    setSheet(null); setReason("");
    if (r.success) { toast.success("وصل بلاغك، شكراً لك"); next(); }
    else toast.error(r.message || "تعذّر إرسال البلاغ");
  };

  const segments = useMemo(() => stories?.map((s, i) => (i < idx ? 1 : i === idx ? progress : 0)) || [], [stories, idx, progress]);

  return (
    <div className="fixed inset-0 z-[95] bg-black text-white flex items-center justify-center select-none" role="dialog" aria-label="القصص">
      {/* أسهم سطح المكتب */}
      <button onClick={prev} aria-label="السابقة" className="hidden md:flex absolute right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center"><ChevronRight size={26} /></button>
      <button onClick={next} aria-label="التالية" className="hidden md:flex absolute left-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center"><ChevronLeft size={26} /></button>

      <div className="relative w-full h-full md:h-[min(92dvh,860px)] md:w-auto md:aspect-[9/16] md:rounded-2xl overflow-hidden bg-[#111]">
        {/* المحتوى */}
        {!story ? (
          <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="animate-spin" size={32} /></div>
        ) : story.kind === "text" ? (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center" style={{ background: storyBackground(story.background) }}>
            <p className="text-[26px] leading-[1.7] font-extrabold whitespace-pre-wrap break-words" dir="auto">{story.text}</p>
          </div>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={story._id} src={getImageUrl(story.imageUrl || undefined)} alt={`قصة ${owner?.name || ""}`} draggable={false}
              onLoad={() => setLoaded(true)} onError={() => setLoaded(true)}
              className="absolute inset-0 w-full h-full object-contain" />
            {!loaded && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="animate-spin" size={32} /></div>}
          </>
        )}

        {/* مناطق اللمس: الثلث الأيمن (البداية في RTL) = السابقة، الباقي = التالية — كما في iOS */}
        <div className="absolute inset-0 flex" dir="rtl"
          onPointerDown={() => { downAt.current = Date.now(); setHolding(true); }} onPointerUp={() => setHolding(false)} onPointerLeave={() => setHolding(false)} onPointerCancel={() => setHolding(false)}>
          {/* الضغط المطوّل يوقف العرض فقط — لا ينتقل عند الإفلات */}
          <button className="w-[35%] h-full" aria-label="القصة السابقة" onClick={() => Date.now() - downAt.current < 350 && prev()} />
          <button className="flex-1 h-full" aria-label="القصة التالية" onClick={() => Date.now() - downAt.current < 350 && next()} />
        </div>

        {/* الترويسة */}
        <div className="absolute top-0 inset-x-0 p-3 pt-[max(.75rem,env(safe-area-inset-top))] bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
          <div className="flex gap-1" dir="rtl">
            {segments.map((p, i) => (
              <span key={i} className="h-[3px] flex-1 rounded-full bg-white/35 overflow-hidden">
                <span className="block h-full bg-white" style={{ width: `${p * 100}%` }} />
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2.5 mt-3 pointer-events-auto">
            {owner ? (
              <Link href={isMine ? "/profile" : `/profile/${owner._id}`} onClick={onClose} className="flex items-center gap-2.5 min-w-0">
                <Avatar src={owner.profileImage} name={owner.name} size="sm" />
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 font-extrabold text-[15px] truncate">{isMine ? "قصتك" : owner.name}<NameBadges u={owner} size={14} /></span>
                  {story && <span className="block text-xs text-white/75">{formatDate(story.createdAt)}</span>}
                </span>
              </Link>
            ) : <span className="flex-1" />}
            {story?.held && <span className="text-[11px] font-bold bg-[#F59E0B] text-black rounded-full px-2 py-0.5">قيد المراجعة</span>}
            <span className="flex-1" />
            {story && (
              <button onClick={() => setSheet(isMine ? "delete" : "options")} aria-label="خيارات" className="w-9 h-9 rounded-full hover:bg-white/15 flex items-center justify-center"><MoreHorizontal size={22} /></button>
            )}
            <button onClick={onClose} aria-label="إغلاق" className="w-9 h-9 rounded-full hover:bg-white/15 flex items-center justify-center"><X size={22} /></button>
          </div>
        </div>

        {/* الأسفل */}
        {story && (
          <div className="absolute bottom-0 inset-x-0 p-3 pb-[max(.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-black/70 to-transparent">
            {isMine ? (
              <button onClick={openViewers} className="mx-auto flex items-center gap-4 rounded-full bg-white/15 backdrop-blur px-4 h-10 text-sm font-bold">
                <span className="flex items-center gap-1.5"><Eye size={17} /> {story.viewCount || 0}</span>
                <span className="flex items-center gap-1.5"><Heart size={16} /> {story.reactionCount || 0}</span>
                <span className="flex items-center gap-1.5"><Camera size={16} /> {story.screenshotCount || 0}</span>
              </button>
            ) : (
              <div className="space-y-2.5">
                <div className="flex justify-center gap-1.5" aria-label="التفاعلات">
                  {STORY_REACTIONS.map((e) => (
                    <button key={e} onClick={() => react(e)} aria-pressed={story.myReaction === e} aria-label={`تفاعل ${e}`}
                      className={cn("w-10 h-10 rounded-full text-xl transition active:scale-90", story.myReaction === e ? "bg-white/35 scale-110" : "bg-white/10 hover:bg-white/20")}>{e}</button>
                  ))}
                </div>
                {onReply && (
                  <div className="flex items-center gap-2">
                    <input value={reply} onChange={(e) => setReply(e.target.value)} maxLength={500} dir="auto"
                      onFocus={() => setReplyFocus(true)} onBlur={() => !reply && setReplyFocus(false)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); sendReply(); } else if (e.key === "Escape") { (e.target as HTMLInputElement).blur(); setReplyFocus(false); } }}
                      placeholder={`ردّ على ${owner?.name || "القصة"}…`} aria-label="ردّ على القصة"
                      className="flex-1 h-11 rounded-full bg-transparent border border-white/50 px-4 text-[15px] text-white placeholder:text-white/65 outline-none focus:border-white" />
                    <button onClick={sendReply} disabled={!reply.trim() || sending} aria-label="إرسال"
                      className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-40">
                      {sending ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={19} className="-scale-x-100" />}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* أوراق (فوق العارض) */}
      <div className="hala contents" style={{ background: "transparent" }}>
        <Sheet open={sheet === "options"} onClose={() => setSheet(null)}>
          <div className="py-3 divide-y divide-h-divider">
            <button onClick={mute} className="w-full flex items-center gap-3 py-3.5 font-bold"><EyeOff size={20} /> إخفاء قصص {owner?.name}</button>
            <button onClick={() => setSheet("report")} className="w-full flex items-center gap-3 py-3.5 font-bold text-h-error"><Flag size={20} /> إبلاغ عن القصة</button>
          </div>
        </Sheet>
        <Sheet open={sheet === "report"} onClose={() => { setSheet(null); setReason(""); }} title="إبلاغ عن القصة">
          <div className="space-y-2 py-2">
            {REPORT_REASONS.map(([k, l]) => (
              <button key={k} onClick={() => setReason(k)} aria-pressed={reason === k}
                className={cn("w-full text-start px-4 py-3 rounded-xl border-[1.5px] font-semibold text-[15px]", reason === k ? "border-h-primary text-h-primary" : "border-h-border")}>{l}</button>
            ))}
            <Button onClick={report} disabled={!reason} className="mt-2">إرسال البلاغ</Button>
          </div>
        </Sheet>
        <Confirm open={sheet === "delete"} onClose={() => setSheet(null)} onConfirm={del} danger confirmText="حذف" title="حذف القصة؟" message="تختفي من عند الجميع فوراً." />
        <Sheet open={sheet === "viewers"} onClose={() => setSheet(null)} title="المشاهدات" wide>
          {!viewers ? <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-h-primary" /></div> : (
            <div className="py-2 space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-h-input py-3"><p className="text-xl font-extrabold">{viewers.viewCount}</p><p className="text-xs text-h-text2">مشاهدة</p></div>
                <div className="rounded-xl bg-h-input py-3"><p className="text-xl font-extrabold">{viewers.reactionCount}</p><p className="text-xs text-h-text2">تفاعل</p></div>
                <div className="rounded-xl bg-h-input py-3"><p className="text-xl font-extrabold">{viewers.screenshotCount}</p><p className="text-xs text-h-text2">لقطة شاشة</p></div>
              </div>
              {!!viewers.reactions.length && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {viewers.reactions.map((r) => <span key={r.emoji} className="h-8 px-3 rounded-full bg-h-chip text-sm font-bold flex items-center gap-1">{r.emoji} {r.count}</span>)}
                </div>
              )}
              {!!viewers.screenshotters.length && (
                <div>
                  <p className="text-xs font-bold text-h-text2 mb-2">التقطوا الشاشة</p>
                  <ul className="space-y-2">{viewers.screenshotters.map((v) => (
                    <li key={v.viewer._id} className="flex items-center gap-3"><Avatar src={v.viewer.profileImage} name={v.viewer.name} size="sm" /><span className="font-bold flex-1 truncate">{v.viewer.name}</span><Camera size={16} className="text-h-text2" /></li>
                  ))}</ul>
                </div>
              )}
              {viewers.isPremiumRequired ? (
                <Link href="/premium" onClick={onClose} className="flex items-center gap-3 rounded-2xl p-4 bg-h-gold/15 border border-h-gold/40">
                  <Crown className="text-h-warning shrink-0" />
                  <span className="text-sm font-bold">اعرف من شاهد قصتك وتفاعل معها — مع هلا+</span>
                </Link>
              ) : viewers.viewers.length ? (
                <div>
                  <p className="text-xs font-bold text-h-text2 mb-2">المشاهدون</p>
                  <ul className="space-y-2.5">{viewers.viewers.map((v) => (
                    <li key={v.viewer._id} className="flex items-center gap-3">
                      <Avatar src={v.viewer.profileImage} name={v.viewer.name} size="sm" />
                      <span className="flex-1 min-w-0"><span className="block font-bold truncate">{v.viewer.name}</span><span className="block text-xs text-h-text2">{formatDate(v.viewedAt)}</span></span>
                      {v.reaction && <span className="text-xl">{v.reaction}</span>}
                    </li>
                  ))}</ul>
                </div>
              ) : <p className="text-center text-sm text-h-text2 py-4">لا مشاهدات بعد</p>}
            </div>
          )}
        </Sheet>
      </div>
    </div>
  );
}

