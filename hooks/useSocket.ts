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

export function useSocket() {
  const connectedRef = useRef(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || connectedRef.current) return;

    const socket = connectSocket(token);
    connectedRef.current = true;

    // Use getState() directly to avoid stale closures
    socket.on(SocketEvents.NEW_MESSAGE, (data: { message: Message; conversationId: string }) => {
      const user = useAuthStore.getState().user;
      const myId = user?._id || user?.id;
      const senderId = typeof data.message.sender === "string"
        ? data.message.sender
        : data.message.sender?._id;

      if (senderId !== myId) {
        useChatStore.getState().addMessage(data.conversationId, data.message);
        const { activeConversation } = useChatStore.getState();
        if (activeConversation !== data.conversationId) {
          useChatStore.setState((s) => ({ totalUnread: s.totalUnread + 1 }));
        }
      }
    });

    socket.on(SocketEvents.NOTIFICATION, (notification: Notification) => {
      useNotificationStore.getState().addNotification(notification);
    });

    socket.on(SocketEvents.CONVERSATION_REQUEST, () => {
      useChatStore.getState().loadConversations();
    });

    socket.on(SocketEvents.CONVERSATION_ACCEPTED, () => {
      useChatStore.getState().loadConversations();
    });

    socket.on(SocketEvents.CONVERSATION_REJECTED, () => {
      useChatStore.getState().loadConversations();
    });

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

    socket.on("connect", () => {
      console.log("[Socket] Connected");
      socket.emit(SocketEvents.GET_ONLINE_USERS);
    });

    socket.on("disconnect", (reason: string) => {
      console.log("[Socket] Disconnected:", reason);
    });

    socket.on("connect_error", (err: Error) => {
      console.error("[Socket] Connection error:", err.message);
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
