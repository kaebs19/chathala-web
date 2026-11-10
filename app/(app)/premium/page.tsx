"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Crown, Eye, EyeOff, Heart, Images, Smartphone, Sparkles, Star, Ban } from "lucide-react";
import Button from "@/components/hala/Button";
import { TopBar } from "@/components/hala/Common";
import { toast } from "@/components/hala/Toast";
import { premiumAPI } from "@/lib/api";
import { APP_STORE_URL } from "@/lib/links";
import { COMPARISON, PLANS, getPaymentProvider, type PlanId } from "@/lib/payments";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: Heart, title: "من أعجب بك", text: "اعرف من سجّل إعجابه بملفك وردّ عليه مباشرة" },
  { icon: Eye, title: "زوّار ملفك", text: "كل من زار ملفك، بالاسم والصورة" },
  { icon: EyeOff, title: "القراءة الخفية ووضع التخفّي", text: "اقرأ وتصفّح دون أن تُكشف" },
  { icon: Star, title: "سوبر لايك يومياً", text: "إعجاب مميّز يصل كطلب ويلفت الانتباه" },
  { icon: Images, title: "معرض صور", text: "حتى 6 صور إضافية في ملفك" },
  { icon: Ban, title: "بلا إعلانات", text: "تجربة أنظف في التطبيق" },
];

export default function PremiumPage() {
  const { user, loadUser } = useAuthStore();
  const provider = getPaymentProvider();
  const plans = PLANS.filter((p) => p.priceSAR !== null);
  const [sel, setSel] = useState<PlanId>(plans.find((p) => p.badge === "الأكثر اختياراً")?.id || plans[0]?.id);
  const [status, setStatus] = useState<{ isPremium: boolean; plan: string | null; expiresAt: string | null } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // المشترك من التطبيق: الحالة من الخادم (الحقول نفسها لكل المنصّات)
    premiumAPI.status().then((r) => r.success && r.data && setStatus(r.data as typeof status));
  }, []);

  const isPremium = status?.isPremium ?? !!user?.isPremium;

  const checkout = async () => {
    const plan = PLANS.find((p) => p.id === sel);
    if (!plan) return;
    setBusy(true);
    const r = await provider.startCheckout(plan);
    setBusy(false);
    if (r.status === "redirect") location.href = r.url;
    else if (r.status === "unavailable") toast.info(r.message);
    else toast.error(r.message);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <TopBar title="هلا+" back />
      <div className="px-4 pb-10">
        <div className="text-center pt-6 pb-8">
          <span className="inline-flex w-20 h-20 rounded-[26px] bg-gradient-to-br from-[#FFD600] to-[#FF8C00] items-center justify-center text-[#3A2400] shadow-[0_10px_30px_-8px_#FF8C00]"><Crown size={40} /></span>
          <h2 className="text-[28px] font-black mt-4">هلا<span className="text-h-gold">+</span></h2>
          <p className="text-h-text2 mt-1">اعرف من أعجب بك، وتواصل بلا حدود</p>
        </div>

        {isPremium && (
          <div className="rounded-2xl p-4 mb-6 bg-h-success/10 border border-h-success/30 flex items-start gap-3">
            <Sparkles className="text-h-success shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold">اشتراكك فعّال{status?.plan ? ` (${PLANS.find((p) => p.id === status.plan)?.name || status.plan})` : ""}</p>
              <p className="text-sm text-h-text2 mt-0.5">
                {status?.expiresAt ? `حتى ${new Date(status.expiresAt).toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" })}. ` : ""}
                مزاياك تعمل هنا وفي التطبيق. الإدارة والإلغاء من متجر التطبيقات الذي اشتركت منه.
              </p>
              <button onClick={async () => { await premiumAPI.verifyExpiration(); await loadUser(); toast.success("حُدّثت الحالة"); }} className="text-sm font-bold text-h-primary mt-2">تحديث الحالة</button>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          {FEATURES.map(({ icon: I, title, text }) => (
            <div key={title} className="flex gap-3 p-4 rounded-2xl bg-h-card border border-h-border">
              <span className="w-10 h-10 rounded-xl bg-h-gold/15 text-h-warning flex items-center justify-center shrink-0"><I size={20} /></span>
              <div><p className="font-extrabold text-[15px]">{title}</p><p className="text-xs text-h-text2 mt-0.5 leading-5">{text}</p></div>
            </div>
          ))}
        </div>

        {!isPremium && (
          <>
            <h3 className="font-extrabold mb-3">اختر خطتك</h3>
            <div className="space-y-3 mb-5" role="radiogroup" aria-label="الخطط">
              {plans.map((p) => (
                <button key={p.id} role="radio" aria-checked={sel === p.id} onClick={() => setSel(p.id)}
                  className={cn("w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-start transition",
                    sel === p.id ? "border-h-gold bg-h-gold/8" : "border-h-border bg-h-card")}>
                  <span className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0", sel === p.id ? "border-h-gold bg-h-gold text-white" : "border-h-border")}>
                    {sel === p.id && <Check size={14} strokeWidth={3} />}
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center gap-2 font-extrabold">{p.name}
                      {p.badge && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-l from-[#FFD600] to-[#FF8C00] text-[#3A2400]">{p.badge}</span>}
                    </span>
                    <span className="text-xs text-h-text2">{p.superLikesPerDay} سوبر لايك يومياً</span>
                  </span>
                  <span className="text-end">
                    <span className="block font-black text-lg">{p.priceSAR} <span className="text-xs font-bold">ر.س</span></span>
                    <span className="block text-xs text-h-text2">/ {p.periodLabel}</span>
                  </span>
                </button>
              ))}
            </div>
            <Button variant="gold" onClick={checkout} loading={busy}><Crown size={20} /> {provider.available ? "اشترك الآن" : "الاشتراك من الموقع قريباً"}</Button>
            {!provider.available && (
              <a href={APP_STORE_URL} target="_blank" rel="noopener" className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-h-primary">
                <Smartphone size={17} /> اشترك الآن من تطبيق هلا — مزاياك تظهر هنا تلقائياً
              </a>
            )}
          </>
        )}

        {/* جدول المقارنة */}
        <h3 className="font-extrabold mt-9 mb-3">المقارنة</h3>
        <div className="rounded-2xl border border-h-border overflow-x-auto bg-h-card">
          <table className="w-full text-sm min-w-[440px]">
            <thead>
              <tr className="text-h-text2 text-xs">
                <th className="text-start font-bold p-3">الميزة</th><th className="p-3 font-bold">مجاني</th>
                <th className="p-3 font-bold">أسبوعي</th><th className="p-3 font-bold">شهري</th><th className="p-3 font-bold">ربع سنوي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-h-divider">
              {COMPARISON.map((r) => (
                <tr key={r.name}>
                  <td className="p-3 font-semibold">{r.name}</td>
                  {[r.free, r.weekly, r.monthly, r.quarterly].map((v, i) => (
                    <td key={i} className={cn("p-3 text-center font-bold", v === "✓" || v === "∞" ? "text-h-success" : v === "—" ? "text-h-text2" : "")}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-h-text2 text-center mt-6 leading-6">
          بالاشتراك توافق على <Link href="/terms" className="underline">الشروط</Link> و<Link href="/privacy" className="underline">سياسة الخصوصية</Link>.
        </p>
      </div>
    </div>
  );
}
