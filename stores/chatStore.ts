"use client";

import { create } from "zustand";
import type { Conversation, Message } from "@/types";
import { chatAPI } from "@/lib/api";
import { idOf } from "@/lib/utils";

type Thread = { items: Message[]; hasMore: boolean; nextBefore: string | null; loaded: boolean; loadingOlder?: boolean };

const CACHE = "hala-cache:conversations";

function sortConvs(list: Conversation[]) {
  const t = (c: Conversation) => new Date(c.lastMessage?.createdAt || c.updatedAt || c.createdAt).getTime();
  return [...list].sort((a, b) => t(b) - t(a));
}

export function convIdOf(m: Message): string {
  return m.conversationId || idOf(m.conversation);
}

export function senderIdOf(m: Message): string {
  return idOf(m.sender) || idOf(m.senderUser);
}

interface ChatState {
  me: string;
  conversations: Conversation[];
  loaded: boolean;
  threads: Record<string, Thread>;
  typing: Record<string, number>;
  active: string | null;

  setMe: (id: string) => void;
  loadConversations: () => Promise<void>;
  fetchConversation: (id: string) => Promise<Conversation | null>;
  patchConversation: (id: string, patch: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;
  loadMessages: (id: string) => Promise<void>;
  loadOlder: (id: string) => Promise<void>;
  setActive: (id: string | null) => void;
  incoming: (m: Message) => void;
  sendText: (convId: string, text: string, replyTo?: Message | null) => Promise<{ ok: boolean; message?: string; res?: Record<string, unknown> }>;
  sendImage: (convId: string, file: Blob, preview: string, dims: { width: number; height: number }) => Promise<{ ok: boolean; message?: string }>;
  sendSticker: (convId: string, sticker: { _id: string; imageUrl: string }) => Promise<{ ok: boolean; message?: string }>;
  retry: (convId: string, tempId: string) => void;
  markRead: (convId: string) => void;
  onPartnerRead: (convId: string) => void;
  onDelivered: (convId: string, messageId: string) => void;
  setTyping: (convId: string, on: boolean) => void;
  onReaction: (messageId: string, reactions: Message["reactions"]) => void;
  onDeleted: (convId: string, messageId: string) => void;
  reset: () => void;
}

// الرسائل الفاشلة تُحفظ مع ملفها لإعادة المحاولة
const pendingFiles = new Map<string, { file: Blob; dims: { width: number; height: number }; text?: string; replyTo?: Message | null }>();

export const useChatStore = create<ChatState>((set, get) => {
  const putThread = (id: string, fn: (t: Thread) => Thread) =>
    set((s) => ({ threads: { ...s.threads, [id]: fn(s.threads[id] || { items: [], hasMore: false, nextBefore: null, loaded: false }) } }));

  const upsertMsg = (convId: string, msg: Message, replaceTemp?: string) =>
    putThread(convId, (t) => {
      let items = t.items.filter((x) => x._id !== replaceTemp);
      const i = items.findIndex((x) => x._id === msg._id);
      if (i >= 0) items = items.map((x, k) => (k === i ? { ...x, ...msg, local: undefined } : x));
      else items = [...items, msg];
      return { ...t, items };
    });

  const bumpConv = (convId: string, msg: Message, incUnread: boolean) => {
    const { conversations } = get();
    if (!conversations.some((c) => c._id === convId)) {
      get().fetchConversation(convId);
      return;
    }
    set({
      conversations: sortConvs(
        conversations.map((c) =>
          c._id === convId
            ? { ...c, lastMessage: msg, updatedAt: msg.createdAt, unreadCount: incUnread ? (c.unreadCount || 0) + 1 : c.unreadCount }
            : c
        )
      ),
    });
  };

  return {
    me: "",
    conversations: [],
    loaded: false,
    threads: {},
    typing: {},
    active: null,

    setMe: (id) => set({ me: id }),

    loadConversations: async () => {
      if (!get().loaded) {
        try {
          const c = localStorage.getItem(CACHE);
          if (c) set({ conversations: JSON.parse(c) });
        } catch {}
      }
      const res = await chatAPI.conversations("all=true&limit=200");
      const d = res.data as { conversations?: Conversation[] } | undefined;
      if (res.success && d?.conversations) {
        const active = get().active;
        const list = sortConvs(d.conversations.map((c) => (c._id === active ? { ...c, unreadCount: 0 } : c)));
        set({ conversations: list, loaded: true });
        try { localStorage.setItem(CACHE, JSON.stringify(list.slice(0, 100))); } catch {}
      } else set({ loaded: true });
    },

    fetchConversation: async (id) => {
      const res = await chatAPI.conversation(id);
      const d = res.data as { conversation?: Conversation } | Conversation | undefined;
      const conv = (d && "conversation" in d ? d.conversation : (d as Conversation)) || null;
      if (res.success && conv?._id) {
        set((s) => ({ conversations: sortConvs([conv, ...s.conversations.filter((c) => c._id !== conv._id)]) }));
        return conv;
      }
      return null;
    },

    patchConversation: (id, patch) =>
      set((s) => {
        const cur = s.conversations.find((c) => c._id === id);
        // لا تغيير = لا حالة جديدة (يمنع إعادة رسم بلا داعٍ)
        if (!cur || (Object.keys(patch) as (keyof Conversation)[]).every((k) => cur[k] === patch[k])) return s;
        return { conversations: s.conversations.map((c) => (c._id === id ? { ...c, ...patch } : c)) };
      }),

    removeConversation: (id) => set((s) => ({ conversations: s.conversations.filter((c) => c._id !== id) })),

    loadMessages: async (id) => {
      const res = await chatAPI.messages(id);
      const d = res.data as { messages?: Message[]; hasMore?: boolean; nextBefore?: string } | undefined;
      if (res.success && d?.messages) {
        putThread(id, (t) => {
          // أبقِ المتفائلة/الفاشلة المحلية وما وصل بالسوكِت بعد آخر رسالة محمّلة
          const ids = new Set(d.messages!.map((m) => m._id));
          const extra = t.items.filter((m) => m.local || !ids.has(m._id) && new Date(m.createdAt) > new Date(d.messages!.at(-1)?.createdAt || 0));
          return { items: [...d.messages!, ...extra], hasMore: !!d.hasMore, nextBefore: d.nextBefore || null, loaded: true };
        });
      } else putThread(id, (t) => ({ ...t, loaded: true }));
    },

    loadOlder: async (id) => {
      const t = get().threads[id];
      if (!t?.hasMore || !t.nextBefore || t.loadingOlder) return;
      putThread(id, (x) => ({ ...x, loadingOlder: true }));
      const res = await chatAPI.messages(id, t.nextBefore);
      const d = res.data as { messages?: Message[]; hasMore?: boolean; nextBefore?: string } | undefined;
      putThread(id, (x) => {
        if (!res.success || !d?.messages) return { ...x, loadingOlder: false };
        const have = new Set(x.items.map((m) => m._id));
        return { ...x, items: [...d.messages.filter((m) => !have.has(m._id)), ...x.items], hasMore: !!d.hasMore, nextBefore: d.nextBefore || null, loadingOlder: false };
      });
    },

    setActive: (id) => {
      set({ active: id });
      if (id) get().patchConversation(id, { unreadCount: 0 });
    },

    incoming: (m) => {
      const convId = convIdOf(m);
      if (!convId || !m._id) return;
      const mine = senderIdOf(m) === get().me;
      if (mine) {
        // نسختي من جهاز آخر أو صدى إرسالي — تُدمج مع المتفائلة إن وُجدت بنفس النص
        const t = get().threads[convId];
        const temp = t?.items.find((x) => x.local === "sending" && x.type === m.type && (m.type !== "text" || x.content === m.content) && (x.imageSource === "sticker") === (m.imageSource === "sticker"));
        if (temp) return; // ردّ HTTP سيستبدلها
      }
      upsertMsg(convId, m);
      const isActive = get().active === convId && typeof document !== "undefined" && document.visibilityState === "visible";
      bumpConv(convId, m, !mine && !isActive);
      if (!mine) get().setTyping(convId, false);
    },

    sendText: async (convId, text, replyTo) => {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const temp: Message = {
        _id: tempId, conversationId: convId, sender: get().me, content: text, type: "text",
        createdAt: new Date().toISOString(), local: "sending",
        replyTo: replyTo ? { _id: replyTo._id, content: replyTo.content, type: replyTo.type, sender: replyTo.sender } : null,
      };
      upsertMsg(convId, temp);
      bumpConv(convId, temp, false);
      const res = await chatAPI.send(convId, text, replyTo?._id);
      const msg = (res.data as { message?: Message } | undefined)?.message;
      if (res.success && msg) {
        upsertMsg(convId, { ...msg, conversationId: convId }, tempId);
        bumpConv(convId, msg, false);
        return { ok: true, res: res as unknown as Record<string, unknown> };
      }
      pendingFiles.set(tempId, { file: new Blob(), dims: { width: 0, height: 0 }, text, replyTo });
      putThread(convId, (t) => ({ ...t, items: t.items.map((x) => (x._id === tempId ? { ...x, local: "failed" } : x)) }));
      return { ok: false, message: res.message, res: res as unknown as Record<string, unknown> };
    },

    sendImage: async (convId, file, preview, dims) => {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const temp: Message = {
        _id: tempId, conversationId: convId, sender: get().me, content: "", type: "image",
        mediaWidth: dims.width, mediaHeight: dims.height, localPreview: preview,
        createdAt: new Date().toISOString(), local: "sending",
      };
      upsertMsg(convId, temp);
      const res = await chatAPI.sendImage(convId, file, "", dims);
      const msg = (res.data as { message?: Message } | undefined)?.message;
      if (res.success && msg) {
        upsertMsg(convId, { ...msg, conversationId: convId, localPreview: preview }, tempId);
        bumpConv(convId, msg, false);
        return { ok: true };
      }
      pendingFiles.set(tempId, { file, dims });
      putThread(convId, (t) => ({ ...t, items: t.items.map((x) => (x._id === tempId ? { ...x, local: "failed" } : x)) }));
      return { ok: false, message: res.message };
    },

    sendSticker: async (convId, sticker) => {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const temp: Message = {
        _id: tempId, conversationId: convId, sender: get().me, content: "", type: "image", imageSource: "sticker",
        localPreview: sticker.imageUrl, createdAt: new Date().toISOString(), local: "sending",
      };
      upsertMsg(convId, temp);
      const res = await chatAPI.sendSticker(convId, sticker._id);
      const msg = (res.data as { message?: Message } | undefined)?.message;
      if (res.success && msg) {
        upsertMsg(convId, { ...msg, conversationId: convId }, tempId);
        bumpConv(convId, msg, false);
        return { ok: true };
      }
      // الملصق لا يُعاد إرساله (قد يكون أُزيل من اللوحة) — يُحذف مع رسالة الخادم
      putThread(convId, (t) => ({ ...t, items: t.items.filter((x) => x._id !== tempId) }));
      return { ok: false, message: res.message };
    },

    retry: (convId, tempId) => {
      const t = get().threads[convId];
      const m = t?.items.find((x) => x._id === tempId);
      const p = pendingFiles.get(tempId);
      if (!m || !p) return;
      pendingFiles.delete(tempId);
      putThread(convId, (x) => ({ ...x, items: x.items.filter((i) => i._id !== tempId) }));
      if (m.type === "image") get().sendImage(convId, p.file, m.localPreview || "", p.dims);
      else get().sendText(convId, p.text || m.content, p.replyTo);
    },

    markRead: (convId) => {
      get().patchConversation(convId, { unreadCount: 0 });
      chatAPI.markRead(convId);
    },

    onPartnerRead: (convId) => {
      const me = get().me;
      putThread(convId, (t) => ({ ...t, items: t.items.map((m) => (senderIdOf(m) === me && !m.local ? { ...m, isRead: true, isDelivered: true } : m)) }));
      const c = get().conversations.find((x) => x._id === convId);
      if (c?.lastMessage && senderIdOf(c.lastMessage) === me)
        get().patchConversation(convId, { lastMessage: { ...c.lastMessage, isRead: true, isDelivered: true } });
    },

    onDelivered: (convId, messageId) => {
      putThread(convId, (t) => ({ ...t, items: t.items.map((m) => (m._id === messageId ? { ...m, isDelivered: true } : m)) }));
      const c = get().conversations.find((x) => x._id === convId);
      if (c?.lastMessage?._id === messageId) get().patchConversation(convId, { lastMessage: { ...c.lastMessage, isDelivered: true } });
    },

    setTyping: (convId, on) =>
      set((s) => {
        const typing = { ...s.typing };
        if (on) typing[convId] = Date.now();
        else delete typing[convId];
        return { typing };
      }),

    onReaction: (messageId, reactions) =>
      set((s) => {
        const threads = { ...s.threads };
        for (const k of Object.keys(threads)) {
          if (threads[k].items.some((m) => m._id === messageId))
            threads[k] = { ...threads[k], items: threads[k].items.map((m) => (m._id === messageId ? { ...m, reactions } : m)) };
        }
        return { threads };
      }),

    onDeleted: (convId, messageId) =>
      putThread(convId, (t) => ({ ...t, items: t.items.map((m) => (m._id === messageId ? { ...m, isDeleted: true, content: "", mediaUrl: null } : m)) })),

    reset: () => {
      pendingFiles.clear();
      set({ conversations: [], loaded: false, threads: {}, typing: {}, active: null, me: "" });
    },
  };
});
