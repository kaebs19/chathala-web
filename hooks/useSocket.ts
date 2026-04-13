"use client";

import { useEffect, useRef, useCallback } from "react";
import { connectSocket, disconnectSocket, getSocket, SocketEvents } from "@/lib/socket";
import { useChatStore } from "@/stores/chatStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useAuthStore } from "@/stores/authStore";
import type { Message, Notification } from "@/types";

export function useSocket() {
  const { user } = useAuthStore();
  const { addMessage, updateConversation, loadConversations } = useChatStore();
  const { addNotification } = useNotificationStore();
  const connectedRef = useRef(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || connectedRef.current) return;

    const socket = connectSocket(token);
    connectedRef.current = true;

    socket.on(SocketEvents.NEW_MESSAGE, (data: { message: Message; conversationId: string }) => {
      const senderId = typeof data.message.sender === "string"
        ? data.message.sender
        : data.message.sender?._id;
      const myId = user?._id || user?.id;
      if (senderId !== myId) {
        addMessage(data.conversationId, data.message);
      }
    });

    socket.on(SocketEvents.NOTIFICATION, (notification: Notification) => {
      addNotification(notification);
    });

    socket.on(SocketEvents.CONVERSATION_REQUEST, () => {
      loadConversations();
    });

    socket.on(SocketEvents.CONVERSATION_ACCEPTED, () => {
      loadConversations();
    });

    return () => {
      disconnectSocket();
      connectedRef.current = false;
    };
  }, [user, addMessage, addNotification, updateConversation, loadConversations]);

  const joinConversation = useCallback((conversationId: string) => {
    const socket = getSocket();
    socket?.emit(SocketEvents.JOIN_CONVERSATION, { conversationId });
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    const socket = getSocket();
    socket?.emit(SocketEvents.LEAVE_CONVERSATION, { conversationId });
  }, []);

  const emitTyping = useCallback((conversationId: string) => {
    const socket = getSocket();
    socket?.emit(SocketEvents.TYPING, { conversationId });
  }, []);

  const emitStopTyping = useCallback((conversationId: string) => {
    const socket = getSocket();
    socket?.emit(SocketEvents.STOP_TYPING, { conversationId });
  }, []);

  const markRead = useCallback((conversationId: string) => {
    const socket = getSocket();
    socket?.emit(SocketEvents.MARK_READ, { conversationId });
  }, []);

  return { joinConversation, leaveConversation, emitTyping, emitStopTyping, markRead };
}
