"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import type { SwipeCard as Card } from "@/types";
import { NameBadges } from "@/components/hala/Badges";
import { countryName } from "@/lib/countries";
import { ageOf, cn, getImageUrl, isRecentlyActive } from "@/lib/utils";

export type SwipeDir = "like" | "dislike" | "superlike";
export type SwipeCardHandle = { fling: (d: SwipeDir) => void };

const THRESHOLD = 110;

/** بطاقة الاكتشاف: سحب يمين = إعجاب، يسار = تخطٍّ، أعلى = سوبر لايك. اللمس على الجانبين يقلّب الصور. */
const SwipeCardView = forwardRef<SwipeCardHandle, {
  card: Card; top: boolean; depth: number; onSwiped: (d: SwipeDir) => void; onOpen: () => void;
}>(function SwipeCardView({ card, top, depth, onSwiped, onOpen }, ref) {
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [leaving, setLeaving] = useState<SwipeDir | null>(null);
  const [photo, setPhoto] = useState(0);
  const start = useRef<{ x: number; y: number; t: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const moved = useRef(false);

  const photos = (card.photos?.length ? card.photos : [card.profileImage]).filter(Boolean) as string[];
  const age = ageOf(card.birthDate);

  const fling = (d: SwipeDir) => {
    if (leaving) return;
    setLeaving(d);
    setTimeout(() => onSwiped(d), 260);
  };
  useImperativeHandle(ref, () => ({ fling }));

  const onDown = (e: React.PointerEvent) => {
    if (!top || leaving) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    setDragging(true);
    moved.current = false;
  };
  const onMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    const x = e.clientX - start.current.x, y = e.clientY - start.current.y;
    if (Math.abs(x) + Math.abs(y) > 6) moved.current = true;
    setDrag({ x, y });
  };
  const onUp = (e: React.PointerEvent) => {
    if (!start.current) return;
    const { x, y } = drag;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    start.current = null;
    setDragging(false);
    if (!moved.current) {
      // لمسة: الثلث العلوي/الجانبان يقلّبان الصور، الأسفل يفتح الملف
      const rx = e.clientX - rect.left, ry = e.clientY - rect.top;
      if (ry > rect.height * 0.72) onOpen();
      else if (photos.length > 1) setPhoto((p) => (rx > rect.width / 2 ? Math.max(0, p - 1) : Math.min(photos.length - 1, p + 1)));
      setDrag({ x: 0, y: 0 });
      return;
    }
    if (x > THRESHOLD) fling("like");
    else if (x < -THRESHOLD) fling("dislike");
    else if (y < -THRESHOLD * 1.2 && Math.abs(x) < THRESHOLD) fling("superlike");
    else setDrag({ x: 0, y: 0 });
  };

  let tx = drag.x, ty = drag.y, rot = drag.x / 18;
  if (leaving === "like") { tx = 700; rot = 22; }
  if (leaving === "dislike") { tx = -700; rot = -22; }
  if (leaving === "superlike") { ty = -900; tx = 0; rot = 0; }
  const scale = top ? 1 : 1 - depth * 0.04;
  const likeOp = Math.min(1, Math.max(0, (leaving === "like" ? THRESHOLD : drag.x) / THRESHOLD));
  const nopeOp = Math.min(1, Math.max(0, (leaving === "dislike" ? THRESHOLD : -drag.x) / THRESHOLD));
  const superOp = Math.min(1, Math.max(0, (leaving === "superlike" ? THRESHOLD : -drag.y) / THRESHOLD)) * (Math.abs(drag.x) < THRESHOLD ? 1 : 0);

  return (
    <div
      className={cn("absolute inset-0 select-none touch-none rounded-[28px] overflow-hidden bg-h-chip h-shadow", top ? "cursor-grab active:cursor-grabbing" : "pointer-events-none")}
      style={{
        transform: `translate(${tx}px, ${ty + (top ? 0 : depth * 10)}px) rotate(${rot}deg) scale(${scale})`,
        transition: dragging ? "none" : "transform .28s cubic-bezier(.2,.8,.3,1)",
        zIndex: 10 - depth,
      }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      aria-hidden={!top}
    >
      {photos[photo] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={getImageUrl(photos[photo])} alt={`صورة ${card.name}`} draggable={false} className="w-full h-full object-cover pointer-events-none" />
      )}

      {photos.length > 1 && (
        <div className="absolute top-3 inset-x-3 flex gap-1" dir="ltr">
          {photos.map((_, i) => <span key={i} className={cn("h-1 flex-1 rounded-full", i === photo ? "bg-white" : "bg-white/40")} />)}
        </div>
      )}

      {/* أختام السحب */}
      <span className="absolute top-10 start-6 px-3 py-1 rounded-xl border-4 border-[#22C55E] text-[#22C55E] text-2xl font-black -rotate-12" style={{ opacity: likeOp }}>إعجاب</span>
      <span className="absolute top-10 end-6 px-3 py-1 rounded-xl border-4 border-[#EF4444] text-[#EF4444] text-2xl font-black rotate-12" style={{ opacity: nopeOp }}>تخطٍّ</span>
      <span className="absolute bottom-40 inset-x-0 mx-auto w-fit px-3 py-1 rounded-xl border-4 border-[#3B82F6] text-[#3B82F6] text-2xl font-black" style={{ opacity: superOp }}>سوبر لايك</span>

      {/* المعلومات (تدرّج داكن كما في iOS) */}
      <div className="absolute inset-x-0 bottom-0 pt-24 pb-5 px-5 bg-gradient-to-t from-black/85 via-black/45 to-transparent text-white">
        <div className="flex items-center gap-2">
          <h2 className="text-[26px] font-extrabold leading-tight truncate">{card.name}</h2>
          {age && <span className="text-2xl font-semibold opacity-90">{age}</span>}
          <NameBadges u={card} size={20} />
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm opacity-90 flex-wrap">
          {isRecentlyActive(card) && <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#22C55E]" /> {card.isOnline ? "متصل الآن" : "نشط مؤخراً"}</span>}
          {card.country && <span>{countryName(card.country)}</span>}
          {typeof card.distance === "number" && <span className="flex items-center gap-1"><MapPin size={14} /> {card.distance < 1 ? "أقل من 1 كم" : `${card.distance} كم`}</span>}
        </div>
        {card.bio && <p className="text-sm mt-2 opacity-90 line-clamp-2 leading-6">{card.bio}</p>}
      </div>
    </div>
  );
});

export default SwipeCardView;
