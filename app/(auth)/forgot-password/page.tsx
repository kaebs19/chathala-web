"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { authAPI } from "@/lib/api";
import { logError } from "@/lib/logger";

type Step = "email" | "reset" | "done";

type ApiResult = { success: boolean; message?: string };

// بريد الرمز يحمل زراً إلى /forgot-password?email=…&code=… فتُفتح الخطوة
// الثانية مباشرة والرمز مُعبّأ. على الآيفون نفس الرابط Universal Link
// يفتح التطبيق بدل الصفحة.
function ForgotPasswordForm() {
  const params = useSearchParams();
  const prefillEmail = params.get("email") ?? "";
  const prefillCode = params.get("code") ?? "";

  const [step, setStep] = useState<Step>(prefillCode ? "reset" : "email");
  const [email, setEmail] = useState(prefillEmail);
  const [code, setCode] = useState(prefillCode);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (prefillCode) setStep("reset");
  }, [prefillCode]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setNotice("");

    try {
      const res = (await authAPI.forgotPassword(email.trim())) as ApiResult;
      if (res.success) {
        setStep("reset");
        setNotice("أرسلنا رمز التحقق إلى بريدك. أدخله مع كلمة المرور الجديدة.");
      } else {
        setError(res.message || "حدث خطأ، تأكد من البريد الإلكتروني");
      }
    } catch (err) {
      logError("auth:forgot", err);
      setError("حدث خطأ في الاتصال");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!email.trim()) {
      setError("البريد الإلكتروني مطلوب");
      return;
    }
    if (!/^\d{6}$/.test(code.trim())) {
      setError("رمز التحقق مكوّن من 6 أرقام");
      return;
    }
    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    setIsLoading(true);
    try {
      const res = (await authAPI.resetPassword(
        email.trim(),
        code.trim(),
        password
      )) as ApiResult;
      if (res.success) {
        setStep("done");
      } else {
        setError(res.message || "رمز التحقق غير صحيح أو منتهي الصلاحية");
      }
    } catch (err) {
      logError("auth:reset", err);
      setError("حدث خطأ في الاتصال");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="bg-bg-card border border-border rounded-3xl p-6 sm:p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 mx-auto flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-success" />
        </div>
        <h1 className="text-2xl font-black mb-2">تم تغيير كلمة المرور</h1>
        <p className="text-text-muted mb-6">
          يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة من التطبيق أو الموقع.
        </p>
        <Link href="/login">
          <Button className="mx-auto">
            <ArrowRight size={18} />
            تسجيل الدخول
          </Button>
        </Link>
      </div>
    );
  }

  if (step === "reset") {
    return (
      <div className="bg-bg-card border border-border rounded-3xl p-6 sm:p-8">
        <h1 className="text-2xl font-black text-center mb-2">
          كلمة مرور جديدة
        </h1>
        <p className="text-text-muted text-center mb-8">
          أدخل رمز التحقق المرسل إلى بريدك ثم كلمة المرور الجديدة
        </p>

        <form onSubmit={handleReset} className="space-y-4">
          <Input
            label="البريد الإلكتروني"
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            icon={<Mail size={18} />}
            required
            dir="ltr"
          />

          <Input
            label="رمز التحقق"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            maxLength={6}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, ""));
              setError("");
            }}
            icon={<KeyRound size={18} />}
            required
            dir="ltr"
          />

          <div className="relative">
            <Input
              label="كلمة المرور الجديدة"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="6 أحرف على الأقل"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              icon={<Lock size={18} />}
              required
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute left-3 top-[38px] text-text-muted hover:text-text-primary"
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Input
            label="تأكيد كلمة المرور"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="أعد كتابة كلمة المرور"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setError("");
            }}
            icon={<Lock size={18} />}
            required
            dir="ltr"
          />

          {notice && (
            <div className="bg-success/10 border border-success/30 rounded-xl px-4 py-3 text-sm text-success">
              {notice}
            </div>
          )}

          {error && (
            <div className="bg-error/10 border border-error/30 rounded-xl px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            تغيير كلمة المرور
          </Button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          لم يصلك الرمز؟{" "}
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError("");
              setNotice("");
            }}
            className="text-accent-pink font-bold hover:underline"
          >
            أعد الإرسال
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border rounded-3xl p-6 sm:p-8">
      <h1 className="text-2xl font-black text-center mb-2">
        نسيت كلمة المرور؟
      </h1>
      <p className="text-text-muted text-center mb-8">
        أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق
      </p>

      <form onSubmit={handleSendCode} className="space-y-4">
        <Input
          label="البريد الإلكتروني"
          type="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          icon={<Mail size={18} />}
          required
          dir="ltr"
        />

        {error && (
          <div className="bg-error/10 border border-error/30 rounded-xl px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" isLoading={isLoading}>
          إرسال رمز التحقق
        </Button>
      </form>

      <p className="text-center text-sm text-text-muted mt-6">
        وصلك الرمز؟{" "}
        <button
          type="button"
          onClick={() => {
            setStep("reset");
            setError("");
          }}
          className="text-accent-pink font-bold hover:underline"
        >
          أدخله هنا
        </button>
        {" · "}
        <Link href="/login" className="text-accent-pink font-bold hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </div>
  );
}

export default function ForgotPasswordPage() {
  // useSearchParams يحتاج حدود Suspense في App Router وإلا فشل البناء الثابت
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
