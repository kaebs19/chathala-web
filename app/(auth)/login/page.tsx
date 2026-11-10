"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import Button from "@/components/hala/Button";
import Field from "@/components/hala/Field";
import SocialButtons, { OrDivider } from "@/components/hala/SocialButtons";
import { authAPI, type ApiResult } from "@/lib/api";
import { authErrorMessage, useAuthStore } from "@/stores/authStore";

function safeNext(n: string | null) {
  return n && n.startsWith("/") && !n.startsWith("//") ? n : "/explore";
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const acceptSession = useAuthStore((s) => s.acceptSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const finish = (res: ApiResult) => {
    const p = acceptSession(res);
    if (!p) { setError(authErrorMessage(res)); return; }
    const u = p.user;
    if (p.isNewUser || (u && (!u.birthDate || !u.gender))) router.replace("/register?step=profile");
    else router.replace(safeNext(params.get("next")));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError(""); setLoading(true);
    const res = await authAPI.login(email.trim().toLowerCase(), password);
    setLoading(false);
    finish(res);
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-center">مرحباً بعودتك</h1>
      <p className="text-sm text-h-text2 text-center mt-1 mb-7">سجّل دخولك لتكمل محادثاتك</p>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="البريد الإلكتروني" type="email" autoComplete="email" inputMode="email" dir="ltr"
          icon={<Mail size={18} />} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
        <Field label="كلمة المرور" type="password" autoComplete="current-password" dir="ltr"
          icon={<Lock size={18} />} value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="flex justify-end -mt-1">
          <Link href="/forgot-password" className="text-sm font-bold text-h-primary hover:underline">نسيت كلمة المرور؟</Link>
        </div>
        {error && <p role="alert" className="text-sm font-semibold text-h-error bg-h-error/10 rounded-xl px-4 py-3">{error}</p>}
        <Button type="submit" loading={loading} disabled={!email.trim() || !password}>تسجيل الدخول</Button>
      </form>

      <OrDivider />
      <SocialButtons onResult={finish} onError={setError} disabled={loading} />

      <p className="text-center text-sm text-h-text2 mt-7">
        ليس لديك حساب؟ <Link href="/register" className="text-h-primary font-bold hover:underline">أنشئ حساباً</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginForm /></Suspense>;
}
