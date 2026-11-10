"use client";

import { useEffect, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import { authAPI, type ApiResult } from "@/lib/api";
import { initAppleSignIn, signInWithApple } from "@/lib/appleAuth";
import { logError } from "@/lib/logger";

/** متابعة مع Google / Apple — النتيجة تُسلَّم كما هي لـ onResult */
export default function SocialButtons({ onResult, onError, disabled }: {
  onResult: (res: ApiResult) => void; onError: (msg: string) => void; disabled?: boolean;
}) {
  const [busy, setBusy] = useState<"google" | "apple" | null>(null);
  useEffect(() => { initAppleSignIn(); }, []);

  const google = useGoogleLogin({
    onSuccess: async (t) => {
      setBusy("google");
      try {
        const info = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${t.access_token}` },
        }).then((r) => r.json());
        // الخادم لا يثق بهذه البيانات: يتحقق من access_token عند Google (tokeninfo)
        onResult(await authAPI.google(t.access_token, { sub: info.sub, email: info.email, name: info.name, picture: info.picture }));
      } catch (e) {
        logError("auth:google", e);
        onError("فشل الاتصال بـ Google");
      } finally { setBusy(null); }
    },
    onError: () => onError("فشل تسجيل الدخول عبر Google"),
  });

  const apple = async () => {
    setBusy("apple");
    try {
      const a = await signInWithApple();
      if (!a) { onError("أُلغي تسجيل الدخول"); return; }
      onResult(await authAPI.apple({ identityToken: a.identityToken, authorizationCode: a.authorizationCode, fullName: a.fullName, email: a.email }));
    } catch (e) {
      logError("auth:apple", e);
      onError("فشل الاتصال بـ Apple");
    } finally { setBusy(null); }
  };

  const cls = "w-full h-[52px] rounded-xl border border-h-border bg-h-card text-h-text font-bold flex items-center justify-center gap-3 hover:bg-h-input transition disabled:opacity-50";
  return (
    <div className="space-y-3">
      <button type="button" className={cls} onClick={() => google()} disabled={disabled || !!busy}>
        {busy === "google" ? <Loader2 size={20} className="animate-spin" /> : (
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
        )}
        متابعة مع Google
      </button>
      <button type="button" className={cls} onClick={apple} disabled={disabled || !!busy}>
        {busy === "apple" ? <Loader2 size={20} className="animate-spin" /> : (
          <svg width="18" height="20" viewBox="0 0 384 512" fill="currentColor" aria-hidden><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
        )}
        متابعة مع Apple
      </button>
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-6 text-xs text-h-text2">
      <span className="flex-1 h-px bg-h-divider" /> أو <span className="flex-1 h-px bg-h-divider" />
    </div>
  );
}
