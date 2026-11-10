"use client";

import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "@/lib/config";

let socket: Socket | null = null;
let socketToken: string | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string): Socket {
  if (socket && socketToken === token) return socket;
  disconnectSocket();
  socketToken = token;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.io.removeAllListeners();
    socket.disconnect();
  }
  socket = null;
  socketToken = null;
}
