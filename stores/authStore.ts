"use client";

import { create } from "zustand";
import type { User } from "@/types";
import { authAPI, setToken, removeToken } from "@/lib/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    birthDate: string;
    gender: string;
  }) => Promise<boolean>;
  logout: () => void;
  loadUser: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = (await authAPI.login(email, password)) as {
        success: boolean;
        token?: string;
        refreshToken?: string;
        user?: User;
        data?: { token?: string; refreshToken?: string; user?: User };
        message?: string;
      };
      // السيرفر يرسل token/user داخل data أو في root
      const token = res.token || res.data?.token;
      const refreshToken = res.refreshToken || res.data?.refreshToken;
      const user = res.user || res.data?.user;

      if (res.success && token && user) {
        setToken(token);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        set({ user, isAuthenticated: true, isLoading: false });
        return true;
      }
      set({ error: res.message || "فشل تسجيل الدخول", isLoading: false });
      return false;
    } catch {
      set({ error: "حدث خطأ في الاتصال", isLoading: false });
      return false;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = (await authAPI.register(data)) as {
        success: boolean;
        token?: string;
        refreshToken?: string;
        user?: User;
        data?: { token?: string; refreshToken?: string; user?: User };
        message?: string;
      };
      const token = res.token || res.data?.token;
      const refreshToken = res.refreshToken || res.data?.refreshToken;
      const user = res.user || res.data?.user;

      if (res.success && token && user) {
        setToken(token);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        set({ user, isAuthenticated: true, isLoading: false });
        return true;
      }
      set({ error: res.message || "فشل إنشاء الحساب", isLoading: false });
      return false;
    } catch {
      set({ error: "حدث خطأ في الاتصال", isLoading: false });
      return false;
    }
  },

  logout: () => {
    removeToken();
    set({ user: null, isAuthenticated: false, isLoading: false, error: null });
  },

  loadUser: async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const res = (await authAPI.me()) as {
        success: boolean;
        data?: { user?: User } | User;
      };
      // السيرفر يرسل { data: { user: {...} } }
      const user = res.data && "user" in res.data ? (res.data as { user: User }).user : (res.data as User);
      if (res.success && user) {
        set({ user, isAuthenticated: true, isLoading: false });
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        // جرّب الـ cache
        const cached = localStorage.getItem("user");
        if (cached) {
          set({ user: JSON.parse(cached), isAuthenticated: true, isLoading: false });
        } else {
          removeToken();
          set({ isLoading: false });
        }
      }
    } catch {
      const cached = localStorage.getItem("user");
      if (cached) {
        set({ user: JSON.parse(cached), isAuthenticated: true, isLoading: false });
      } else {
        removeToken();
        set({ isLoading: false });
      }
    }
  },

  setUser: (user) => set({ user, isAuthenticated: true }),
  clearError: () => set({ error: null }),
}));
