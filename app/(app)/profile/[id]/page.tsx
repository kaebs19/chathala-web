"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Ban, Calendar, Flag, Heart, MapPin, MessageCircle, MoreVertical, Star, UserX } from "lucide-react";
import Avatar from "@/components/hala/Avatar";
import { NameBadges } from "@/components/hala/Badges";
import Button from "@/components/hala/Button";
import Field from "@/components/hala/Field";
import Sheet, { Confirm } from "@/components/hala/Sheet";
import { EmptyState, Section, Spinner } from "@/components/hala/Common";
import { toast } from "@/components/hala/Toast";
import { usePhotoViewer } from "@/components/hala/PhotoViewer";
import ReportSheet from "@/components/chat/ReportSheet";
import FriendButton from "@/components/friends/FriendButton";
import StoryRing from "@/components/stories/StoryRing";
import { useStoryStore } from "@/stores/storyStore";
import { InterestChips, useInterests } from "@/lib/interests";
import { chatAPI, exploreAPI, privacyAPI, userAPI } from "@/lib/api";
import { useChatStore } from "@/stores/chatStore";
import { countryName } from "@/lib/countries";
import { ageOf, cn, getImageUrl, idOf, isRecentlyActive, lastSeenText } from "@/lib/utils";
import type { User } from "@/types";

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const me = useChatStore((s) => s.me);
  const conv = useChatStore((s) => s.conversations.find((c) => c.participants?.some((p) => idOf(p) === id)));
  const fetchConversation = useChatStore((s) => s.fetchConversation);
  const interests = useInterests();
  const storyStatus = useStoryStore((s) => s.statuses[id]);
  const refreshStatuses = useStoryStore((s) => s.refreshStatuses);
  const openViewer = useStoryStore((s) => s.openViewer);
  useEffect(() => { refreshStatuses([id]); }, [id, refreshStatuses]);
  const viewer = usePhotoViewer();
  const [u, setU] = useState<User | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "missing">("loading");
  const [photo, setPhoto] = useState(0);
  const [liked, setLiked] = useState(false);
  const [menu, setMenu] = useState(false);
  const [report, setReport] = useState(false);
  const [blockAsk, setBlockAsk] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (me && id === me) { router.replace("/profile"); return; }
    let alive = true;
    userAPI.profile(id).then((r) => {
      if (!alive) return;
      const user = (r.data as { user?: User } | undefined)?.user;
      if (r.success && user) {
        setU(user); setLiked(!!user.isLiked); setState("ok");
        userAPI.recordVisit(id); // كما في iOS: فتح الملف = زيارة
      } else setState("missing");
    });
    return () => { alive = false; };
  }, [id, me, router]);

  const photos = useMemo(() => {
    if (!u) return [];
    const list = (u.photos || []).map((p) => (typeof p === "string" ? p : p.original || p.medium)).filter(Boolean) as string[];
    if (!list.length && u.profileImage) list.push(u.profileImage);
    return list.map((x) => getImageUrl(x));
  }, [u]);

  const toggleLike = async () => {
    if (!u) return;
    const was = liked;
    setLiked(!was);
    const r = was ? await exploreAPI.unlike(id) : await exploreAPI.swipe(id, "like");
    if (!r.success) { setLiked(was); toast.error(r.message || "تعذّر"); return; }
    const match = (r.data as { match?: { conversationId?: string } } | undefined)?.match;
    if (match?.conversationId) { toast.success(`تطابق مع ${u.name}! 🎉`); fetchConversation(String(match.conversationId)); }
    else if (!was) toast.success("أُرسل الإعجاب");
  };

  const superLike = async () => {
    const r = await exploreAPI.superLike(id);
    if (r.success) toast.success("أُرسل سوبر لايك ⭐"); else toast.error(r.message || "تعذّر");
  };

  const message = () => {
    if (conv && conv.status !== "rejected" && conv.status !== "cancelled" && conv.status !== "expired") router.push(`/chats/${conv._id}`);
    else setMsgOpen(true);
  };

  const sendRequest = async () => {
    setBusy(true);
    const r = await chatAPI.request(id, msg.trim() || undefined);
    setBusy(false);
    const c = (r.data as { conversation?: { _id: string } } | undefined)?.conversation;
    if (r.success) {
      setMsgOpen(false); setMsg("");
      if (c?._id) { await fetchConversation(String(c._id)); router.push(`/chats/${c._id}`); }
      else toast.success("أُرسل الطلب");
    } else toast.error(r.message || "تعذّر إرسال الطلب");
  };

  const block = async () => {
    setBusy(true);
    const r = await privacyAPI.block(id);
    setBusy(false); setBlockAsk(false);
    if (r.success) { toast.success("تم الحظر"); router.back(); } else toast.error(r.message || "تعذّر الحظر");
  };

  if (state === "loading") return <div className="py-24 flex justify-center"><Spinner /></div>;
  if (state === "missing" || !u) {
    return <EmptyState icon={UserX} title="الملف غير متاح" text="ربما حذف صاحبه حسابه أو أخفاه." action={<Button variant="secondary" onClick={() => router.back()}>رجوع</Button>} />;
  }

  const age = ageOf(u.birthDate);
  const active = isRecentlyActive(u);

  return (
    <div className="max-w-2xl mx-auto pb-28 lg:pb-10">
      {/* الصور */}
      <div className="relative aspect-[4/5] sm:aspect-[4/3] lg:rounded-b-3xl overflow-hidden bg-h-chip">
        {photos[photo] ? (
          <button className="w-full h-full" onClick={() => viewer.open(photos, photo)} aria-label="عرض الصور">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[photo]} alt={`صورة ${u.name}`} className="w-full h-full object-cover" />
          </button>
        ) : <div className="w-full h-full flex items-center justify-center"><Avatar name={u.name} size="xxl" /></div>}
        {photos.length > 1 && (
          <>
            <div className="absolute top-3 inset-x-16 flex gap-1" dir="ltr">
              {photos.map((_, i) => <button key={i} onClick={() => setPhoto(i)} aria-label={`الصورة ${i + 1}`} className={cn("h-1 flex-1 rounded-full", i === photo ? "bg-white" : "bg-white/45")} />)}
            </div>
            <button aria-label="الصورة التالية" onClick={() => setPhoto((p) => Math.min(photos.length - 1, p + 1))} className="absolute inset-y-0 start-0 w-1/4" />
            <button aria-label="الصورة السابقة" onClick={() => setPhoto((p) => Math.max(0, p - 1))} className="absolute inset-y-0 end-0 w-1/4" />
          </>
        )}
        <button onClick={() => router.back()} aria-label="رجوع" className="absolute top-3 start-3 w-10 h-10 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center"><ArrowRight size={21} /></button>
        <button onClick={() => setMenu(true)} aria-label="خيارات" className="absolute top-3 end-3 w-10 h-10 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center"><MoreVertical size={20} /></button>
      </div>

      <div className="px-4 pt-5">
        <div className="flex items-center gap-2 flex-wrap">
          {!!storyStatus?.count && (
            <StoryRing src={u.profileImage} name={u.name} size="md" count={storyStatus.count} unseen={storyStatus.hasUnseen}
              label={`قصص ${u.name}`} onClick={() => openViewer({ ownerIds: [id], startIndex: 0 })} />
          )}
          <h1 className="text-[26px] font-extrabold">{u.name}{age ? `، ${age}` : ""}</h1>
          <NameBadges u={u} size={20} />
        </div>
        <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-sm text-h-text2 mt-1">
          {active ? <span className="flex items-center gap-1.5 text-h-success font-bold"><span className="w-2 h-2 rounded-full bg-[#22C55E]" />{u.isOnline ? "متصل الآن" : "نشط مؤخراً"}</span> : lastSeenText(u) && <span>{lastSeenText(u)}</span>}
          {u.country && <span className="flex items-center gap-1"><MapPin size={14} />{countryName(u.country)}{typeof u.distance === "number" ? ` · ${u.distance} كم` : ""}</span>}
          {u.joinDate && <span className="flex items-center gap-1"><Calendar size={14} />انضم {new Date(u.joinDate).toLocaleDateString("ar-SA", { month: "long", year: "numeric" })}</span>}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2"><FriendButton userId={id} name={u.name} /></div>
        {u.likedYou && <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-h-primary bg-h-primary/10 rounded-full px-3 py-1"><Heart size={14} className="fill-h-primary" /> أُعجب بك</p>}

        {u.bio && <Section title="نبذة" className="mt-5"><p className="px-4 py-3 text-[15px] leading-7 whitespace-pre-wrap" dir="auto">{u.bio}</p></Section>}
        {!!u.interests?.length && <Section title="الاهتمامات"><div className="p-4"><InterestChips keys={u.interests} all={interests} /></div></Section>}
        {u.zodiacSign && (
          <Section title="البرج">
            {/* كائن { labelAr, emoji } لا نصّ — عرضه مباشرة كان يُسقط الصفحة (React #31) */}
            <p className="px-4 py-3 text-[15px]">{typeof u.zodiacSign === "string" ? u.zodiacSign : `${u.zodiacSign.emoji || ""} ${u.zodiacSign.labelAr || ""}`}</p>
          </Section>
        )}
      </div>

      {/* الإجراءات */}
      <div className="fixed lg:sticky bottom-0 inset-x-0 lg:mt-4 bg-h-bg/90 backdrop-blur-xl border-t border-h-border lg:border-0 px-4 py-3 pb-[max(.75rem,env(safe-area-inset-bottom))] lg:bg-transparent z-30">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={toggleLike} aria-pressed={liked} aria-label={liked ? "إلغاء الإعجاب" : "إعجاب"}
            className={cn("w-[52px] h-[52px] rounded-full flex items-center justify-center border transition active:scale-90", liked ? "h-gradient text-white border-transparent" : "bg-h-card border-h-border text-h-primary")}>
            <Heart size={24} className={liked ? "fill-white" : ""} />
          </button>
          <button onClick={superLike} aria-label="سوبر لايك" className="w-[52px] h-[52px] rounded-full flex items-center justify-center bg-h-card border border-h-border text-[#3B82F6] active:scale-90"><Star size={22} /></button>
          <Button onClick={message} className="flex-1"><MessageCircle size={20} /> {conv?.status === "accepted" ? "المحادثة" : conv?.status === "pending" ? "عرض الطلب" : "أرسل رسالة"}</Button>
        </div>
      </div>

      <Sheet open={menu} onClose={() => setMenu(false)}>
        <div className="py-3 divide-y divide-h-divider">
          <button onClick={() => { setMenu(false); setReport(true); }} className="w-full flex items-center gap-3 py-3.5 font-bold"><Flag size={20} /> إبلاغ</button>
          <button onClick={() => { setMenu(false); setBlockAsk(true); }} className="w-full flex items-center gap-3 py-3.5 font-bold text-h-error"><Ban size={20} /> حظر</button>
        </div>
      </Sheet>
      <Confirm open={blockAsk} onClose={() => setBlockAsk(false)} onConfirm={block} loading={busy} danger confirmText="حظر" title={`حظر ${u.name}؟`} message="لن يراك في الاكتشاف ولن يستطيع مراسلتك." />
      <ReportSheet open={report} onClose={() => setReport(false)} userId={id} name={u.name} />
      <Sheet open={msgOpen} onClose={() => setMsgOpen(false)} title={`رسالة إلى ${u.name}`}>
        <div className="space-y-4 py-2">
          {u.acceptingRequests === false ? <p className="text-sm text-h-text2">لا يستقبل طلبات محادثة حالياً.</p> : (
            <>
              <p className="text-sm text-h-text2 leading-7">تصله كطلب محادثة، ويستطيع قبوله أو رفضه.{u.premiumOnlyRequests ? " يستقبل الطلبات من مشتركي هلا+ فقط." : ""}</p>
              <Field textarea rows={3} maxLength={300} placeholder="اكتب رسالة لطيفة…" value={msg} onChange={(e) => setMsg(e.target.value)} />
              <Button loading={busy} onClick={sendRequest} disabled={!msg.trim()}>إرسال الطلب</Button>
            </>
          )}
          {u.premiumOnlyRequests && <Link href="/premium" className="block text-center text-sm font-bold text-h-warning">اشترك في هلا+</Link>}
        </div>
      </Sheet>
      {viewer.view}
    </div>
  );
}
