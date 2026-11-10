"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, Copy, Flag, Smile, Mic, Trash2 as TrashIcon, Image as ImageIcon, Timer, Video, MapPin, Gamepad2, Plus, MoreVertical, Reply, SendHorizontal, Trash2, UserRound, Ban, BellOff, X, Bell } from "lucide-react";
import Avatar from "@/components/hala/Avatar";
import { NameBadges } from "@/components/hala/Badges";
import Sheet, { Confirm } from "@/components/hala/Sheet";
import Button from "@/components/hala/Button";
import { Spinner } from "@/components/hala/Common";
import { toast } from "@/components/hala/Toast";
import MessageBubble from "@/components/chat/MessageBubble";
import ReportSheet from "@/components/chat/ReportSheet";
import StickerPanel from "@/components/chat/StickerPanel";
import { GameCard, GamePickerSheet } from "@/components/chat/games";
import { useStickers } from "@/lib/stickers";
import { useAuthStore } from "@/stores/authStore";
import { blockStateOf, partnerOf } from "@/components/chat/ConversationList";
import { useChatStore, senderIdOf } from "@/stores/chatStore";
import { usePresence } from "@/stores/presenceStore";
import { emitSocket } from "@/hooks/useRealtime";
import { chatAPI, privacyAPI } from "@/lib/api";
import { compressImage } from "@/lib/image";
import { VoiceRecorder, VOICE_MAX_SECONDS } from "@/lib/voice";
import { cn, idOf, isRecentlyActive, lastSeenText } from "@/lib/utils";
import type { Message } from "@/types";

const REACTIONS = ["❤️", "😂", "😮", "😢", "👍", "🔥"];

function dayLabel(d: string) {
  const x = new Date(d), now = new Date();
  if (x.toDateString() === now.toDateString()) return "اليوم";
  const y = new Date(now); y.setDate(y.getDate() - 1);
  if (x.toDateString() === y.toDateString()) return "أمس";
  return x.toLocaleDateString("ar-SA", { weekday: "long", day: "numeric", month: "long" });
}

