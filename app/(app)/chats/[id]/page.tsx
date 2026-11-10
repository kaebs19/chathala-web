"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, Copy, Flag, ImagePlus, MoreVertical, Reply, SendHorizontal, Trash2, UserRound, Ban, BellOff, X, Bell } from "lucide-react";
import Avatar from "@/components/hala/Avatar";
import { NameBadges } from "@/components/hala/Badges";
import Sheet, { Confirm } from "@/components/hala/Sheet";
import Button from "@/components/hala/Button";
import { Spinner } from "@/components/hala/Common";
import { toast } from "@/components/hala/Toast";
import MessageBubble from "@/components/chat/MessageBubble";
import ReportSheet from "@/components/chat/ReportSheet";
import { blockStateOf, partnerOf } from "@/components/chat/ConversationList";
import { useChatStore, senderIdOf } from "@/stores/chatStore";
import { usePresence } from "@/stores/presenceStore";
import { emitSocket } from "@/hooks/useRealtime";
import { chatAPI, privacyAPI } from "@/lib/api";
import { compressImage } from "@/lib/image";
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
  useEffect(() => {
    if (!conv || conv.status === "pending" && conv.creator !== me) return; // لا قراءة قبل القبول
    const mark = () => document.visibilityState === "visible" && st().markRead(id);
    mark();
    document.addEventListener("visibilitychange", mark);
    return () => document.removeEventListener("visibilitychange", mark);
  }, [id, lastOther, conv?.status, conv?.creator, me, st, conv]);

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
  const canSend = !!conv && !block_ && !pendingIn && !pendingOut && !closed;
  const online = !block_ && (partnerOnline ?? isRecentlyActive(partner));
  const status = typing ? "يكتب…" : block_ ? "" : partnerOnline ? "متصل الآن" : partnerOnline === false ? "" : lastSeenText(partner);

  if (missing) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-bold">لم نعثر على هذه المحادثة</p>
        <Link href="/chats"><Button block={false} variant="secondary">العودة للمحادثات</Button></Link>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-h-bg">
      {/* الترويسة (ChatHeaderView) */}
      <header className="shrink-0 h-16 px-2 sm:px-4 flex items-center gap-2 bg-h-card/90 backdrop-blur-xl border-b border-h-border">
        <button onClick={() => router.push("/chats")} aria-label="رجوع" className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-h-input"><ArrowRight size={22} /></button>
        {partner ? (
          <Link href={`/profile/${idOf(partner)}`} className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar src={block_ === "blockedMe" ? null : partner.profileImage} name={partner.name} size="sm" online={!!online} premium={partner.isPremium} />
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
                  <MessageBubble m={m} mine={mine} onImage={setLightbox} onMenu={onMenu} onRetry={onRetry} showTail={showTail} />
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

      {!atBottom && (
        <button onClick={() => { const el = scroller.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }); }}
          aria-label="إلى آخر رسالة" className="absolute bottom-24 end-6 lg:end-10 w-10 h-10 rounded-full bg-h-card border border-h-border h-shadow flex items-center justify-center z-20">
          <ChevronDown size={20} />
        </button>
      )}

      {/* الشريط السفلي */}
      <div className="shrink-0 border-t border-h-border bg-h-card pb-[env(safe-area-inset-bottom)]">
        {pendingIn ? (
          <div className="p-4 space-y-3">
            <p className="text-sm text-center text-h-text2"><b className="text-h-text">{partner?.name}</b> يريد محادثتك</p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setConfirm("reject")} disabled={busy}>رفض</Button>
              <Button onClick={accept} loading={busy}>قبول</Button>
            </div>
          </div>
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
              <button onClick={() => fileRef.current?.click()} aria-label="إرسال صورة" className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-h-primary hover:bg-h-primary/10"><ImagePlus size={23} /></button>
              <textarea
                ref={inputRef} value={text} rows={1} maxLength={2000}
                onChange={(e) => onType(e.target.value)} onPaste={onPaste}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && window.matchMedia("(pointer: fine)").matches) { e.preventDefault(); send(); } }}
                placeholder="اكتب رسالة…" aria-label="الرسالة" dir="auto"
                className="flex-1 resize-none max-h-36 min-h-11 py-2.5 px-4 rounded-[22px] bg-h-input outline-none border-[1.5px] border-transparent focus:border-h-primary/50 text-[15px] leading-6"
                style={{ height: "auto" }}
                onInput={(e) => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 144) + "px"; }}
              />
              <button onClick={send} disabled={!text.trim()} aria-label="إرسال"
                className="w-11 h-11 shrink-0 rounded-full h-gradient text-white flex items-center justify-center disabled:opacity-40 transition active:scale-90">
                <SendHorizontal size={21} className="-scale-x-100" />
              </button>
            </div>
          </>
        )}
      </div>

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

function MenuItem({ icon: Icon, label, onClick, danger }: { icon: React.ElementType; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={cn("w-full flex items-center gap-3 py-3.5 px-1 text-[15px] font-bold", danger ? "text-h-error" : "text-h-text")}>
      <Icon size={20} /> {label}
    </button>
  );
}
