"use client";

import { useEffect, useRef, useCallback } from "react";
import { connectSocket, disconnectSocket, getSocket, SocketEvents } from "@/lib/socket";
import { useChatStore } from "@/stores/chatStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useAuthStore } from "@/stores/authStore";
import type { Message, Notification } from "@/types";

// Global online users set
let onlineUsersSet = new Set<string>();
let onlineListeners: (() => void)[] = [];
export function isUserOnline(userId: string): boolean { return onlineUsersSet.has(userId); }
export function subscribeOnline(fn: () => void) { onlineListeners.push(fn); return () => { onlineListeners = onlineListeners.filter(l => l !== fn); }; }

// Extract conversationId from various server formats
function extractConvId(data: Record<string, unknown>, msg?: Message): string {
  if (data.conversationId) return data.conversationId as string;
  if (!msg) return "";
  if (msg.conversationId) return msg.conversationId;
  const conv = msg.conversation;
  if (typeof conv === "string") return conv;
  if (conv && typeof conv === "object" && "_id" in conv) return conv._id;
  return "";
}

export function useSocket() {
  const connectedRef = useRef(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || connectedRef.current) return;

    const socket = connectSocket(token);
    connectedRef.current = true;

    // ━━━ NEW MESSAGE ━━━
    socket.on(SocketEvents.NEW_MESSAGE, (data: Record<string, unknown>) => {
      const msg = data.message as Message;
      if (!msg) return;

      const conversationId = extractConvId(data, msg);
      if (!conversationId) return;

      const user = useAuthStore.getState().user;
      const myId = user?._id || user?.id;
      const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;

      // Skip if I sent this (I already added it optimistically)
      if (senderId === myId) return;

      useChatStore.getState().addMessage(conversationId, msg);

      // Increment unread if not viewing this conversation
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
    socket.on(SocketEvents.CONVERSATION_REQUEST, () => {
      useChatStore.getState().loadConversations();
    });
    socket.on(SocketEvents.CONVERSATION_ACCEPTED, () => {
      useChatStore.getState().loadConversations();
    });
    socket.on(SocketEvents.CONVERSATION_REJECTED, () => {
      useChatStore.getState().loadConversations();
    });

    // ━━━ READ RECEIPTS ━━━
    socket.on(SocketEvents.MESSAGES_READ, (data: { conversationId?: string; userId?: string }) => {
      if (!data.conversationId) return;
      const { messages } = useChatStore.getState();
      const convMsgs = messages[data.conversationId];
      if (!convMsgs) return;
      // Mark all messages in this conversation as read
      const updated = convMsgs.map((m) => ({ ...m, isRead: true, isDelivered: true }));
      useChatStore.setState((s) => ({
        messages: { ...s.messages, [data.conversationId!]: updated },
      }));
    });

    // ━━━ ONLINE STATUS ━━━
    socket.on(SocketEvents.USER_ONLINE, (data: { userId: string }) => {
      onlineUsersSet.add(data.userId);
      onlineListeners.forEach(fn => fn());
    });
    socket.on(SocketEvents.USER_OFFLINE, (data: { userId: string }) => {
      onlineUsersSet.delete(data.userId);
      onlineListeners.forEach(fn => fn());
    });
    socket.on(SocketEvents.ONLINE_USERS_LIST, (data: { users: string[] }) => {
      onlineUsersSet = new Set(data.users);
      onlineListeners.forEach(fn => fn());
    });

    // ━━━ CONNECTION ━━━
    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket.id);
      socket.emit(SocketEvents.GET_ONLINE_USERS);
    });
    socket.on("reconnect", () => {
      console.log("[Socket] Reconnected");
      // Refresh conversations after reconnect
      useChatStore.getState().loadConversations();
    });
    socket.on("disconnect", (reason: string) => {
      console.log("[Socket] Disconnected:", reason);
    });
    socket.on("connect_error", (err: Error) => {
      console.error("[Socket] Error:", err.message);
    });

    return () => {
      disconnectSocket();
      connectedRef.current = false;
    };
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    getSocket()?.emit(SocketEvents.JOIN_CONVERSATION, { conversationId });
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    getSocket()?.emit(SocketEvents.LEAVE_CONVERSATION, { conversationId });
  }, []);

  const emitTyping = useCallback((conversationId: string) => {
    getSocket()?.emit(SocketEvents.TYPING, { conversationId });
  }, []);

  const emitStopTyping = useCallback((conversationId: string) => {
    getSocket()?.emit(SocketEvents.STOP_TYPING, { conversationId });
  }, []);

  const markRead = useCallback((conversationId: string) => {
    getSocket()?.emit(SocketEvents.MARK_READ, { conversationId });
  }, []);

  return { joinConversation, leaveConversation, emitTyping, emitStopTyping, markRead };
}
