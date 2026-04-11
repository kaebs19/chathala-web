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
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  activeConversation: null,
  isLoading: false,

  loadConversations: async () => {
    set({ isLoading: true });
    try {
      const res = (await chatAPI.getConversations()) as {
        success: boolean;
        data?: Conversation[];
      };
      if (res.success && res.data) {
        set({ conversations: res.data });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  loadMessages: async (conversationId) => {
    try {
      const res = (await chatAPI.getMessages(conversationId)) as {
        success: boolean;
        data?: Message[];
      };
      if (res.success && res.data) {
        set((state) => ({
          messages: { ...state.messages, [conversationId]: res.data! },
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
}));
