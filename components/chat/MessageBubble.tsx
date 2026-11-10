"use client";

import { memo } from "react";
import { AlertCircle, Check, CheckCheck, Clock, EyeOff, Gamepad2, MapPin, Mic, Smartphone, Timer, Video } from "lucide-react";
import VoicePlayer from "@/components/chat/VoicePlayer";
import type { Message } from "@/types";
import { cn, formatTime, getImageUrl } from "@/lib/utils";

function Ticks({ m }: { m: Message }) {
  if (m.local === "sending") return <Clock size={13} className="opacity-80" aria-label="جارٍ الإرسال" />;
  if (m.local === "failed") return <AlertCircle size={14} aria-label="فشل الإرسال" />;
  if (m.isRead) return <CheckCheck size={15} className="text-[#7DD3FC]" aria-label="مقروءة" />;
  if (m.isDelivered) return <CheckCheck size={15} className="opacity-80" aria-label="وصلت" />;
  return <Check size={15} className="opacity-80" aria-label="أُرسلت" />;
}

/** رسالة الموقع: نصّ «📍 lat,lng|العنوان» (كما في iOS: isLocationMessage) */
export function parseLocation(c?: string): { lat: number; lng: number; address: string } | null {
  if (!c || !c.startsWith("📍 ") || !c.includes(",") || !c.includes("|")) return null;
  const [coord, ...rest] = c.slice(3).split("|");
  const [a, b] = coord.split(",").map(Number);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return { lat: a, lng: b, address: rest.join("|") };
}

function LocationCard({ lat, lng, address, mine }: { lat: number; lng: number; address: string; mine: boolean }) {
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  // بلاطة OpenStreetMap واحدة حول النقطة (بلا مفتاح API)
  const z = 15, n = 2 ** z;
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor(((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * n);
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block w-[240px]">
      <span className="relative block h-32 rounded-2xl overflow-hidden bg-h-chip">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`https://tile.openstreetmap.org/${z}/${x}/${y}.png`} alt="خريطة" className="w-full h-full object-cover" loading="lazy" />
        <MapPin size={30} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-h-error fill-h-error/30" />
      </span>
      <span className="flex items-center gap-1.5 mt-1.5 px-1 text-sm font-semibold"><MapPin size={15} />{address || "موقع"}</span>
      <span className={cn("block px-1 text-[11px]", mine ? "text-white/75" : "text-h-text2")}>فتح في الخرائط</span>
    </a>
  );
}

function AppOnly({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <span className="flex items-center gap-2 py-1">
      <Icon size={18} className="shrink-0" />
      <span className="text-sm">{text}</span>
      <span className="text-[11px] opacity-75 flex items-center gap-1"><Smartphone size={12} /> في التطبيق</span>
    </span>
  );
}

function Body({ m, mine, onImage }: { m: Message; mine: boolean; onImage: (src: string) => void }) {
  if (m.isDeleted) return <span className="italic opacity-75 text-sm">تم حذف هذه الرسالة</span>;
  const disappearing = m.disappearing?.enabled;
  if (m.type === "image" && !disappearing) {
    const src = m.localPreview || (m.mediaUrl ? getImageUrl(m.mediaUrl) : "");
    const isSticker = m.imageSource === "sticker";
    const w = m.mediaWidth || 3, h = m.mediaHeight || 4;
    if (!src) return <AppOnly icon={EyeOff} text="صورة غير متاحة" />;
    return (
      <span className="block">
        <button onClick={() => !isSticker && onImage(src)} className="block" aria-label="فتح الصورة">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="صورة" loading="lazy"
            className={cn(isSticker ? "w-32 h-32 object-contain" : "rounded-2xl object-cover max-w-[260px] max-h-[340px] w-full bg-black/5")}
            style={isSticker ? undefined : { aspectRatio: `${w}/${h}` }} />
        </button>
        {m.content && <span className="block mt-1.5 px-1 whitespace-pre-wrap break-words">{m.content}</span>}
      </span>
    );
  }
  // الوسائط المؤقتة لا تُعرض على الويب: لا يمكن فيه منع لقطة الشاشة ولا كشفها (iOS يحميها) — وعد المرسل يبقى
  if (m.type === "image" || m.type === "video") {
    const label = m.type === "video" ? "فيديو مؤقت" : "صورة مؤقتة";
    if (mine) {
      const seen = !!m.isRead;
      return (
        <span className="flex items-center gap-2 py-1">
          {m.type === "video" ? <Video size={18} /> : <Timer size={18} />}
          <span className="text-sm">{label}{m.disappearing?.mode === "24h" ? " · 24 ساعة" : m.disappearing?.mode === "once" ? " · مرة واحدة" : ""}</span>
          <span className="text-[11px] opacity-75">{m.local ? "" : seen ? "· فُتحت" : "· أُرسلت"}</span>
        </span>
      );
    }
    if (m.disappearing?.isExpiredForMe) return <AppOnly icon={EyeOff} text={`${label} — انتهت`} />;
    return <AppOnly icon={EyeOff} text={`${label} — افتحها من التطبيق`} />;
  }
  if (m.type === "audio") {
    const src = m.localPreview || (m.mediaUrl ? getImageUrl(m.mediaUrl) : "");
    return src ? <VoicePlayer src={src} duration={m.audioDuration} waveform={m.audioWaveform} mine={mine} messageId={m._id} listened={m.isListened} />
      : <AppOnly icon={Mic} text="رسالة صوتية" />;
  }
  const loc = parseLocation(m.content);
  if (loc) return <LocationCard {...loc} mine={mine} />;
  if (m.type === "game") return <AppOnly icon={Gamepad2} text="لعبة" />;
  if (m.type === "location") return <AppOnly icon={MapPin} text="موقع" />;
  return <span className="whitespace-pre-wrap break-words leading-7" dir="auto">{m.content}</span>;
}

