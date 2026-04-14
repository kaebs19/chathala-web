"use client";

import { create } from "zustand";
import type { Conversation, Message } from "@/types";
import { chatAPI } from "@/lib/api";

// Debounce helper for loadConversations
let loadDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastLoadTime = 0;
const LOAD_COOLDOWN = 2000; // 2s min between API calls

interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversation: string | null;
  isLoading: boolean;
  totalUnread: number;

  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateConversation: (conversation: Conversation) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  activeConversation: null,
  isLoading: false,
  totalUnread: 0,

  loadConversations: async () => {
    // Debounce: skip if called within cooldown
    const now = Date.now();
    if (now - lastLoadTime < LOAD_COOLDOWN) {
      // Schedule a delayed load instead
      if (loadDebounceTimer) clearTimeout(loadDebounceTimer);
      loadDebounceTimer = setTimeout(() => {
        get().loadConversations();
      }, LOAD_COOLDOWN);
      return;
    }
    lastLoadTime = now;

    const isFirst = get().conversations.length === 0;
    if (isFirst) set({ isLoading: true });

    try {
      const res = (await chatAPI.getConversations()) as {
        success: boolean;
        data?: { conversations?: Conversation[]; totalUnread?: number } | Conversation[];
      };
      if (res.success && res.data) {
        const convos = Array.isArray(res.data) ? res.data : res.data.conversations || [];
        const serverUnread = !Array.isArray(res.data) ? res.data.totalUnread : undefined;
        const totalUnread = serverUnread ?? convos.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        set({ conversations: convos, totalUnread });
      }
    } finally {
      if (isFirst) set({ isLoading: false });
    }
  },

  loadMessages: async (conversationId) => {
    try {
      const res = (await chatAPI.getMessages(conversationId)) as {
        success: boolean;
        data?: { messages?: Message[] } | Message[];
      };
      if (res.success && res.data) {
        const msgs = Array.isArray(res.data) ? res.data : res.data.messages || [];
        set((state) => ({
          messages: { ...state.messages, [conversationId]: msgs },
        }));
      }
    } catch {
      // silent
    }
  },

  setActiveConversation: (id) => {
    if (!id) {
      set({ activeConversation: null });
      return;
    }
    // Mark conversation as read locally
    set((state) => {
      const conv = state.conversations.find((c) => c._id === id);
      const unreadToRemove = conv?.unreadCount || 0;
      return {
        activeConversation: id,
        totalUnread: Math.max(0, state.totalUnread - unreadToRemove),
        conversations: state.conversations.map((c) =>
          c._id === id ? { ...c, unreadCount: 0 } : c
        ),
      };
    });
  },

  addMessage: (conversationId, message) =>
    set((state) => {
      const existing = state.messages[conversationId] || [];
      // Prevent duplicates
      if (existing.some((m) => m._id === message._id)) return state;

      // Update lastMessage in conversations
      let found = false;
      const conversations = state.conversations.map((c) => {
        if (c._id === conversationId) {
          found = true;
          return { ...c, lastMessage: message, updatedAt: message.createdAt };
        }
        return c;
      });

      // Sort: most recent first
      conversations.sort((a, b) => {
        const aT = a.lastMessage?.createdAt || a.updatedAt || a.createdAt;
        const bT = b.lastMessage?.createdAt || b.updatedAt || b.createdAt;
        return new Date(bT).getTime() - new Date(aT).getTime();
      });

      // If conversation not found, reload list
      if (!found) {
        setTimeout(() => get().loadConversations(), 100);
      }

      return {
        messages: { ...state.messages, [conversationId]: [...existing, message] },
        conversations,
      };
    }),

  updateConversation: (conversation) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c._id === conversation._id ? conversation : c
      ),
    })),

  reset: () => {
    if (loadDebounceTimer) clearTimeout(loadDebounceTimer);
    lastLoadTime = 0;
    set({ conversations: [], messages: {}, activeConversation: null, isLoading: false, totalUnread: 0 });
  },
}));
