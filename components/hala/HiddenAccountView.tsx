"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Calendar, Fingerprint, Inbox, Mail, MailX, Search, UserX } from "lucide-react";
import Avatar from "@/components/hala/Avatar";
import Button from "@/components/hala/Button";
import { authAPI } from "@/lib/api";
import { useAuthStore, type HiddenAccount } from "@/stores/authStore";

const POINTS: [React.ElementType, string][] = [
  [UserX, "لا أحد يستطيع مشاهدة ملفك — يظهر للآخرين «مستخدم غير متاح»"],
  [Search, "لا تظهر في الاكتشاف أو البحث أو القصص"],
  [MailX, "لا أحد يستطيع إرسال طلبات محادثة أو صداقة أو رسائل لك"],
  [Bell, "لا تصلك إشعارات"],
  [Inbox, "محادثاتك وتطابقاتك وصورك محفوظة وتعود عند إعادة التنشيط"],
];

/** شاشة «حسابك مخفي» بعد دخول حساب مخفي (iOS HiddenAccountView) — الرمز في الذاكرة وحدها */
export default function HiddenAccountView({ data }: { data: HiddenAccount }) {
  const router = useRouter();
  const { acceptSession, clearHidden } = useAuthStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const u = data.user;

  const reactivate = async () => {
    setBusy(true); setError(null);
    const r = await authAPI.reactivate(data.reactivationToken);
    setBusy(false);
    if (r.code === "REACTIVATION_EXPIRED" || r.status === 401) {
      setExpired(true);
      setError("انتهت صلاحية الطلب، سجّل الدخول من جديد");
      return;
    }
    const p = acceptSession(r);
    if (!p) { setError(r.message || "تعذّرت إعادة التنشيط"); return; }
    clearHidden();
    router.replace("/explore");
  };

  const signOut = () => { clearHidden(); router.replace("/login"); };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-center">حسابك مخفي بشكل كامل</h1>
      <p className="text-sm text-h-text2 text-center mt-1 mb-6">أخفيت حسابك، فلا يراه أحد الآن. أعد تنشيطه ليعود كما كان.</p>

      <div className="rounded-2xl border border-h-border bg-h-bg p-4">
        <div className="flex items-center gap-3">
          <Avatar src={u.profileImage} name={u.name} size="lg" className="grayscale opacity-70" />
          <div className="min-w-0">
            <p className="font-extrabold truncate">{u.name || "حسابك"}</p>
            <span className="inline-block mt-1 text-xs font-bold text-h-text2 bg-h-chip rounded-full px-2.5 py-0.5">مخفي</span>
          </div>
        </div>
        <dl className="mt-4 space-y-2.5 text-sm">
          {u.email && <Detail icon={Mail} title="البريد" value={u.email} ltr />}
          {(u.halaId || u.id) && <Detail icon={Fingerprint} title="Hala ID" value={u.halaId || u.id || ""} ltr />}
          {data.hiddenAt && <Detail icon={Calendar} title="مخفي منذ" value={new Date(data.hiddenAt).toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" })} />}
        </dl>
      </div>

      <ul className="mt-5 space-y-3">
        {POINTS.map(([I, t]) => (
          <li key={t} className="flex gap-3 text-sm leading-6"><I size={18} className="text-h-text2 shrink-0 mt-0.5" />{t}</li>
        ))}
      </ul>

      {error && <p role="alert" className="mt-5 text-sm font-semibold text-h-error bg-h-error/10 rounded-xl px-4 py-3">{error}</p>}

      <div className="mt-6 space-y-3">
        {expired
          ? <Button onClick={signOut}>سجّل الدخول من جديد</Button>
          : <Button onClick={reactivate} loading={busy}>إعادة تنشيط الحساب</Button>}
        {!expired && <Button variant="secondary" onClick={signOut} disabled={busy}>تسجيل الخروج</Button>}
      </div>
      <p className="mt-5 text-xs text-h-text2 text-center leading-6">تريد حذف حسابك نهائياً؟ أعد تنشيطه ثم اختر «حذف الحساب» من الإعدادات.</p>
    </div>
  );
}

function Detail({ icon: I, title, value, ltr }: { icon: React.ElementType; title: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <I size={16} className="text-h-text2 shrink-0" />
      <dt className="text-h-text2 shrink-0">{title}</dt>
      <dd className="ms-auto font-semibold truncate" dir={ltr ? "ltr" : undefined}>{value}</dd>
    </div>
  );
}
