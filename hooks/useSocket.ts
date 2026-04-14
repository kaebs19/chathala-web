"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { connectSocket, disconnectSocket, getSocket, isConnected, SocketEvents } from "@/lib/socket";
import { useChatStore } from "@/stores/chatStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useAuthStore } from "@/stores/authStore";
import type { Message, Notification } from "@/types";

// Global online users
let onlineUsersSet = new Set<string>();
let onlineListeners: (() => void)[] = [];
export function isUserOnline(userId: string): boolean { return onlineUsersSet.has(userId); }
export function subscribeOnline(fn: () => void) { onlineListeners.push(fn); return () => { onlineListeners = onlineListeners.filter(l => l !== fn); }; }

function extractConvId(data: Record<string, unknown>, msg?: Message): string {
  if (data.conversationId) return data.conversationId as string;
  if (!msg) return "";
  if (msg.conversationId) return msg.conversationId;
  const conv = msg.conversation;
  if (typeof conv === "string") return conv;
  if (conv && typeof conv === "object" && "_id" in conv) return conv._id;
  return "";
}

// Track if we already set up listeners (survives re-renders)
let listenersAttached = false;

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    const socket = connectSocket(token);

    // Only attach listeners once globally
    if (!listenersAttached) {
      listenersAttached = true;

      // ━━━ NEW MESSAGE ━━━
      socket.on(SocketEvents.NEW_MESSAGE, (data: Record<string, unknown>) => {
        const msg = data.message as Message;
        if (!msg?._id) return;
        const conversationId = extractConvId(data, msg);
        if (!conversationId) {
          console.warn("[Socket] new-message without conversationId", data);
          return;
        }
        const user = useAuthStore.getState().user;
        const myId = user?._id || user?.id;
        const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
        if (senderId === myId) return;

        useChatStore.getState().addMessage(conversationId, msg);
        const { activeConversation } = useChatStore.getState();
        if (activeConversation !== conversationId) {
          useChatStore.setState((s) => ({ totalUnread: s.totalUnread + 1 }));
        }
      });

      // ━━━ NOTIFICATIONS ━━━
      socket.on(SocketEvents.NOTIFICATION, (notification: Notification) => {
        useNotificationStore.getState().addNotification(notification);
      });

      // ━━━ CONVERSATION EVENTS ━━━
      socket.on(SocketEvents.CONVERSATION_REQUEST, () => useChatStore.getState().loadConversations());
      socket.on(SocketEvents.CONVERSATION_ACCEPTED, () => useChatStore.getState().loadConversations());
      socket.on(SocketEvents.CONVERSATION_REJECTED, () => useChatStore.getState().loadConversations());

      // ━━━ READ RECEIPTS ━━━
      socket.on(SocketEvents.MESSAGES_READ, (data: { conversationId?: string }) => {
        if (!data.conversationId) return;
        const { messages } = useChatStore.getState();
        const msgs = messages[data.conversationId];
        if (!msgs) return;
        useChatStore.setState((s) => ({
          messages: {
            ...s.messages,
            [data.conversationId!]: msgs.map((m) => ({ ...m, isRead: true, isDelivered: true })),
          },
        }));
      });

      // ━━━ ONLINE ━━━
      socket.on(SocketEvents.USER_ONLINE, (d: { userId: string }) => { onlineUsersSet.add(d.userId); onlineListeners.forEach(fn => fn()); });
      socket.on(SocketEvents.USER_OFFLINE, (d: { userId: string }) => { onlineUsersSet.delete(d.userId); onlineListeners.forEach(fn => fn()); });
      socket.on(SocketEvents.ONLINE_USERS_LIST, (d: { users: string[] }) => { onlineUsersSet = new Set(d.users); onlineListeners.forEach(fn => fn()); });

      // ━━━ CONNECTION ━━━
      socket.on("connect", () => {
        console.log("[Socket] Connected:", socket.id);
        setConnected(true);
        socket.emit(SocketEvents.GET_ONLINE_USERS);
      });
      socket.on("reconnect", () => {
        console.log("[Socket] Reconnected");
        setConnected(true);
        useChatStore.getState().loadConversations();
      });
      socket.on("disconnect", (reason: string) => {
        console.log("[Socket] Disconnected:", reason);
        setConnected(false);
      });
      socket.on("connect_error", (err: Error) => {
        console.error("[Socket] Error:", err.message);
        setConnected(false);
      });
    }

    // Check if already connected
    if (socket.connected) setConnected(true);

    return () => {
      // Don't disconnect on unmount — keep socket alive across navigations
      // Only disconnect on explicit logout
    };
  }, []);

  const joinConversation = useCallback((id: string) => getSocket()?.emit(SocketEvents.JOIN_CONVERSATION, { conversationId: id }), []);
  const leaveConversation = useCallback((id: string) => getSocket()?.emit(SocketEvents.LEAVE_CONVERSATION, { conversationId: id }), []);
  const emitTyping = useCallback((id: string) => getSocket()?.emit(SocketEvents.TYPING, { conversationId: id }), []);
  const emitStopTyping = useCallback((id: string) => getSocket()?.emit(SocketEvents.STOP_TYPING, { conversationId: id }), []);
  const markRead = useCallback((id: string) => getSocket()?.emit(SocketEvents.MARK_READ, { conversationId: id }), []);

  return { connected, joinConversation, leaveConversation, emitTyping, emitStopTyping, markRead };
}
