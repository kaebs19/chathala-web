"use client";

import { create } from "zustand";
import type { Conversation, Message } from "@/types";
import { chatAPI } from "@/lib/api";

interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversation: string | null;
  isLoading: boolean;

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

  loadConversations: async () => {
    set({ isLoading: true });
    try {
      // Server: { success, data: { conversations: [...], totalUnread } }
      const res = (await chatAPI.getConversations()) as {
        success: boolean;
        data?: { conversations?: Conversation[]; totalUnread?: number } | Conversation[];
      };
      if (res.success && res.data) {
        const convos = Array.isArray(res.data) ? res.data : res.data.conversations || [];
        set({ conversations: convos });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  loadMessages: async (conversationId) => {
    try {
      // Server: { success, data: { messages: [...] } }
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
      // handle silently
    }
  },

  setActiveConversation: (id) => set({ activeConversation: id }),

  addMessage: (conversationId, message) =>
    set((state) => {
      const existing = state.messages[conversationId] || [];
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...existing, message],
        },
      };
    }),

  updateConversation: (conversation) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c._id === conversation._id ? conversation : c
      ),
    })),

  reset: () => set({ conversations: [], messages: {}, activeConversation: null, isLoading: false }),
}));
