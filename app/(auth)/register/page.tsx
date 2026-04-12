"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Calendar, Eye, EyeOff } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    gender: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    clearError();
    setLocalError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (form.password !== form.confirmPassword) {
      setLocalError("كلمات المرور غير متطابقة");
      return;
    }

    if (form.password.length < 6) {
      setLocalError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (!form.gender) {
      setLocalError("يرجى اختيار الجنس");
      return;
    }

    const birthDate = new Date(form.birthDate);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 18) {
      setLocalError("يجب أن يكون عمرك 18 سنة على الأقل");
      return;
    }

    const success = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      birthDate: form.birthDate,
      gender: form.gender,
    });

    if (success) {
      router.push("/chats");
    }
  };

  const displayError = localError || error;

  return (
    <div className="bg-bg-card border border-border rounded-3xl p-6 sm:p-8">
      <h1 className="text-2xl font-black text-center mb-2">إنشاء حساب جديد</h1>
      <p className="text-text-muted text-center mb-8">
        انضم لآلاف المستخدمين الآن
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="الاسم"
          placeholder="اسمك الكريم"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          icon={<User size={18} />}
          autoComplete="off"
        />

        <Input
          label="البريد الإلكتروني"
          type="email"
          placeholder="example@email.com"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          icon={<Mail size={18} />}
          autoComplete="off"
          dir="ltr"
        />

        <Input
          label="تاريخ الميلاد"
          type="date"
          value={form.birthDate}
          onChange={(e) => update("birthDate", e.target.value)}
          icon={<Calendar size={18} />}
          autoComplete="off"
          dir="ltr"
        />

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            الجنس
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "male", label: "ذكر" },
              { value: "female", label: "أنثى" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => update("gender", option.value)}
                className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                  form.gender === option.value
                    ? "border-accent-pink bg-accent-pink/10 text-accent-pink"
                    : "border-border bg-bg-input text-text-muted hover:border-border-light"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Input
            label="كلمة المرور"
            type={showPassword ? "text" : "password"}
            placeholder="6 أحرف على الأقل"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            icon={<Lock size={18} />}
            autoComplete="off"
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-[38px] text-text-muted hover:text-text-primary"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Input
          label="تأكيد كلمة المرور"
          type={showPassword ? "text" : "password"}
          placeholder="أعد إدخال كلمة المرور"
          value={form.confirmPassword}
          onChange={(e) => update("confirmPassword", e.target.value)}
          icon={<Lock size={18} />}
          autoComplete="off"
          dir="ltr"
        />

        {displayError && (
          <div className="bg-error/10 border border-error/30 rounded-xl px-4 py-3 text-sm text-error">
            {displayError}
          </div>
        )}

        <Button type="submit" className="w-full" isLoading={isLoading}>
          إنشاء الحساب
        </Button>
      </form>

      {/* Terms */}
      <p className="text-center text-xs text-text-muted mt-4">
        بالتسجيل، أنت توافق على{" "}
        <Link href="/terms" className="text-accent-pink hover:underline">
          شروط الاستخدام
        </Link>{" "}
        و{" "}
        <Link href="/privacy" className="text-accent-pink hover:underline">
          سياسة الخصوصية
        </Link>
      </p>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm text-text-muted">أو</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Social */}
      <div className="space-y-3">
        <Button variant="secondary" className="w-full">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          متابعة مع Google
        </Button>

        <Button variant="secondary" className="w-full">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          متابعة مع Apple
        </Button>
      </div>

      {/* Login Link */}
      <p className="text-center text-sm text-text-muted mt-6">
        لديك حساب بالفعل؟{" "}
        <Link href="/login" className="text-accent-pink font-bold hover:underline">
          سجّل دخولك
        </Link>
      </p>
    </div>
  );
}
