"use client";
import { create } from "zustand";
import { notificationAPI } from "@/lib/api";

interface BadgeState { notifications: number; refresh: () => Promise<void>; set: (n: number) => void }

let last = 0;
export const useBadges = create<BadgeState>((set) => ({
  notifications: 0,
  refresh: async () => {
    if (Date.now() - last < 3000) return;
    last = Date.now();
    const r = await notificationAPI.unreadCount();
    const d = r.data as { count?: number; unreadCount?: number } | undefined;
    const n = (r as unknown as { count?: number }).count ?? d?.count ?? d?.unreadCount;
    if (r.success && typeof n === "number") set({ notifications: n });
  },
  set: (notifications) => set({ notifications }),
}));