export default function ChatRoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const me = useChatStore((s) => s.me);
  const conv = useChatStore((s) => s.conversations.find((c) => c._id === id));
  const loadedList = useChatStore((s) => s.loaded);
  const thread = useChatStore((s) => s.threads[id]);
  const typing = useChatStore((s) => !!s.typing[id]);
  const st = useChatStore.getState;
  const partner = conv ? partnerOf(conv, me) : undefined;
  const partnerOnline = usePresence((s) => (partner ? s.online[idOf(partner)] : undefined));

  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [menuMsg, setMenuMsg] = useState<Message | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [report, setReport] = useState(false);
  const [confirm, setConfirm] = useState<null | "block" | "delete" | "reject">(null);
  const [busy, setBusy] = useState(false);
  const [promo, setPromo] = useState<{ title?: string; message?: string; serverMessage?: string } | null>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [missing, setMissing] = useState(false);
  const [stickers, setStickers] = useState(false);
  const [attach, setAttach] = useState(false);
  const [pending, setPending] = useState<null | { kind: "ephemeral-photo"; file: File } | { kind: "video"; file: File; duration: number; dims: { width: number; height: number } }>(null);
  const [recording, setRecording] = useState<{ startedAt: number; level: number } | null>(null);
  const [recTick, setRecTick] = useState(0);
  const [locating, setLocating] = useState(false);
  const recorder = useRef<VoiceRecorder | null>(null);
  const [games, setGames] = useState(false);
  const ephemeralRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const premium = useAuthStore((s) => !!s.user?.isPremium);

  const scroller = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingSent = useRef(0);
  const typingStop = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevHeight = useRef<number | null>(null);

  const items = useMemo(() => thread?.items || [], [thread]);

  // ── الدخول/الخروج من المحادثة
  useEffect(() => {
    st().setActive(id);
    st().loadMessages(id);
    emitSocket("join-conversation", { conversationId: id });
    return () => {
      emitSocket("leave-conversation", { conversationId: id });
      if (typingStop.current) { clearTimeout(typingStop.current); emitSocket("stop-typing", { conversationId: id }); }
      if (st().active === id) st().setActive(null);
    };
  }, [id, st]);

  // محادثة ليست في القائمة (رابط مباشر / إشعار)
  useEffect(() => {
    if (!conv && loadedList) st().fetchConversation(id).then((c) => !c && setMissing(true));
  }, [conv, loadedList, id, st]);

  // ── قراءة: عند الفتح وعند وصول رسالة من الطرف الآخر والصفحة ظاهرة
  const lastOther = useMemo(() => [...items].reverse().find((m) => senderIdOf(m) !== me && !m.local)?._id, [items, me]);
  // ⚠️ لا تجعل conv نفسه اعتماداً: markRead يعدّل المحادثة فيتكرّر بلا نهاية (React #185)
  const convStatus = conv?.status, convCreator = conv?.creator, hasConv = !!conv;
  const markedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!hasConv || (convStatus === "pending" && convCreator !== me)) return; // لا قراءة قبل القبول
    const key = `${id}:${lastOther || ""}`;
    const mark = () => {
      if (document.visibilityState !== "visible" || markedFor.current === key) return;
      markedFor.current = key;
      st().markRead(id);
    };
    mark();
    document.addEventListener("visibilitychange", mark);
    return () => document.removeEventListener("visibilitychange", mark);
  }, [id, lastOther, convStatus, convCreator, hasConv, me, st]);

  // ── التمرير: للأسفل عند رسالة جديدة إن كان في الأسفل، والحفاظ على الموضع عند تحميل الأقدم
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (prevHeight.current !== null) {
      el.scrollTop += el.scrollHeight - prevHeight.current;
      prevHeight.current = null;
      return;
    }
    if (atBottom) el.scrollTop = el.scrollHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, typing]);

  useEffect(() => {
    if (thread?.loaded) requestAnimationFrame(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; });
  }, [thread?.loaded, id]);

  // الصور تُحمَّل بعد الرسم فيطول المحتوى: ابقَ في الأسفل إن كان المستخدم فيه
  const content = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  useEffect(() => { atBottomRef.current = atBottom; }, [atBottom]);
  useEffect(() => {
    const el = content.current, sc = scroller.current;
    if (!el || !sc || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => { if (atBottomRef.current && prevHeight.current === null) sc.scrollTop = sc.scrollHeight; });
    ro.observe(el);
    return () => ro.disconnect();
  }, [thread?.loaded]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
    if (el.scrollTop < 120 && thread?.hasMore && !thread.loadingOlder) {
      prevHeight.current = el.scrollHeight;
      st().loadOlder(id);
    }
  };

  // ── الكتابة
  const onType = (v: string) => {
    setText(v);
    if (!v.trim()) return;
    const now = Date.now();
    if (now - typingSent.current > 2500) { emitSocket("typing", { conversationId: id }); typingSent.current = now; }
    if (typingStop.current) clearTimeout(typingStop.current);
    typingStop.current = setTimeout(() => { emitSocket("stop-typing", { conversationId: id }); typingSent.current = 0; typingStop.current = null; }, 3000);
  };

  const handleSendResult = (res?: Record<string, unknown>, message?: string, ok?: boolean) => {
    const promoBlocked = res?.externalPromoBlocked as { title?: string; message?: string; serverMessage?: string } | undefined;
    if (promoBlocked) setPromo(promoBlocked);
    else if ((res?.warning as { message?: string } | undefined)?.message) toast.error((res!.warning as { message: string }).message);
    if (!ok && message) toast.error(message);
  };

  const send = async () => {
    const v = text.trim();
    if (!v) return;
    setText("");
    const r = replyTo; setReplyTo(null);
    if (typingStop.current) { clearTimeout(typingStop.current); typingStop.current = null; }
    emitSocket("stop-typing", { conversationId: id });
    typingSent.current = 0;
    setAtBottom(true);
    inputRef.current?.focus();
    const out = await st().sendText(id, v, r);
    handleSendResult(out.res, out.message, out.ok);
  };

  const pickImage = async (f?: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("اختر صورة");
    try {
      const { blob, width, height, preview } = await compressImage(f);
      setAtBottom(true);
      const out = await st().sendImage(id, blob, preview, { width, height });
      if (!out.ok && out.message) toast.error(out.message);
    } catch { toast.error("تعذّر قراءة الصورة"); }
    if (fileRef.current) fileRef.current.value = "";
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const f = Array.from(e.clipboardData.files).find((x) => x.type.startsWith("image/"));
    if (f && canSend) { e.preventDefault(); pickImage(f); }
  };

  // ── الصوت
  const startRecording = async () => {
    if (!VoiceRecorder.supported()) return toast.error("متصفحك لا يدعم التسجيل");
    const r = new VoiceRecorder();
    try {
      await r.start((level) => setRecording((x) => (x ? { ...x, level } : x)));
    } catch {
      return toast.error("اسمح باستخدام الميكروفون من إعدادات المتصفح");
    }
    recorder.current = r;
    setRecording({ startedAt: Date.now(), level: 0 });
  };
  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => {
      setRecTick(Date.now());
      if (Date.now() - recording.startedAt >= VOICE_MAX_SECONDS * 1000) finishRecording(true);
    }, 250);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording?.startedAt]);
  const cancelRecording = () => { recorder.current?.cancel(); recorder.current = null; setRecording(null); };
  const finishRecording = async (send: boolean) => {
    const r = recorder.current;
    recorder.current = null;
    setRecording(null);
    if (!r) return;
    if (!send) return r.cancel();
    if (Date.now() - r.startedAt < 800) { r.cancel(); return toast.info("اضغط مطوّلاً… التسجيل قصير جداً"); }
    try {
      const v = await r.stop();
      setAtBottom(true);
      const out = await st().sendAudio(id, v);
      if (!out.ok) toast.error(out.message || "تعذّر إرسال الرسالة الصوتية");
    } catch { toast.error("تعذّر معالجة التسجيل"); }
  };
  useEffect(() => () => recorder.current?.cancel(), []);

  // ── صورة مؤقتة / فيديو / موقع
  const pickEphemeral = (f?: File | null) => {
    if (ephemeralRef.current) ephemeralRef.current.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("اختر صورة");
    setPending({ kind: "ephemeral-photo", file: f });
  };
  const sendEphemeral = async (seconds: number) => {
    if (pending?.kind !== "ephemeral-photo") return;
    const f = pending.file; setPending(null);
    try {
      const { blob, width, height, preview } = await compressImage(f);
      setAtBottom(true);
      const out = await st().sendImage(id, blob, preview, { width, height }, seconds);
      if (!out.ok && out.message) toast.error(out.message);
    } catch { toast.error("تعذّر قراءة الصورة"); }
  };
  const pickVideo = async (f?: File | null) => {
    if (videoRef.current) videoRef.current.value = "";
    if (!f) return;
    if (!/^video\/(mp4|quicktime)$/.test(f.type) && !/\.(mp4|mov)$/i.test(f.name)) return toast.error("الفيديو بصيغة MP4 أو MOV فقط");
    if (f.size > 6 * 1024 * 1024) return toast.error("الفيديو أكبر من 6MB — قصّره أو أرسله من التطبيق (يضغطه تلقائياً)");
    const url = URL.createObjectURL(f);
    const meta = await new Promise<{ d: number; w: number; h: number } | null>((res) => {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => res({ d: v.duration, w: v.videoWidth, h: v.videoHeight });
      v.onerror = () => res(null);
      v.src = url;
    });
    URL.revokeObjectURL(url);
    if (!meta) return toast.error("تعذّر قراءة الفيديو");
    if (meta.d > 15.5) return toast.error("الفيديو حتى 15 ثانية — قصّه أو أرسله من التطبيق");
    setPending({ kind: "video", file: f, duration: Math.max(1, Math.round(meta.d)), dims: { width: meta.w, height: meta.h } });
  };
  const sendVideo = async (mode: "once" | "24h") => {
    if (pending?.kind !== "video") return;
    const p = pending; setPending(null);
    setAtBottom(true);
    const out = await st().sendVideo(id, p.file, p.duration, mode, p.dims);
    if (!out.ok) toast.error(out.message || "تعذّر إرسال الفيديو");
  };
  const sendLocation = () => {
    setAttach(false);
    if (!("geolocation" in navigator)) return toast.error("متصفحك لا يدعم تحديد الموقع");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      setLocating(false);
      const { latitude, longitude } = pos.coords;
      const out = await st().sendText(id, `📍 ${latitude.toFixed(5)},${longitude.toFixed(5)}|موقعي`);
      if (!out.ok) toast.error(out.message || "تعذّر إرسال الموقع");
    }, () => { setLocating(false); toast.error("اسمح بتحديد الموقع من إعدادات المتصفح"); }, { enableHighAccuracy: true, timeout: 15000 });
  };

  // ── إجراءات الطلب
  const accept = async () => {
    setBusy(true);
    const r = await chatAPI.accept(id);
    setBusy(false);
    if (r.success) { toast.success("قُبل الطلب"); st().fetchConversation(id); st().loadMessages(id); }
    else toast.error(r.message || "تعذّر القبول");
  };
  const reject = async () => {
    setBusy(true);
    const r = await chatAPI.reject(id);
    setBusy(false); setConfirm(null);
    if (r.success) { st().removeConversation(id); router.replace("/chats"); }
    else toast.error(r.message || "تعذّر الرفض");
  };
  const block = async () => {
    if (!partner) return;
    setBusy(true);
    const r = await privacyAPI.block(idOf(partner));
    setBusy(false); setConfirm(null);
    if (r.success) { toast.success("تم الحظر"); st().patchConversation(id, { blockState: "iBlocked" }); }
    else toast.error(r.message || "تعذّر الحظر");
  };
  const unblock = async () => {
    if (!partner) return;
    const r = await privacyAPI.unblock(idOf(partner));
    if (r.success) { toast.success("أُلغي الحظر"); st().patchConversation(id, { blockState: null }); }
    else toast.error(r.message || "تعذّر إلغاء الحظر");
  };
  const del = async () => {
    setBusy(true);
    const r = await chatAPI.remove(id);
    setBusy(false); setConfirm(null);
    if (r.success) { st().removeConversation(id); router.replace("/chats"); }
    else toast.error(r.message || "تعذّر الحذف");
  };
  const toggleMute = async () => {
    setShowMenu(false);
    const r = await chatAPI.mute(id);
    if (r.success) {
      const muted = (r.data as { isMuted?: boolean } | undefined)?.isMuted ?? !conv?.isMuted;
      st().patchConversation(id, { isMuted: muted });
      toast.success(muted ? "كُتمت المحادثة" : "أُلغي الكتم");
    } else toast.error(r.message || "تعذّر");
  };

  const onRetry = useCallback((m: Message) => st().retry(id, m._id), [id, st]);
  const onMenu = useCallback((m: Message) => { if (!m.local && !m.isDeleted && m.type !== "system") setMenuMsg(m); }, []);

  const block_ = blockStateOf(conv);
  const pendingIn = conv?.status === "pending" && conv.creator !== me;
  const pendingOut = conv?.status === "pending" && conv.creator === me;
  const closed = conv && ["rejected", "cancelled", "expired"].includes(conv.status || "");
  const gone = !!(partner?.isDeactivatedAccount || partner?.isSuspendedAccount);
  const canSend = !!conv && !block_ && !gone && !pendingIn && !pendingOut && !closed;
  const online = !block_ && !gone && (partnerOnline ?? isRecentlyActive(partner));
  const status = typing ? "يكتب…" : gone ? "غير متاح" : block_ ? "" : partnerOnline ? "متصل الآن" : partnerOnline === false ? "" : lastSeenText(partner);

  if (missing) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-bold">لم نعثر على هذه المحادثة</p>
        <Link href="/chats"><Button block={false} variant="secondary">العودة للمحادثات</Button></Link>
      </div>
    );
  }

  return (
    <div className="relative h-dvh flex flex-col bg-h-bg">
      {/* الترويسة (ChatHeaderView) */}
      <header className="shrink-0 h-16 px-2 sm:px-4 flex items-center gap-2 bg-h-card/90 backdrop-blur-xl border-b border-h-border">
        <button onClick={() => router.push("/chats")} aria-label="رجوع" className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-h-input"><ArrowRight size={22} /></button>
        {partner ? (
          <Link href={`/profile/${idOf(partner)}`} className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar src={block_ === "blockedMe" || gone ? null : partner.profileImage} name={partner.name} size="sm" online={!!online} premium={!gone && partner.isPremium} className={gone ? "grayscale opacity-60" : undefined} />
            <span className="min-w-0">
              <span className="flex items-center gap-1.5"><span className="font-extrabold truncate">{partner.name}</span><NameBadges u={partner} size={15} /></span>
              <span className={cn("block text-xs truncate", typing ? "text-h-primary font-bold" : "text-h-text2")}>{status || " "}</span>
            </span>
          </Link>
        ) : <div className="flex-1"><Spinner size={20} /></div>}
        <button onClick={() => setShowMenu(true)} aria-label="خيارات المحادثة" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-h-input"><MoreVertical size={21} /></button>
      </header>

      {/* الرسائل */}
      <div ref={scroller} onScroll={onScroll} className="flex-1 overflow-y-auto h-scroll px-3 sm:px-6 py-3 relative" aria-live="polite">
        <div ref={content}>
        {thread?.loadingOlder && <div className="flex justify-center py-2"><Spinner size={20} /></div>}
        {!thread?.loaded && !items.length ? (
          <div className="h-full flex items-center justify-center"><Spinner /></div>
        ) : (
          <>
            {!thread?.hasMore && (
              <div className="flex justify-center my-3">
                <span className="text-[11px] text-h-text2 bg-h-chip rounded-full px-3 py-1">المحادثة خاصة بينكما 🔒</span>
              </div>
            )}
            {pendingIn && conv?.initialMessage?.content && !items.some((m) => m.content === conv.initialMessage?.content) && (
              <MessageBubble m={{ _id: "initial", sender: idOf(partner), content: conv.initialMessage.content, type: "text", createdAt: conv.initialMessage.createdAt }}
                mine={false} onImage={setLightbox} onMenu={() => {}} onRetry={() => {}} showTail />
            )}
            {items.map((m, i) => {
              const prev = items[i - 1];
              const newDay = !prev || new Date(prev.createdAt).toDateString() !== new Date(m.createdAt).toDateString();
              const mine = senderIdOf(m) === me;
              const showTail = newDay || !prev || senderIdOf(prev) !== senderIdOf(m) || prev.type === "system";
              return (
                <div key={m._id}>
                  {newDay && <div className="flex justify-center my-3"><span className="text-xs font-bold text-h-text2 bg-h-chip rounded-full px-3 py-1">{dayLabel(m.createdAt)}</span></div>}
                  {m.type === "game" && m.game && !m.isDeleted ? (
                    // بطاقة اللعبة خارج فقاعة التدرّج (ألوانها لا تتعارض)
                    <div className={cn("flex mt-2", mine ? "justify-end" : "justify-start")}>
                      <GameCard message={m} me={me} conversationId={id} canPlay={canSend} />
                    </div>
                  ) : (
                    <MessageBubble m={m} mine={mine} onImage={setLightbox} onMenu={onMenu} onRetry={onRetry} showTail={showTail} />
                  )}
                </div>
              );
            })}
            {typing && (
              <div className="flex justify-start mt-2" aria-label="يكتب">
                <span className="bg-h-card border border-h-border rounded-[20px] rounded-bs-md px-4 py-3 flex gap-1">
                  {[0, 1, 2].map((k) => <span key={k} className="h-typing-dot w-2 h-2 rounded-full bg-h-text2" />)}
                </span>
              </div>
            )}
          </>
        )}
        </div>
      </div>

      {!atBottom && (
        <button onClick={() => { const el = scroller.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }); }}
          aria-label="إلى آخر رسالة" className="absolute bottom-24 end-6 lg:end-10 w-10 h-10 rounded-full bg-h-card border border-h-border h-shadow flex items-center justify-center z-20">
          <ChevronDown size={20} />
        </button>
      )}

      {/* الشريط السفلي */}
      <div className="relative shrink-0 border-t border-h-border bg-h-card pb-[env(safe-area-inset-bottom)]">
        {pendingIn ? (
          <div className="p-4 space-y-3">
            <p className="text-sm text-center text-h-text2"><b className="text-h-text">{partner?.name}</b> يريد محادثتك</p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setConfirm("reject")} disabled={busy}>رفض</Button>
              <Button onClick={accept} loading={busy}>قبول</Button>
            </div>
          </div>
        ) : gone ? (
          <p className="p-4 text-center text-sm text-h-text2">هذا الحساب غير متاح</p>
        ) : block_ === "iBlocked" ? (
          <div className="p-4 text-center space-y-2">
            <p className="text-sm text-h-text2">لقد حظرت هذا المستخدم</p>
            <button onClick={unblock} className="text-h-primary font-bold text-sm">إلغاء الحظر</button>
          </div>
        ) : block_ === "blockedMe" ? (
          <p className="p-4 text-center text-sm text-h-text2">هذا المستخدم غير متاح</p>
        ) : pendingOut ? (
          <p className="p-4 text-center text-sm text-h-text2">أُرسل الطلب — تستطيع المراسلة بعد قبوله</p>
        ) : closed ? (
          <p className="p-4 text-center text-sm text-h-text2">{conv?.status === "rejected" ? "لم يُقبل الطلب" : "انتهت هذه المحادثة"}</p>
        ) : (
          <>
            {replyTo && (
              <div className="flex items-center gap-3 px-4 pt-3">
                <Reply size={18} className="text-h-primary shrink-0" />
                <div className="flex-1 min-w-0 border-s-[3px] border-h-primary ps-2">
                  <p className="text-xs font-bold text-h-primary">الرد على {senderIdOf(replyTo) === me ? "رسالتك" : partner?.name}</p>
                  <p className="text-sm text-h-text2 truncate">{replyTo.type === "image" ? "📷 صورة" : replyTo.content}</p>
                </div>
                <button onClick={() => setReplyTo(null)} aria-label="إلغاء الرد" className="text-h-text2"><X size={18} /></button>
              </div>
            )}
            <div className="flex items-end gap-2 p-2.5 sm:p-3">
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pickImage(e.target.files?.[0])} />
              <input ref={ephemeralRef} type="file" accept="image/*" hidden onChange={(e) => pickEphemeral(e.target.files?.[0])} />
              <input ref={videoRef} type="file" accept="video/mp4,video/quicktime,.mp4,.mov" hidden onChange={(e) => pickVideo(e.target.files?.[0])} />
              <button onClick={() => setAttach(true)} aria-label="المرفقات" className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-h-primary hover:bg-h-primary/10"><Plus size={25} /></button>
              <button onClick={() => setStickers((v) => !v)} aria-label="الملصقات" aria-pressed={stickers}
                className={cn("w-11 h-11 shrink-0 rounded-full flex items-center justify-center hover:bg-h-primary/10", stickers ? "text-h-primary bg-h-primary/10" : "text-h-text2")}><Smile size={23} /></button>
              <textarea
                ref={inputRef} value={text} rows={1} maxLength={2000}
                onChange={(e) => onType(e.target.value)} onPaste={onPaste}
                onFocus={() => setStickers(false)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && window.matchMedia("(pointer: fine)").matches) { e.preventDefault(); send(); } }}
                placeholder="اكتب رسالة…" aria-label="الرسالة" dir="auto"
                className="flex-1 resize-none h-no-scrollbar max-h-36 min-h-11 py-2.5 px-4 rounded-[22px] bg-h-input outline-none border-[1.5px] border-transparent focus:border-h-primary/50 text-[15px] leading-6"
                style={{ height: "auto" }}
                onInput={(e) => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 144) + "px"; }}
              />
              {text.trim() ? (
                <button onClick={send} aria-label="إرسال"
                  className="w-11 h-11 shrink-0 rounded-full h-gradient text-white flex items-center justify-center transition active:scale-90">
                  <SendHorizontal size={21} className="-scale-x-100" />
                </button>
              ) : (
                <button onClick={startRecording} aria-label="تسجيل رسالة صوتية"
                  className="w-11 h-11 shrink-0 rounded-full h-gradient text-white flex items-center justify-center transition active:scale-90">
                  <Mic size={21} />
                </button>
              )}
            </div>
            {recording && (
              <div className="absolute inset-x-0 bottom-0 bg-h-card border-t border-h-border flex items-center gap-3 p-3 pb-[max(.75rem,env(safe-area-inset-bottom))] z-10" role="status" aria-label="جارٍ التسجيل">
                <button onClick={cancelRecording} aria-label="إلغاء التسجيل" className="w-11 h-11 rounded-full bg-h-error/10 text-h-error flex items-center justify-center"><TrashIcon size={20} /></button>
                <span className="w-3 h-3 rounded-full bg-h-error animate-pulse" />
                <span className="font-bold tabular-nums">{(() => { const s = Math.floor(((recTick || Date.now()) - recording.startedAt) / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; })()}</span>
                <span className="flex-1 h-8 flex items-center"><span className="h-1.5 rounded-full bg-h-primary transition-all" style={{ width: `${Math.min(100, 8 + recording.level * 160)}%` }} /></span>
                <span className="text-xs text-h-text2 hidden sm:block">حتى {VOICE_MAX_SECONDS} ثانية</span>
                <button onClick={() => finishRecording(true)} aria-label="إرسال التسجيل" className="w-11 h-11 rounded-full h-gradient text-white flex items-center justify-center"><SendHorizontal size={20} className="-scale-x-100" /></button>
              </div>
            )}
            {stickers && (
              <StickerPanel userId={me} premium={premium} onPick={async (s) => {
                setAtBottom(true);
                pushRecentSticker(me, s);
                const out = await st().sendSticker(id, s);
                if (!out.ok) toast.error(out.message || "تعذّر إرسال الملصق");
              }} />
            )}
          </>
        )}
      </div>

      <GamePickerSheet open={games} onClose={() => setGames(false)} conversationId={id} />

      {/* المرفقات */}
      <Sheet open={attach} onClose={() => setAttach(false)} title="إرسال">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 py-3">
          <AttachItem icon={ImageIcon} color="#8B5CF6" label="صورة" onClick={() => { setAttach(false); fileRef.current?.click(); }} />
          <AttachItem icon={Timer} color="#E91E8C" label="صورة مؤقتة" onClick={() => { setAttach(false); ephemeralRef.current?.click(); }} />
          <AttachItem icon={Video} color="#EF4444" label="فيديو 15ث" onClick={() => { setAttach(false); videoRef.current?.click(); }} />
          <AttachItem icon={MapPin} color="#10B981" label={locating ? "…" : "موقعي"} onClick={sendLocation} />
          {canSend && <AttachItem icon={Gamepad2} color="#F59E0B" label="لعبة" onClick={() => { setAttach(false); setGames(true); }} />}
        </div>
      </Sheet>

      <Sheet open={pending?.kind === "ephemeral-photo"} onClose={() => setPending(null)} title="صورة مؤقتة">
        <div className="py-2 space-y-3">
          <p className="text-sm text-h-text2 leading-7">تُفتح مرة واحدة للمدة التي تختارها ثم تختفي. لا تُعرض على الويب عند المستلم — يفتحها من التطبيق.</p>
          <div className="grid grid-cols-3 gap-2">
            {[5, 10, 30].map((sec) => (
              <button key={sec} onClick={() => sendEphemeral(sec)} className="h-14 rounded-xl bg-h-input font-extrabold hover:bg-h-primary/10 hover:text-h-primary">{sec} ث</button>
            ))}
          </div>
        </div>
      </Sheet>

      <Sheet open={pending?.kind === "video"} onClose={() => setPending(null)} title="فيديو مؤقت">
        <div className="py-2 space-y-3">
          <p className="text-sm text-h-text2 leading-7">كل فيديو مؤقت. {pending?.kind === "video" ? `المدة ${pending.duration} ث.` : ""}</p>
          <button onClick={() => sendVideo("once")} className="w-full text-start p-4 rounded-xl bg-h-input hover:bg-h-primary/10">
            <span className="block font-extrabold">مشاهدة واحدة</span><span className="block text-xs text-h-text2 mt-0.5">يختفي بعد أن يشاهده</span>
          </button>
          <button onClick={() => sendVideo("24h")} className="w-full text-start p-4 rounded-xl bg-h-input hover:bg-h-primary/10">
            <span className="block font-extrabold">24 ساعة</span><span className="block text-xs text-h-text2 mt-0.5">يُعاد تشغيله حتى يمرّ يوم على الإرسال</span>
          </button>
        </div>
      </Sheet>

      {/* خيارات الرسالة */}
      <Sheet open={!!menuMsg} onClose={() => setMenuMsg(null)}>
        {menuMsg && (
          <div className="py-3">
            {canSend && (
              <div className="flex justify-between bg-h-input rounded-2xl p-2 mb-3">
                {REACTIONS.map((e) => (
                  <button key={e} className="text-2xl w-11 h-11 rounded-full hover:bg-h-card transition" aria-label={`تفاعل ${e}`}
                    onClick={async () => { const m = menuMsg; setMenuMsg(null); const r = await chatAPI.react(m._id, e); if (r.success) { const re = (r.data as { reactions?: Message["reactions"] })?.reactions; if (re) st().onReaction(m._id, re); } else toast.error(r.message || "تعذّر"); }}>
                    {e}
                  </button>
                ))}
              </div>
            )}
            <div className="divide-y divide-h-divider">
              {canSend && <MenuItem icon={Reply} label="رد" onClick={() => { setReplyTo(menuMsg); setMenuMsg(null); inputRef.current?.focus(); }} />}
              {menuMsg.type === "text" && <MenuItem icon={Copy} label="نسخ" onClick={() => { navigator.clipboard?.writeText(menuMsg.content); toast.success("نُسخت"); setMenuMsg(null); }} />}
              {senderIdOf(menuMsg) === me && (
                <MenuItem icon={Trash2} label="حذف الرسالة" danger onClick={async () => { const m = menuMsg; setMenuMsg(null); const r = await chatAPI.deleteMessage(m._id); if (r.success) st().onDeleted(id, m._id); else toast.error(r.message || "تعذّر الحذف"); }} />
              )}
            </div>
          </div>
        )}
      </Sheet>

      {/* خيارات المحادثة */}
      <Sheet open={showMenu} onClose={() => setShowMenu(false)}>
        <div className="py-3 divide-y divide-h-divider">
          {partner && <MenuItem icon={UserRound} label="عرض الملف" onClick={() => router.push(`/profile/${idOf(partner)}`)} />}
          {conv?.status === "accepted" && <MenuItem icon={conv.isMuted ? Bell : BellOff} label={conv.isMuted ? "إلغاء الكتم" : "كتم الإشعارات"} onClick={toggleMute} />}
          <MenuItem icon={Flag} label="إبلاغ" onClick={() => { setShowMenu(false); setReport(true); }} />
          {block_ !== "iBlocked" && <MenuItem icon={Ban} label="حظر" danger onClick={() => { setShowMenu(false); setConfirm("block"); }} />}
          <MenuItem icon={Trash2} label="حذف المحادثة" danger onClick={() => { setShowMenu(false); setConfirm("delete"); }} />
        </div>
      </Sheet>

      <Confirm open={confirm === "block"} onClose={() => setConfirm(null)} onConfirm={block} loading={busy} danger confirmText="حظر"
        title={`حظر ${partner?.name || ""}؟`} message="لن يستطيع مراسلتك أو رؤية ملفك، وتبقى المحادثة للقراءة فقط." />
      <Confirm open={confirm === "delete"} onClose={() => setConfirm(null)} onConfirm={del} loading={busy} danger confirmText="حذف"
        title="حذف المحادثة؟" message="تُحذف من قائمتك أنت فقط." />
      <Confirm open={confirm === "reject"} onClose={() => setConfirm(null)} onConfirm={reject} loading={busy} danger confirmText="رفض"
        title="رفض الطلب؟" message="لن يُبلَّغ المرسل بالرفض صراحةً." />
      {partner && <ReportSheet open={report} onClose={() => setReport(false)} userId={idOf(partner)} name={partner.name} />}

      {/* تحذير الحسابات الخارجية */}
      <Sheet open={!!promo} onClose={() => setPromo(null)}>
        {promo && (
          <div className="text-center py-5 space-y-3">
            <div className="text-4xl">🛡️</div>
            <h2 className="text-lg font-extrabold">{promo.title || "لم تُرسل الرسالة"}</h2>
            {promo.message && <p className="text-sm text-h-text2 leading-7">{promo.message}</p>}
            {promo.serverMessage && <p className="text-sm bg-h-warning/10 text-h-text rounded-xl p-3 leading-7">{promo.serverMessage}</p>}
            <Button onClick={() => setPromo(null)}>فهمت</Button>
          </div>
        )}
      </Sheet>

      {lightbox && (
        <div className="fixed inset-0 z-[90] bg-black/90 flex items-center justify-center h-fade" onClick={() => setLightbox(null)} role="dialog" aria-label="عرض الصورة">
          <button aria-label="إغلاق" className="absolute top-4 end-4 w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center"><X /></button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="صورة" className="max-w-[95vw] max-h-[90dvh] object-contain" />
        </div>
      )}
    </div>
  );
}

function pushRecentSticker(me: string, s: { _id: string; imageUrl: string }) {
  useStickers.getState().pushRecent(me, s);
}

function AttachItem({ icon: Icon, color, label, onClick }: { icon: React.ElementType; color: string; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 py-2 rounded-2xl hover:bg-h-input">
      <span className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}><Icon size={26} /></span>
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }: { icon: React.ElementType; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={cn("w-full flex items-center gap-3 py-3.5 px-1 text-[15px] font-bold", danger ? "text-h-error" : "text-h-text")}>
      <Icon size={20} /> {label}
    </button>
  );
}
