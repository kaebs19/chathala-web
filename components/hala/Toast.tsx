"use client";
import { create } from "zustand";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type Kind = "success" | "error" | "info";
type T = { id: number; kind: Kind; text: string };
const useToasts = create<{ list: T[]; push: (k: Kind, t: string) => void; drop: (id: number) => void }>((set) => ({
  list: [],
  push: (kind, text) => {
    const id = Date.now() + Math.random();
    set((s) => ({ list: [...s.list.slice(-2), { id, kind, text }] }));
    setTimeout(() => set((s) => ({ list: s.list.filter((x) => x.id !== id) })), kind === "error" ? 5000 : 3200);
  },
  drop: (id) => set((s) => ({ list: s.list.filter((x) => x.id !== id) })),
}));

export const toast = {
  success: (t: string) => useToasts.getState().push("success", t),
  error: (t: string) => useToasts.getState().push("error", t),
  info: (t: string) => useToasts.getState().push("info", t),
};

export function HalaToasts() {
  const { list, drop } = useToasts();
  const icon = { success: CheckCircle2, error: AlertCircle, info: Info };
  const color = { success: "text-h-success", error: "text-h-error", info: "text-h-primary" };
  return (
    <div className="fixed top-3 inset-x-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none" aria-live="polite">
      {list.map((t) => {
        const I = icon[t.kind];
        return (
          <div key={t.id} role="status" className="pointer-events-auto h-sheet flex items-center gap-3 max-w-md w-full rounded-2xl bg-h-card text-h-text border border-h-border h-shadow px-4 py-3">
            <I size={20} className={`${color[t.kind]} shrink-0`} />
            <p className="text-sm font-semibold flex-1">{t.text}</p>
            <button onClick={() => drop(t.id)} aria-label="إغلاق" className="text-h-text2 p-1"><X size={16} /></button>
          </div>
        );
      })}
    </div>
  );
}
