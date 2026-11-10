"use client";

import { create } from "zustand";
import { storyApi, type Story, type StoryOwner, type StoryStatus } from "@/lib/storyApi";

export interface ViewerState { ownerIds: string[]; startIndex: number; mine?: boolean }

interface StoryState {
  feed: StoryOwner[];
  feedLoaded: boolean;
  mine: Story[];
  max: number;
  statuses: Record<string, StoryStatus>;
  viewer: ViewerState | null;
  composerOpen: boolean;

  refreshFeed: () => Promise<void>;
  refreshMine: () => Promise<void>;
  refreshStatuses: (ids: string[]) => Promise<void>;
  markSeen: (userId: string) => void;
  openViewer: (v: ViewerState) => void;
  closeViewer: () => void;
  openComposer: () => void;
  closeComposer: () => void;
  reset: () => void;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  feed: [],
  feedLoaded: false,
  mine: [],
  max: 3,
  statuses: {},
  viewer: null,
  composerOpen: false,

  refreshFeed: async () => {
    const r = await storyApi.feed(30);
    if (r.success && r.data?.owners) {
      const statuses = { ...get().statuses };
      r.data.owners.forEach((o) => { statuses[o._id] = { count: o.count, hasUnseen: o.hasUnseen }; });
      set({ feed: r.data.owners, feedLoaded: true, statuses });
    } else set({ feedLoaded: true });
  },

  refreshMine: async () => {
    const r = await storyApi.me();
    if (r.success && r.data) set({ mine: r.data.stories || [], max: r.data.max || 3 });
  },

  refreshStatuses: async (ids) => {
    const uniq = [...new Set(ids.filter(Boolean))].slice(0, 200);
    for (let i = 0; i < uniq.length; i += 40) {
      const batch = uniq.slice(i, i + 40);
      const r = await storyApi.status(batch);
      if (!r.success) continue;
      const got = r.data?.statuses || {};
      set((s) => {
        const statuses = { ...s.statuses };
        // من لم يُرجعه الخادم بلا قصص الآن
        batch.forEach((id) => { if (got[id]) statuses[id] = got[id]; else delete statuses[id]; });
        return { statuses };
      });
    }
  },

  markSeen: (userId) =>
    set((s) => ({
      statuses: s.statuses[userId] ? { ...s.statuses, [userId]: { ...s.statuses[userId], hasUnseen: false } } : s.statuses,
      feed: s.feed.map((o) => (o._id === userId ? { ...o, hasUnseen: false } : o)),
    })),

  openViewer: (v) => set({ viewer: v }),
  closeViewer: () => {
    set({ viewer: null });
    // ترتيب الخلاصة يتغيّر بعد المشاهدة (غير المشاهَد أولاً)
    get().refreshFeed();
  },
  openComposer: () => set({ composerOpen: true }),
  closeComposer: () => set({ composerOpen: false }),
  reset: () => set({ feed: [], feedLoaded: false, mine: [], statuses: {}, viewer: null, composerOpen: false }),
}));
