"use client";
import { create } from "zustand";

export type ThemePref = "light" | "dark" | "system";
const KEY = "hala-theme";

function resolve(p: ThemePref): "light" | "dark" {
  if (p !== "system") return p;
  return typeof window !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply(p: ThemePref) {
  const t = resolve(p);
  document.documentElement.dataset.theme = t;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", t === "dark" ? "#0D0010" : "#F6F6F8");
}

interface ThemeState { pref: ThemePref; init: () => () => void; set: (p: ThemePref) => void }

export const useTheme = create<ThemeState>((set, get) => ({
  pref: "system",
  init: () => {
    let p: ThemePref = "system";
    try { p = (localStorage.getItem(KEY) as ThemePref) || "system"; } catch {}
    set({ pref: p });
    apply(p);
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const on = () => { if (get().pref === "system") apply("system"); };
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  },
  set: (p) => {
    try { localStorage.setItem(KEY, p); } catch {}
    set({ pref: p });
    apply(p);
  },
}));
