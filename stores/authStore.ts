"use client";

import { create } from "zustand";
import type { User } from "@/types";
import { authAPI, clearTokens, getToken, setTokens, type ApiResult } from "@/lib/api";

type AuthPayload = { token?: string; refreshToken?: string; user?: User; isNewUser?: boolean };

function extract(res: ApiResult<AuthPayload>): AuthPayload {
  const r = res as unknown as AuthPayload & { data?: AuthPayload };
  return {
    token: r.data?.token || r.token,
    refreshToken: r.data?.refreshToken || r.refreshToken,
    user: r.data?.user || r.user,
    isNewUser: r.data?.isNewUser ?? r.isNewUser,
  };
}

/** الدخول محظور/موقوف: الخادم يرسل code في 403 */
export function authErrorMessage(res: ApiResult): string {
  const code = (res.code as string) || "";
  if (code === "ACCOUNT_BANNED") return "هذا الحساب محظور. للاستفسار تواصل مع الدعم.";
  if (code === "ACCOUNT_SUSPENDED") return res.message || "هذا الحساب موقوف مؤقتاً.";
  if (code === "DEVICE_BANNED") return "هذا الجهاز محظور.";
  if (res.errors?.length) return res.errors[0].message;
  return res.message || "تعذّر تسجيل الدخول";
}

export function myId(u: User | null | undefined) {
  return u?._id || u?.id || "";
}

interface AuthState {
  user: User | null;
  ready: boolean;
  /** يقبل ردّ الدخول/التسجيل/Google/Apple ويحفظ الجلسة */
  acceptSession: (res: ApiResult) => AuthPayload | null;
  loadUser: () => Promise<User | null>;
  setUser: (u: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  ready: false,

  acceptSession: (res) => {
    const p = extract(res as ApiResult<AuthPayload>);
    if (!res.success || !p.token) return null;
    setTokens(p.token, p.refreshToken);
    if (p.user) {
      localStorage.setItem("user", JSON.stringify(p.user));
      set({ user: p.user });
    }
    return p;
  },

  loadUser: async () => {
    if (!getToken()) { set({ ready: true, user: null }); return null; }
    // عرض فوري من الكاش ثم تحديث
    try {
      const cached = localStorage.getItem("user");
      if (cached) set({ user: JSON.parse(cached) });
    } catch {}
    const res = await authAPI.me();
    const d = res.data as { user?: User } | undefined;
    if (res.success && d?.user) {
      localStorage.setItem("user", JSON.stringify(d.user));
      set({ user: d.user, ready: true });
      return d.user;
    }
    if (res.status === 401 || res.status === 403) {
      clearTokens();
      set({ user: null, ready: true });
      return null;
    }
    // خطأ شبكة: نبقى على الكاش
    set({ ready: true });
    return null;
  },

  setUser: (u) => {
    try { localStorage.setItem("user", JSON.stringify(u)); } catch {}
    set({ user: u });
  },

  logout: () => {
    clearTokens();
    try {
      Object.keys(localStorage).filter((k) => k.startsWith("hala-cache:")).forEach((k) => localStorage.removeItem(k));
    } catch {}
    set({ user: null });
  },
}));
