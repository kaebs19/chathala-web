"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { authAPI } from "@/lib/api";
import { logError } from "@/lib/logger";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = (await authAPI.forgotPassword(email)) as {
        success: boolean;
        message?: string;
      };
      if (res.success) {
        setSent(true);
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

  if (sent) {
    return (
      <div className="bg-bg-card border border-border rounded-3xl p-6 sm:p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 mx-auto flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-success" />
        </div>
        <h1 className="text-2xl font-black mb-2">تم الإرسال!</h1>
        <p className="text-text-muted mb-6">
          تم إرسال رابط إعادة تعيين كلمة المرور إلى
          <br />
          <span className="text-accent-pink font-medium" dir="ltr">
            {email}
          </span>
        </p>
        <p className="text-text-muted text-sm mb-6">
          تحقق من صندوق الوارد (والرسائل غير المرغوبة) وافتح الرابط لإعادة
          تعيين كلمة المرور.
        </p>
        <Link href="/login">
          <Button variant="outline" className="mx-auto">
            <ArrowRight size={18} />
            العودة لتسجيل الدخول
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border rounded-3xl p-6 sm:p-8">
      <h1 className="text-2xl font-black text-center mb-2">
        نسيت كلمة المرور؟
      </h1>
      <p className="text-text-muted text-center mb-8">
        أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          إرسال رابط الاستعادة
        </Button>
      </form>

      <p className="text-center text-sm text-text-muted mt-6">
        تذكرت كلمة المرور؟{" "}
        <Link href="/login" className="text-accent-pink font-bold hover:underline">
          سجّل دخولك
        </Link>
      </p>
    </div>
  );
}
