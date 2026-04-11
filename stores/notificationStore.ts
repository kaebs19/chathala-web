"use client";

import { create } from "zustand";
import type { Notification } from "@/types";
import { notificationAPI } from "@/lib/api";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  loadNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  loadNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = (await notificationAPI.getNotifications()) as {
        success: boolean;
        data?: Notification[];
      };
      if (res.success && res.data) {
        set({
          notifications: res.data,
          unreadCount: res.data.filter((n) => !n.read).length,
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  markRead: async (id) => {
    await notificationAPI.markRead(id);
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    await notificationAPI.markAllRead();
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
}));
