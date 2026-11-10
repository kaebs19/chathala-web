"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Camera, Check, Lock, Mail, User as UserIcon } from "lucide-react";
import Button from "@/components/hala/Button";
import Field from "@/components/hala/Field";
import SocialButtons, { OrDivider } from "@/components/hala/SocialButtons";
import { toast } from "@/components/hala/Toast";
import { authAPI, getToken, type ApiResult } from "@/lib/api";
import { compressImage } from "@/lib/image";
import { authErrorMessage, useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { ARAB_FIRST, COUNTRIES } from "@/lib/countries";

type Step = "name" | "email" | "password" | "birthDate" | "country" | "photoGender" | "terms";
const FULL: Step[] = ["name", "email", "password", "birthDate", "country", "photoGender", "terms"];
const PROFILE_ONLY: Step[] = ["birthDate", "country", "photoGender"];


// كما في validator الخادم (registerValidation)
const NAME_RE = /^[؀-ۿa-zA-Z\s]+$/;
const PW_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ageFrom(d: string) {
  if (!d) return 0;
  const b = new Date(d), t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
  return a;
}

function RegisterFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const profileOnly = params.get("step") === "profile";
  const steps = profileOnly ? PROFILE_ONLY : FULL;
  const { acceptSession, loadUser, user } = useAuthStore();

  const [i, setI] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [country, setCountry] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [photo, setPhoto] = useState<{ blob: Blob; preview: string } | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [cq, setCq] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // القادم من Google/Apple: املأ ما هو معروف
  useEffect(() => {
    if (!profileOnly) return;
    if (!getToken()) { router.replace("/login"); return; }
    loadUser().then((u) => {
      if (!u) return;
      if (u.birthDate) setBirthDate(u.birthDate.slice(0, 10));
      if (u.country) setCountry(u.country);
      if (u.gender) setGender(u.gender);
    });
  }, [profileOnly, router, loadUser]);

  const step = steps[i];
  const maxDate = useMemo(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().slice(0, 10); }, []);

  const stepError: string | null = (() => {
    switch (step) {
      case "name": {
        const n = name.trim();
        if (!n) return null;
        if (n.length < 2 || n.length > 50) return "الاسم بين 2 و50 حرفاً";
        if (!NAME_RE.test(n)) return "الاسم أحرف فقط (عربية أو إنجليزية)";
        return null;
      }
      case "email": return email && !EMAIL_RE.test(email.trim()) ? "البريد الإلكتروني غير صالح" : null;
      case "password":
        if (!password) return null;
        if (password.length < 6) return "6 أحرف على الأقل";
        if (!PW_RE.test(password)) return "يجب أن تحتوي على حرف كبير وحرف صغير ورقم";
        return null;
      case "birthDate": return birthDate && ageFrom(birthDate) < 18 ? "يجب أن يكون عمرك 18 سنة أو أكثر" : null;
      default: return null;
    }
  })();

  const canNext = (() => {
    if (stepError) return false;
    switch (step) {
      case "name": return name.trim().length >= 2;
      case "email": return EMAIL_RE.test(email.trim());
      case "password": return password.length >= 6 && PW_RE.test(password);
      case "birthDate": return !!birthDate && ageFrom(birthDate) >= 18 && ageFrom(birthDate) < 100;
      case "country": return !!country;
      case "photoGender": return !!gender;
      case "terms": return agreed;
    }
  })();

  const saveProfile = async () => {
    const r = await authAPI.updateProfile({ birthDate, gender, country });
    if (!r.success) throw new Error(r.errors?.[0]?.message || r.message || "تعذّر حفظ البيانات");
    if (photo) {
      const file = new File([photo.blob], "profile.jpg", { type: "image/jpeg" });
      const up = await authAPI.uploadProfileImage(file);
      if (!up.success) toast.error(up.message || "لم تُرفع الصورة — أضفها لاحقاً من ملفك");
    }
    await loadUser();
  };

  const finish = async () => {
    setError(""); setLoading(true);
    try {
      if (!profileOnly) {
        // الحساب يُنشأ بعد الموافقة فقط — لا حسابات نصف مكتملة
        const res = await authAPI.register({ name: name.trim(), email: email.trim().toLowerCase(), password });
        const p = acceptSession(res);
        if (!p) {
          const msg = authErrorMessage(res);
          setError(msg);
          // ارجع للخطوة المعنية
          const field = res.errors?.[0]?.field;
          const back = field === "email" || /البريد/.test(msg) ? "email" : field === "name" || /الاسم/.test(msg) ? "name" : field === "password" ? "password" : null;
          if (back) setI(steps.indexOf(back));
          setLoading(false);
          return;
        }
      }
      await saveProfile();
      router.replace("/explore");
    } catch (e) {
      setError((e as Error).message || "حدث خطأ");
      setLoading(false);
    }
  };

  const next = () => {
    if (!canNext) return;
    setError("");
    if (i === steps.length - 1) finish();
    else setI(i + 1);
  };

  const onSocial = (res: ApiResult) => {
    const p = acceptSession(res);
    if (!p) { setError(authErrorMessage(res)); return; }
    const u = p.user;
    if (p.isNewUser || (u && (!u.birthDate || !u.gender))) {
      router.replace("/register?step=profile");
      setI(0);
    } else router.replace("/explore");
  };

  const pick = async (f?: File | null) => {
    if (!f) return;
    try {
      const { blob, preview } = await compressImage(f, 1200);
      setPhoto({ blob, preview });
    } catch { toast.error("تعذّر قراءة الصورة"); }
  };

  const titles: Record<Step, [string, string]> = {
    name: ["ما اسمك؟", "هكذا سيظهر اسمك للآخرين"],
    email: ["بريدك الإلكتروني", "تحتاجه لتسجيل الدخول واستعادة حسابك"],
    password: ["كلمة المرور", "6 أحرف على الأقل، فيها حرف كبير وصغير ورقم"],
    birthDate: ["تاريخ ميلادك", "هلا للبالغين فقط (18+). يظهر عمرك لا تاريخك"],
    country: ["من أين أنت؟", "تظهر دولتك في ملفك ويمكنك إخفاؤها لاحقاً"],
    photoGender: ["أنت…", "اختر جنسك، وأضف صورة إن أردت"],
    terms: ["آخر خطوة", "راجع الشروط ثم ابدأ"],
  };

  return (
    <div>
      {/* شريط التقدّم + رجوع */}
      <div className="flex items-center gap-3 mb-6">
        {i > 0 ? (
          <button onClick={() => { setError(""); setI(i - 1); }} aria-label="رجوع" className="w-10 h-10 -ms-2 rounded-full flex items-center justify-center hover:bg-h-input"><ArrowRight size={22} /></button>
        ) : <span className="w-8" />}
        <div className="flex-1 flex gap-1.5" dir="rtl" aria-label={`الخطوة ${i + 1} من ${steps.length}`}>
          {steps.map((s, k) => <span key={s} className={cn("h-1.5 flex-1 rounded-full transition", k <= i ? "h-gradient" : "bg-h-chip")} />)}
        </div>
        <span className="text-xs text-h-text2 w-8 text-center">{i + 1}/{steps.length}</span>
      </div>

      <h1 className="text-2xl font-extrabold">{profileOnly && i === 0 ? `أهلاً${user?.name ? ` ${user.name}` : ""}! ` : ""}{titles[step][0]}</h1>
      <p className="text-sm text-h-text2 mt-1 mb-6 leading-6">{titles[step][1]}</p>

      <form onSubmit={(e) => { e.preventDefault(); next(); }} className="space-y-4" noValidate>
        {step === "name" && (
          <Field autoFocus autoComplete="name" icon={<UserIcon size={18} />} placeholder="الاسم" value={name} maxLength={50}
            onChange={(e) => setName(e.target.value)} error={stepError} />
        )}
        {step === "email" && (
          <Field autoFocus type="email" inputMode="email" autoComplete="email" dir="ltr" icon={<Mail size={18} />} placeholder="name@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)} error={stepError} />
        )}
        {step === "password" && (
          <>
            <Field autoFocus type="password" autoComplete="new-password" dir="ltr" icon={<Lock size={18} />} value={password}
              onChange={(e) => setPassword(e.target.value)} error={stepError} />
            <ul className="text-xs space-y-1.5 text-h-text2">
              {[["6 أحرف أو أكثر", password.length >= 6], ["حرف كبير (A-Z)", /[A-Z]/.test(password)], ["حرف صغير (a-z)", /[a-z]/.test(password)], ["رقم", /\d/.test(password)]].map(([l, ok]) => (
                <li key={l as string} className={cn("flex items-center gap-2", ok && "text-h-success font-bold")}>
                  <span className={cn("w-4 h-4 rounded-full flex items-center justify-center", ok ? "bg-h-success text-white" : "bg-h-chip")}>{ok && <Check size={11} strokeWidth={3.5} />}</span>{l as string}
                </li>
              ))}
            </ul>
          </>
        )}
        {step === "birthDate" && (
          <Field type="date" max={maxDate} min="1926-01-01" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} error={stepError}
            hint={birthDate && !stepError ? `عمرك ${ageFrom(birthDate)} سنة` : undefined} />
        )}
        {step === "country" && (
          <div className="space-y-3">
            <Field placeholder="ابحث عن دولتك" value={cq} onChange={(e) => setCq(e.target.value)} />
            <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto h-scroll">
              {[...COUNTRIES]
                .sort((a, b) => (ARAB_FIRST.indexOf(a.code) + 1 || 999) - (ARAB_FIRST.indexOf(b.code) + 1 || 999))
                .filter((c) => !cq.trim() || c.ar.includes(cq.trim()) || c.code.toLowerCase() === cq.trim().toLowerCase())
                .map((c) => (
                  <button type="button" key={c.code} onClick={() => setCountry(c.code)} aria-pressed={country === c.code}
                    className={cn("h-10 px-4 rounded-full text-sm font-bold transition", country === c.code ? "h-gradient text-white" : "bg-h-chip text-h-text")}>
                    {c.flag} {c.ar}
                  </button>
                ))}
            </div>
          </div>
        )}
        {step === "photoGender" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
              <button type="button" onClick={() => fileRef.current?.click()} aria-label="اختيار صورة"
                className="relative w-28 h-28 rounded-full bg-h-chip border-2 border-dashed border-h-border overflow-hidden flex items-center justify-center text-h-text2">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo.preview} alt="صورتك" className="w-full h-full object-cover" />
                ) : <Camera size={30} />}
                <span className="absolute bottom-1 inset-x-0 text-[10px] font-bold">{photo ? "تغيير" : "صورة (اختياري)"}</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([["male", "رجل", "👨"], ["female", "امرأة", "👩"]] as const).map(([v, l, e]) => (
                <button type="button" key={v} onClick={() => setGender(v)} aria-pressed={gender === v}
                  className={cn("h-24 rounded-2xl border-2 font-extrabold flex flex-col items-center justify-center gap-1 transition",
                    gender === v ? "border-h-primary bg-h-primary/10 text-h-primary" : "border-h-border bg-h-card")}>
                  <span className="text-3xl">{e}</span>{l}
                </button>
              ))}
            </div>
          </div>
        )}
        {step === "terms" && (
          <label className="flex items-start gap-3 p-4 rounded-2xl bg-h-input cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 w-5 h-5 accent-[var(--h-primary)]" />
            <span className="text-sm leading-7">
              أوافق على <Link href="/terms" target="_blank" className="text-h-primary font-bold">شروط الاستخدام</Link> و
              <Link href="/privacy" target="_blank" className="text-h-primary font-bold">سياسة الخصوصية</Link>، وأؤكد أن عمري 18 سنة أو أكثر،
              وألتزم بإرشادات المجتمع (لا محتوى مسيء ولا طلب أموال ولا مشاركة حسابات خارجية).
            </span>
          </label>
        )}

        {error && <p role="alert" className="text-sm font-semibold text-h-error bg-h-error/10 rounded-xl px-4 py-3">{error}</p>}
        <Button type="submit" loading={loading} disabled={!canNext}>
          {i === steps.length - 1 ? (profileOnly ? "حفظ والبدء" : "إنشاء الحساب") : "التالي"}
        </Button>
      </form>

      {!profileOnly && i === 0 && (
        <>
          <OrDivider />
          <SocialButtons onResult={onSocial} onError={setError} disabled={loading} />
          <p className="text-center text-sm text-h-text2 mt-7">
            لديك حساب؟ <Link href="/login" className="text-h-primary font-bold hover:underline">سجّل الدخول</Link>
          </p>
        </>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense fallback={null}><RegisterFlow /></Suspense>;
}
