"use client";
import { create } from "zustand";
import { stickerAPI } from "@/lib/api";

export type Sticker = { _id: string; imageUrl: string };
export type StickerCategory = { _id: string; name: string; premium?: boolean; stickers: Sticker[] };

const TTL = 5 * 60 * 1000; // كما في iOS: المُزال من اللوحة يختفي خلال 5 دقائق
const FAV = (u: string) => `hala-stickers-fav:${u}`;
const REC = (u: string) => `hala-stickers-recent:${u}`;

function readList(k: string): Sticker[] {
  try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; }
}
function writeList(k: string, v: Sticker[]) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
}

interface StickerState {
  categories: StickerCategory[];
  loadedAt: number;
  favorites: Sticker[];
  recents: Sticker[];
  load: (userId: string) => Promise<void>;
  toggleFavorite: (userId: string, s: Sticker) => boolean;
  pushRecent: (userId: string, s: Sticker) => void;
}

export const useStickers = create<StickerState>((set, get) => ({
  categories: [],
  loadedAt: 0,
  favorites: [],
  recents: [],
  load: async (userId) => {
    const fav = readList(FAV(userId)), rec = readList(REC(userId));
    set({ favorites: fav, recents: rec });
    if (Date.now() - get().loadedAt < TTL && get().categories.length) return;
    const r = await stickerAPI.list();
    const cats = (r.data as { categories?: StickerCategory[] } | undefined)?.categories;
    if (r.success && cats) {
      // المفضلة/الأخيرة: احذف ما أُزيل من اللوحة
      const live = new Set(cats.flatMap((c) => c.stickers.map((s) => s._id)));
      const f = fav.filter((s) => live.has(s._id)), re = rec.filter((s) => live.has(s._id));
      writeList(FAV(userId), f); writeList(REC(userId), re);
      set({ categories: cats, loadedAt: Date.now(), favorites: f, recents: re });
    }
  },
  toggleFavorite: (userId, s) => {
    const fav = get().favorites;
    const on = !fav.some((x) => x._id === s._id);
    const next = on ? [s, ...fav].slice(0, 60) : fav.filter((x) => x._id !== s._id);
    writeList(FAV(userId), next);
    set({ favorites: next });
    return on;
  },
  pushRecent: (userId, s) => {
    const next = [s, ...get().recents.filter((x) => x._id !== s._id)].slice(0, 24);
    writeList(REC(userId), next);
    set({ recents: next });
  },
}));

/** الفئة المقفلة لغير المشترك؟ */
export function isLocked(c: StickerCategory, premium: boolean) {
  return !!c.premium && !premium;
}
