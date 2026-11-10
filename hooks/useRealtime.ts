"use client";

import { useEffect } from "react";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { getToken } from "@/lib/api";
import { useChatStore } from "@/stores/chatStore";
import { usePresence } from "@/stores/presenceStore";
import { useBadges } from "@/stores/badgeStore";
import { toast } from "@/components/hala/Toast";
import { idOf } from "@/lib/utils";
import type { Message } from "@/types";

/** يربط السوكِت مرة واحدة لكل جلسة ويوزّع أحداثه على المخازن. */
export function useRealtime(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const token = getToken();
    if (!token) return;
    const s = connectSocket(token);
    const chat = useChatStore.getState;
    const pres = usePresence.getState;
    const typingTimers = new Map<string, ReturnType<typeof setTimeout>>();

    const onConnect = () => {
      pres().setConnected(true);
      const active = chat().active;
      if (active) s.emit("join-conversation", { conversationId: active });
    };
    const onDisconnect = () => pres().setConnected(false);
    const onReconnect = () => {
      chat().loadConversations();
      const active = chat().active;
      if (active) chat().loadMessages(active);
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("connect_error", onDisconnect);
    s.io.on("reconnect", onReconnect);

    s.on("new-message", (d: { message?: Message; conversationId?: string }) => {
      const m = d?.message;
      if (!m?._id) return;
      if (!m.conversationId && d.conversationId) m.conversationId = String(d.conversationId);
      chat().incoming(m);
      // تأكيد الاستلام للمرسل (✓✓)
      const mine = idOf(m.sender) === chat().me;
      if (!mine) s.emit("message-delivered", { messageId: m._id, conversationId: m.conversationId || idOf(m.conversation) });
    });

    s.on("user-typing", (d: { conversationId?: string; isTyping?: boolean }) => {
      if (!d?.conversationId) return;
      const id = String(d.conversationId);
      chat().setTyping(id, !!d.isTyping);
      clearTimeout(typingTimers.get(id));
      if (d.isTyping) typingTimers.set(id, setTimeout(() => chat().setTyping(id, false), 6000));
    });

    s.on("messages-read", (d: { conversationId?: string }) => d?.conversationId && chat().onPartnerRead(String(d.conversationId)));
    s.on("message-delivered", (d: { conversationId?: string; messageId?: string }) =>
      d?.conversationId && d.messageId && chat().onDelivered(String(d.conversationId), String(d.messageId)));
    s.on("message-reaction", (d: { messageId?: string; reactions?: Message["reactions"] }) =>
      d?.messageId && chat().onReaction(String(d.messageId), d.reactions || []));
    s.on("message-deleted", (d: { messageId?: string; conversationId?: string }) =>
      d?.messageId && d.conversationId && chat().onDeleted(String(d.conversationId), String(d.messageId)));

    s.on("user:online", (d: { userId?: string }) => d?.userId && pres().set(String(d.userId), true));
    s.on("user:offline", (d: { userId?: string }) => d?.userId && pres().set(String(d.userId), false));

    s.on("conversation:request", (d: { conversationId?: string; from?: { name?: string } }) => {
      if (d?.conversationId) chat().fetchConversation(String(d.conversationId));
      toast.info(`طلب محادثة جديد${d?.from?.name ? ` من ${d.from.name}` : ""}`);
    });
    s.on("conversation-accepted", (d: { conversationId?: string; acceptedBy?: string }) => {
      if (d?.conversationId) chat().fetchConversation(String(d.conversationId));
      if (d?.acceptedBy) toast.success(`قبل ${d.acceptedBy} طلبك`);
    });
    s.on("conversation-rejected", (d: { conversationId?: string }) => d?.conversationId && chat().fetchConversation(String(d.conversationId)));
    s.on("conversation:cancelled", (d: { conversationId?: string }) => d?.conversationId && chat().fetchConversation(String(d.conversationId)));
    s.on("conversation:block-state", (d: { conversationIds?: string[]; blockState?: "iBlocked" | "blockedMe" | null }) =>
      (d?.conversationIds || []).forEach((id) => chat().patchConversation(String(id), { blockState: d.blockState ?? null })));

    const refreshBadges = () => useBadges.getState().refresh();
    s.on("notification", refreshBadges);
    s.on("profile-viewed", refreshBadges);

    if (s.connected) onConnect();

    return () => {
      typingTimers.forEach((t) => clearTimeout(t));
      disconnectSocket();
      pres().setConnected(false);
    };
  }, [enabled]);
}

export function emitSocket(event: string, payload: unknown) {
  getSocket()?.emit(event, payload);
}
