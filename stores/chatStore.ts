"use client";

import { create } from "zustand";
import type { Conversation, Message } from "@/types";
import { chatAPI } from "@/lib/api";
import { logWarn } from "@/lib/logger";

// Debounce helper
let loadDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastLoadTime = 0;
const LOAD_COOLDOWN = 2000;

// localStorage cache helpers
const CACHE_KEY = "chat_cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 min

function saveCache(conversations: Conversation[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d: conversations }));
  } catch {
    // storage full or blocked (private mode) — the cache is best-effort
  }
}

function loadCache(): Conversation[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { t, d } = JSON.parse(raw);
    if (Date.now() - t > CACHE_TTL) return null;
    return d;
  } catch {
    // unreadable/corrupt cache entry — fall through to a fresh fetch
    return null;
  }
}

function saveMsgCache(convId: string, msgs: Message[]) {
  try {
    localStorage.setItem(`msgs_${convId}`, JSON.stringify({ t: Date.now(), d: msgs.slice(-100) }));
  } catch {
    // best-effort, same as saveCache
  }
}

function loadMsgCache(convId: string): Message[] | null {
  try {
    const raw = localStorage.getItem(`msgs_${convId}`);
    if (!raw) return null;
    const { t, d } = JSON.parse(raw);
    if (Date.now() - t > CACHE_TTL) return null;
    return d;
  } catch {
    // unreadable/corrupt cache entry — fall through to a fresh fetch
    return null;
  }
}

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
  markConversationRead: (conversationId: string) => Promise<void>;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  activeConversation: null,
  isLoading: false,
  totalUnread: 0,

  loadConversations: async () => {
    const now = Date.now();
    if (now - lastLoadTime < LOAD_COOLDOWN) {
      if (loadDebounceTimer) clearTimeout(loadDebounceTimer);
      loadDebounceTimer = setTimeout(() => get().loadConversations(), LOAD_COOLDOWN);
      return;
    }
    lastLoadTime = now;

    const isFirst = get().conversations.length === 0;

    // Load from cache instantly on first load
    if (isFirst) {
      const cached = loadCache();
      if (cached) {
        const totalUnread = cached.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        set({ conversations: cached, totalUnread });
      } else {
        set({ isLoading: true });
      }
    }

    try {
      const res = (await chatAPI.getConversations()) as {
        success: boolean;
        data?: { conversations?: Conversation[]; totalUnread?: number } | Conversation[];
      };
      if (res.success && res.data) {
        const serverConvos = Array.isArray(res.data) ? res.data : res.data.conversations || [];

        // Preserve local unread state — if we marked a conversation as read locally,
        // don't overwrite with stale server data
        const current = get().conversations;
        const currentMap = new Map(current.map(c => [c._id, c]));
        const activeId = get().activeConversation;

        const convos = serverConvos.map((c) => {
          const local = currentMap.get(c._id);
          // If locally we set unreadCount to 0 (after opening), keep it
          if (local && local.unreadCount === 0 && (c.unreadCount || 0) > 0) {
            return { ...c, unreadCount: 0 };
          }
          // If this is the active conversation, force unread to 0
          if (c._id === activeId) {
            return { ...c, unreadCount: 0 };
          }
          return c;
        });

        const totalUnread = convos.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        set({ conversations: convos, totalUnread });
        saveCache(convos);
      }
    } finally {
      if (isFirst) set({ isLoading: false });
    }
  },

  markConversationRead: async (conversationId: string) => {
    // Update local state immediately
    set((state) => {
      const conv = state.conversations.find((c) => c._id === conversationId);
      const unreadToRemove = conv?.unreadCount || 0;
      if (unreadToRemove === 0) return state;
      return {
        totalUnread: Math.max(0, state.totalUnread - unreadToRemove),
        conversations: state.conversations.map((c) =>
          c._id === conversationId ? { ...c, unreadCount: 0 } : c
        ),
      };
    });
    // Persist on server
    try {
      await chatAPI.markAsRead(conversationId);
    } catch (err) {
      // the socket path also marks it read, so this is not fatal
      logWarn("chats:markAsRead", err);
    }
  },

  loadMessages: async (conversationId) => {
    // Load from cache instantly
    const existing = get().messages[conversationId];
    if (!existing || existing.length === 0) {
      const cached = loadMsgCache(conversationId);
      if (cached) {
        set((state) => ({ messages: { ...state.messages, [conversationId]: cached } }));
      }
    }

    try {
      const res = (await chatAPI.getMessages(conversationId)) as {
        success: boolean;
        data?: { messages?: Message[] } | Message[];
      };
      if (res.success && res.data) {
        const msgs = Array.isArray(res.data) ? res.data : res.data.messages || [];
        set((state) => ({ messages: { ...state.messages, [conversationId]: msgs } }));
        saveMsgCache(conversationId, msgs);
      }
    } catch (err) {
      logWarn("chats:store", err);
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
    // best-effort cache clear; storage may be blocked
    try { localStorage.removeItem(CACHE_KEY); } catch {}
    set({ conversations: [], messages: {}, activeConversation: null, isLoading: false, totalUnread: 0 });
  },
}));