const STORY_BG = [["#833AB4", "#E1306C"], ["#F58529", "#DD2A7B"], ["#0F2027", "#2C5364"], ["#11998E", "#38EF7D"], ["#FC466B", "#3F5EFB"], ["#000000", "#434343"], ["#F7971E", "#FFD200"], ["#8E2DE2", "#4A00E0"]];

function StoryRefChip({ r, mine }: { r: NonNullable<Message["storyRef"]>; mine: boolean }) {
  const expired = r.expiresAt ? new Date(r.expiresAt).getTime() < Date.now() : false;
  const bg = STORY_BG[r.background || 0] || STORY_BG[0];
  return (
    <span className={cn("flex items-center gap-2 mb-1.5 rounded-xl p-1.5 pe-3 text-xs", mine ? "bg-white/15" : "bg-h-input")}>
      <span className="w-9 h-12 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-[8px] text-white font-bold leading-3 text-center p-0.5"
        style={r.kind === "text" || expired || !r.imageUrl ? { background: `linear-gradient(135deg, ${bg[0]}, ${bg[1]})` } : undefined}>
        {!expired && r.kind !== "text" && r.imageUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={r.imageUrl} alt="" className="w-full h-full object-cover" />
          : r.kind === "text" && !expired ? (r.text || "").slice(0, 24) : "⌛"}
      </span>
      <span className="opacity-90 font-semibold">{expired ? "ردّ على قصة — القصة لم تعد متاحة" : "ردّ على قصة"}</span>
    </span>
  );
}

/** فقاعة الرسالة: المرسل بتدرّج الهوية (D81B7C→7B2CBF)، المستقبل بخلفية البطاقة */
const MessageBubble = memo(function MessageBubble({ m, mine, onImage, onMenu, onRetry, showTail }: {
  m: Message; mine: boolean; onImage: (src: string) => void; onMenu: (m: Message) => void; onRetry: (m: Message) => void; showTail: boolean;
}) {
  if (m.type === "system") {
    return (
      <div className="flex justify-center my-2">
        <span className="max-w-[85%] text-center text-xs font-semibold text-h-text2 bg-h-chip rounded-full px-3 py-1.5 leading-5">{m.content}</span>
      </div>
    );
  }
  const media = m.type === "image" && !m.disappearing?.enabled && !m.isDeleted;
  const sticker = media && m.imageSource === "sticker";
  const reactions = (m.reactions || []).reduce<Record<string, number>>((a, r) => ((a[r.emoji] = (a[r.emoji] || 0) + 1), a), {});
  const reply = m.replyTo && !m.isDeleted ? m.replyTo : null;

  return (
    <div className={cn("flex group", mine ? "justify-end" : "justify-start", showTail ? "mt-2" : "mt-0.5")}>
      <div className={cn("max-w-[78%] sm:max-w-[65%] flex flex-col", mine ? "items-end" : "items-start")}>
        <div
          onContextMenu={(e) => { e.preventDefault(); onMenu(m); }}
          onDoubleClick={() => onMenu(m)}
          className={cn(
            "relative text-[15px]",
            sticker ? "" : media ? "p-1 rounded-[20px]" : "px-3.5 py-2 rounded-[20px]",
            !sticker && (mine ? "h-bubble-mine" : "bg-h-card text-h-text border border-h-border"),
            !sticker && showTail && (mine ? "rounded-be-md" : "rounded-bs-md"),
            m.local === "failed" && "opacity-70"
          )}
        >
          {m.storyRef && !m.isDeleted && <StoryRefChip r={m.storyRef} mine={mine} />}
          {reply && (
            <span className={cn("block mb-1.5 rounded-xl px-2.5 py-1.5 text-xs border-s-[3px]", mine ? "bg-white/15 border-white/70" : "bg-h-input border-h-primary")}>
              <span className="block font-bold opacity-90">رداً على</span>
              <span className="block truncate opacity-80">{reply.type === "image" ? "📷 صورة" : reply.content || "رسالة"}</span>
            </span>
          )}
          <Body m={m} mine={mine} onImage={onImage} />
          <span className={cn("flex items-center gap-1 text-[11px] mt-0.5 justify-end select-none",
            media && !sticker && "absolute bottom-2 end-2 bg-black/45 text-white rounded-full px-2 py-0.5",
            !media && (mine ? "text-white/80" : "text-h-text2"), sticker && "text-h-text2")}>
            {formatTime(m.createdAt)}
            {mine && <Ticks m={m} />}
          </span>
          {/* زرّ الخيارات عند المرور (سطح المكتب) */}
          <button onClick={() => onMenu(m)} aria-label="خيارات الرسالة"
            className={cn("hidden sm:flex absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-h-card border border-h-border text-h-text2 items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition",
              mine ? "-start-9" : "-end-9")}>
            <span className="leading-none -mt-1.5 font-black">…</span>
          </button>
        </div>
        {Object.keys(reactions).length > 0 && (
          <span className="-mt-1.5 z-10 flex gap-0.5 bg-h-card border border-h-border rounded-full px-1.5 py-0.5 text-xs shadow-sm">
            {Object.entries(reactions).map(([e, n]) => <span key={e}>{e}{n > 1 ? n : ""}</span>)}
          </span>
        )}
        {m.local === "failed" && (
          <button onClick={() => onRetry(m)} className="text-xs text-h-error font-bold mt-1">لم تُرسل — اضغط لإعادة المحاولة</button>
        )}
      </div>
    </div>
  );
});

export default MessageBubble;
