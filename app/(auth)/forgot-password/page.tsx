"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, KeyRound, Lock, Mail } from "lucide-react";
import Button from "@/components/hala/Button";
import Field from "@/components/hala/Field";
import { authAPI } from "@/lib/api";

type Step = "email" | "reset" | "done";

// بريد الرمز يحمل زراً إلى /forgot-password?email=…&code=… فتُفتح الخطوة
// الثانية مباشرة والرمز مُعبّأ. على الآيفون نفس الرابط Universal Link يفتح التطبيق.
function ForgotPasswordForm() {
  const params = useSearchParams();
  const prefillCode = params.get("code") ?? "";
  const [step, setStep] = useState<Step>(prefillCode ? "reset" : "email");
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState(prefillCode);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(""); setNotice("");
    const res = await authAPI.forgotPassword(email.trim());
    setLoading(false);
    if (res.success) {
      setStep("reset");
      setNotice("أرسلنا رمز التحقق إلى بريدك. أدخله مع كلمة المرور الجديدة.");
    } else setError(res.message || "حدث خطأ، تأكد من البريد الإلكتروني");
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setNotice("");
    if (!email.trim()) return setError("البريد الإلكتروني مطلوب");
    if (!/^\d{6}$/.test(code.trim())) return setError("رمز التحقق مكوّن من 6 أرقام");
    if (password.length < 6) return setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    if (password !== confirm) return setError("كلمتا المرور غير متطابقتين");
    setLoading(true);
    const res = await authAPI.resetPassword(email.trim(), code.trim(), password);
    setLoading(false);
    if (res.success) setStep("done");
    else setError(res.message || "رمز التحقق غير صحيح أو منتهي الصلاحية");
  };

  if (step === "done") {
    return (
      <div className="text-center py-4">
        <div className="w-20 h-20 rounded-full bg-h-success/12 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={40} className="text-h-success" />
        </div>
        <h1 className="text-2xl font-extrabold mb-2">تم تغيير كلمة المرور</h1>
        <p className="text-sm text-h-text2 mb-7">سجّل دخولك الآن بكلمة المرور الجديدة.</p>
        <Link href="/login"><Button>تسجيل الدخول</Button></Link>
      </div>
    );
  }

  const msg = (
    <>
      {notice && <p role="status" className="text-sm font-semibold text-h-success bg-h-success/10 rounded-xl px-4 py-3">{notice}</p>}
      {error && <p role="alert" className="text-sm font-semibold text-h-error bg-h-error/10 rounded-xl px-4 py-3">{error}</p>}
    </>
  );

  if (step === "reset") {
    return (
      <div>
        <h1 className="text-2xl font-extrabold text-center">كلمة مرور جديدة</h1>
        <p className="text-sm text-h-text2 text-center mt-1 mb-7">أدخل الرمز المكوّن من 6 أرقام الذي وصلك بالبريد</p>
        <form onSubmit={reset} className="space-y-4" noValidate>
          <Field label="البريد الإلكتروني" type="email" dir="ltr" autoComplete="email" icon={<Mail size={18} />} value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field label="رمز التحقق" inputMode="numeric" autoComplete="one-time-code" dir="ltr" maxLength={6} icon={<KeyRound size={18} />}
            value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="••••••" className="[&_input]:tracking-[.4em] [&_input]:text-center" />
          <Field label="كلمة المرور الجديدة" type="password" dir="ltr" autoComplete="new-password" icon={<Lock size={18} />} value={password} onChange={(e) => setPassword(e.target.value)} />
          <Field label="تأكيد كلمة المرور" type="password" dir="ltr" autoComplete="new-password" icon={<Lock size={18} />} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          {msg}
          <Button type="submit" loading={loading}>تغيير كلمة المرور</Button>
        </form>
        <p className="text-center text-sm text-h-text2 mt-6">
          لم يصلك الرمز؟ <button type="button" onClick={() => { setStep("email"); setError(""); setNotice(""); }} className="text-h-primary font-bold hover:underline">أعد الإرسال</button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-center">نسيت كلمة المرور؟</h1>
      <p className="text-sm text-h-text2 text-center mt-1 mb-7">أدخل بريدك وسنرسل لك رمز التحقق</p>
      <form onSubmit={sendCode} className="space-y-4" noValidate>
        <Field label="البريد الإلكتروني" type="email" dir="ltr" autoComplete="email" inputMode="email" icon={<Mail size={18} />}
          value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
        {msg}
        <Button type="submit" loading={loading} disabled={!email.trim()}>إرسال الرمز</Button>
      </form>
      <p className="text-center text-sm text-h-text2 mt-6">
        وصلك الرمز؟ <button type="button" onClick={() => { setStep("reset"); setError(""); }} className="text-h-primary font-bold hover:underline">أدخله هنا</button>
        {" · "}
        <Link href="/login" className="text-h-primary font-bold hover:underline">تسجيل الدخول</Link>
      </p>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return <Suspense fallback={null}><ForgotPasswordForm /></Suspense>;
}
