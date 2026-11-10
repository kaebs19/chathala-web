"use client";
import { create } from "zustand";

interface PresenceState {
  connected: boolean;
  online: Record<string, boolean>;
  setConnected: (v: boolean) => void;
  set: (id: string, on: boolean) => void;
}

export const usePresence = create<PresenceState>((set) => ({
  connected: false,
  online: {},
  setConnected: (connected) => set({ connected }),
  set: (id, on) => set((s) => ({ online: { ...s.online, [id]: on } })),
}));
