"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Providers from "@/components/shared/Providers";
import AppShell from "@/components/hala/AppShell";
import HalaLogo from "@/components/hala/HalaLogo";
import { getToken } from "@/lib/api";
import HiddenAccountView from "@/components/hala/HiddenAccountView";
import { useAuthStore } from "@/stores/authStore";

/** من لديه جلسة لا يرى صفحات الدخول — إلا إكمال الملف بعد Google/Apple (?step=profile) */
function RedirectIfSignedIn() {
  const router = useRouter();
  const params = useSearchParams();
  useEffect(() => {
    if (!getToken() || params.get("step") === "profile") return;
    const next = params.get("next");
    router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : "/explore");
  }, [router, params]);
  return null;
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // دخول حساب مخفي (بريد/Google/Apple) ← شاشة «حسابك مخفي» بدل الصفحة
  const hidden = useAuthStore((s) => s.hidden);
  return (
    <Providers>
      <AppShell>
        <Suspense fallback={null}><RedirectIfSignedIn /></Suspense>
        <div className="min-h-dvh flex flex-col sm:items-center sm:justify-center sm:py-10 px-4">
          <div className="w-full sm:max-w-md mx-auto flex-1 sm:flex-none flex flex-col">
            <div className="flex justify-center pt-8 pb-6 sm:pt-0">
              <Link href="/" aria-label="الرئيسية"><HalaLogo size={52} /></Link>
            </div>
            <div className="flex-1 sm:flex-none sm:bg-h-card sm:border sm:border-h-border sm:rounded-3xl sm:h-shadow sm:p-8">
              {hidden ? <HiddenAccountView data={hidden} /> : children}
            </div>
            <nav className="text-center py-6 text-xs text-h-text2 space-x-3 rtl:space-x-reverse">
              <Link href="/privacy" className="hover:text-h-primary">سياسة الخصوصية</Link>
              <span aria-hidden>·</span>
              <Link href="/terms" className="hover:text-h-primary">شروط الاستخدام</Link>
              <span aria-hidden>·</span>
              <Link href="/support" className="hover:text-h-primary">الدعم</Link>
            </nav>
          </div>
        </div>
      </AppShell>
    </Providers>
  );
}
