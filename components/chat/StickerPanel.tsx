"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Crown, Star } from "lucide-react";
import { Spinner } from "@/components/hala/Common";
import { toast } from "@/components/hala/Toast";
import { isLocked, useStickers, type Sticker } from "@/lib/stickers";
import { cn } from "@/lib/utils";

/** لوحة الملصقات (ChatStickerPanel): المفضلة والأخيرة والفئات. الضغط المطوّل/الزر الأيمن = المفضلة */
export default function StickerPanel({ userId, premium, onPick }: { userId: string; premium: boolean; onPick: (s: Sticker) => void }) {
  const { categories, favorites, recents, load, toggleFavorite, loadedAt } = useStickers();
  const [tab, setTab] = useState<string>("recent");

  useEffect(() => { load(userId); }, [load, userId]);
  useEffect(() => {
    if (tab === "recent" && !recents.length && categories.length) setTab(favorites.length ? "fav" : categories[0]._id);
  }, [categories, recents.length, favorites.length, tab]);

  const cat = categories.find((c) => c._id === tab);
  const list: Sticker[] = tab === "fav" ? favorites : tab === "recent" ? recents : cat?.stickers || [];
  const locked = cat ? isLocked(cat, premium) : false;

  const fav = (s: Sticker) => {
    const on = toggleFavorite(userId, s);
    toast.success(on ? "أُضيف للمفضلة ⭐" : "أُزيل من المفضلة");
  };

  return (
    <div className="border-t border-h-border bg-h-card">
      <div className="flex gap-1 px-2 pt-2 overflow-x-auto h-no-scrollbar" role="tablist" aria-label="فئات الملصقات">
        <TabBtn active={tab === "fav"} onClick={() => setTab("fav")} label="المفضلة"><Star size={17} /></TabBtn>
        <TabBtn active={tab === "recent"} onClick={() => setTab("recent")} label="الأخيرة"><Clock size={17} /></TabBtn>
        {categories.map((c) => (
          <TabBtn key={c._id} active={tab === c._id} onClick={() => setTab(c._id)} label={c.name}>
            <span className="text-xs font-bold whitespace-nowrap px-1 flex items-center gap-1">{c.premium && <Crown size={12} className="text-h-gold" />}{c.name}</span>
          </TabBtn>
        ))}
      </div>
      <div className="h-56 overflow-y-auto h-scroll p-2">
        {!loadedAt && !categories.length ? <div className="h-full flex items-center justify-center"><Spinner /></div>
          : !list.length ? (
            <p className="h-full flex items-center justify-center text-sm text-h-text2 text-center px-6">
              {tab === "fav" ? "اضغط مطوّلاً أو بالزر الأيمن على ملصق لإضافته للمفضلة" : tab === "recent" ? "الملصقات التي ترسلها تظهر هنا" : "لا ملصقات"}
            </p>
          ) : (
            <>
              {locked && (
                <Link href="/premium" className="mb-2 flex items-center justify-center gap-2 rounded-xl bg-h-gold/15 text-h-warning text-sm font-bold py-2">
                  <Crown size={16} /> هذه الفئة لمشتركي هلا+
                </Link>
              )}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {list.map((s) => (
                  <button key={s._id} title="ملصق" aria-label="إرسال ملصق"
                    onClick={() => (locked ? toast.info("هذه الفئة لمشتركي هلا+") : onPick(s))}
                    onContextMenu={(e) => { e.preventDefault(); fav(s); }}
                    className={cn("aspect-square rounded-xl hover:bg-h-input p-1.5 transition active:scale-90 relative", locked && "opacity-50")}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.imageUrl} alt="" loading="lazy" className="w-full h-full object-contain" draggable={false} />
                    {favorites.some((f) => f._id === s._id) && <Star size={11} className="absolute top-0.5 end-0.5 text-h-gold fill-h-gold" />}
                  </button>
                ))}
              </div>
            </>
          )}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button role="tab" aria-selected={active} aria-label={label} title={label} onClick={onClick}
      className={cn("h-9 min-w-9 px-2 rounded-xl flex items-center justify-center shrink-0 transition", active ? "bg-h-primary/12 text-h-primary" : "text-h-text2 hover:bg-h-input")}>
      {children}
    </button>
  );
}
