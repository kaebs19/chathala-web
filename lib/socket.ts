"use client";

import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "https://matchhala.chathala.com";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  // Disconnect stale socket if exists
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    reconnectionAttempts: Infinity,
    timeout: 15000,
    forceNew: false,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export const SocketEvents = {
  // Client → Server
  JOIN_CONVERSATION: "join-conversation",
  LEAVE_CONVERSATION: "leave-conversation",
  TYPING: "typing",
  STOP_TYPING: "stop-typing",
  MARK_READ: "mark-read",
  MESSAGE_DELIVERED: "message-delivered",
  SEND_MESSAGE: "send-message",
  GET_ONLINE_USERS: "get-online-users",

  // Server → Client
  AUTHENTICATED: "authenticated",
  NEW_MESSAGE: "new-message",
  USER_TYPING: "user-typing",
  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:offline",
  ONLINE_USERS_LIST: "online-users-list",
  CONVERSATION_REQUEST: "conversation:request",
  CONVERSATION_ACCEPTED: "conversation-accepted",
  CONVERSATION_REJECTED: "conversation-rejected",
  NOTIFICATION: "notification",
  PROFILE_VIEWED: "profile-viewed",
  MESSAGE_REACTION: "message-reaction",
  MESSAGE_DELETED: "message-deleted",
  MESSAGES_READ: "messages-read",
  CHAT_MODE_CHANGED: "chat-mode-changed",
} as const;
