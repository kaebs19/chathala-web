"use client";

import { useEffect, useRef, useCallback, useState, useSyncExternalStore } from "react";
import { connectSocket, disconnectSocket, getSocket, SocketEvents } from "@/lib/socket";
import { useChatStore } from "@/stores/chatStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useAuthStore } from "@/stores/authStore";
import type { Message, Notification } from "@/types";

// ━━━ Online users (module-level) ━━━
let onlineUsersSet = new Set<string>();
let onlineListeners: (() => void)[] = [];
export function isUserOnline(userId: string): boolean { return onlineUsersSet.has(userId); }
export function subscribeOnline(fn: () => void) { onlineListeners.push(fn); return () => { onlineListeners = onlineListeners.filter(l => l !== fn); }; }

// ━━━ Connection state (module-level, subscribable) ━━━
let _connected = false;
const connListeners = new Set<() => void>();
function setConnectedGlobal(v: boolean) {
  if (_connected === v) return;
  _connected = v;
  connListeners.forEach(fn => fn());
}
function subscribeConnection(fn: () => void) {
  connListeners.add(fn);
  return () => connListeners.delete(fn);
}
function getConnectionSnapshot() { return _connected; }

function extractConvId(data: Record<string, unknown>, msg?: Message): string {
  if (data.conversationId) return data.conversationId as string;
  if (!msg) return "";
  if (msg.conversationId) return msg.conversationId;
  const conv = msg.conversation;
  if (typeof conv === "string") return conv;
  if (conv && typeof conv === "object" && "_id" in conv) return conv._id;
  return "";
}

let listenersAttached = false;

function ensureSocketInit() {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem("token");
  if (!token) return;

  const socket = connectSocket(token);

  if (listenersAttached) {
    // If already connected update state
    if (socket.connected) setConnectedGlobal(true);
    return;
  }
  listenersAttached = true;

  // ━━━ NEW MESSAGE ━━━
  socket.on(SocketEvents.NEW_MESSAGE, (data: Record<string, unknown>) => {
    const msg = data.message as Message;
    if (!msg?._id) return;
    const conversationId = extractConvId(data, msg);
    if (!conversationId) return;

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

  socket.on(SocketEvents.NOTIFICATION, (n: Notification) => {
    useNotificationStore.getState().addNotification(n);
  });

  socket.on(SocketEvents.CONVERSATION_REQUEST, () => useChatStore.getState().loadConversations());
  socket.on(SocketEvents.CONVERSATION_ACCEPTED, () => useChatStore.getState().loadConversations());
  socket.on(SocketEvents.CONVERSATION_REJECTED, () => useChatStore.getState().loadConversations());

  socket.on(SocketEvents.MESSAGES_READ, (data: { conversationId?: string }) => {
    if (!data.conversationId) return;
    const { messages } = useChatStore.getState();
    const msgs = messages[data.conversationId];
    if (!msgs) return;
    useChatStore.setState((s) => ({
      messages: { ...s.messages, [data.conversationId!]: msgs.map((m) => ({ ...m, isRead: true, isDelivered: true })) },
    }));
  });

  socket.on(SocketEvents.USER_ONLINE, (d: { userId: string }) => { onlineUsersSet.add(d.userId); onlineListeners.forEach(fn => fn()); });
  socket.on(SocketEvents.USER_OFFLINE, (d: { userId: string }) => { onlineUsersSet.delete(d.userId); onlineListeners.forEach(fn => fn()); });
  socket.on(SocketEvents.ONLINE_USERS_LIST, (d: { users: string[] }) => { onlineUsersSet = new Set(d.users); onlineListeners.forEach(fn => fn()); });

  socket.on("connect", () => {
    console.log("[Socket] ✅ Connected:", socket.id);
    setConnectedGlobal(true);
    socket.emit(SocketEvents.GET_ONLINE_USERS);
  });
  socket.on("reconnect", () => {
    console.log("[Socket] 🔄 Reconnected");
    setConnectedGlobal(true);
    useChatStore.getState().loadConversations();
  });
  socket.on("disconnect", (reason: string) => {
    console.log("[Socket] ❌ Disconnected:", reason);
    setConnectedGlobal(false);
  });
  socket.on("connect_error", (err: Error) => {
    console.error("[Socket] ⚠️ Error:", err.message);
    setConnectedGlobal(false);
  });

  if (socket.connected) setConnectedGlobal(true);
}

export function useSocket() {
  // Subscribe to connection state
  const connected = useSyncExternalStore(
    subscribeConnection,
    getConnectionSnapshot,
    () => false
  );

  useEffect(() => {
    ensureSocketInit();
  }, []);

  const joinConversation = useCallback((id: string) => getSocket()?.emit(SocketEvents.JOIN_CONVERSATION, { conversationId: id }), []);
  const leaveConversation = useCallback((id: string) => getSocket()?.emit(SocketEvents.LEAVE_CONVERSATION, { conversationId: id }), []);
  const emitTyping = useCallback((id: string) => getSocket()?.emit(SocketEvents.TYPING, { conversationId: id }), []);
  const emitStopTyping = useCallback((id: string) => getSocket()?.emit(SocketEvents.STOP_TYPING, { conversationId: id }), []);
  const markRead = useCallback((id: string) => getSocket()?.emit(SocketEvents.MARK_READ, { conversationId: id }), []);

  return { connected, joinConversation, leaveConversation, emitTyping, emitStopTyping, markRead };
}

// Expose for debugging
if (typeof window !== "undefined") {
  (window as unknown as { __debugSocket: () => void }).__debugSocket = () => {
    const s = getSocket();
    console.log("Socket state:", {
      exists: !!s,
      connected: s?.connected,
      id: s?.id,
      _connected,
      token: !!localStorage.getItem("token"),
    });
  };
}
