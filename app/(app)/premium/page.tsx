"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Crown,
  Eye,
  EyeOff,
  Star,
  Palette,
  ShieldCheck,
  Heart,
  CheckCircle2,
} from "lucide-react";
import Button from "@/components/ui/Button";

const features = [
  { icon: Eye, label: "شاهد من أعجب بك", description: "اكتشف من سجّل إعجابه بملفك" },
  { icon: EyeOff, label: "القراءة الخفية", description: "اقرأ الرسائل بدون علم المرسل" },
  { icon: Star, label: "Super Like يومي", description: "أرسل إعجاب مميز يلفت الانتباه" },
  { icon: ShieldCheck, label: "وضع التخفي", description: "تصفح الملفات بشكل مخفي تماماً" },
  { icon: Palette, label: "لون مخصص للاسم", description: "ميّز اسمك بلون فريد" },
  { icon: Heart, label: "شارة Premium", description: "شارة مميزة تظهر على ملفك" },
];

const plans = [
  { name: "شهري", price: "29.99", period: "شهر", popular: false },
  { name: "3 أشهر", price: "59.99", period: "3 أشهر", popular: true, save: "33%" },
  { name: "سنوي", price: "149.99", period: "سنة", popular: false, save: "58%" },
];

export default function PremiumPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-text-muted hover:text-text-primary"
        >
          <ArrowRight size={22} />
        </button>
        <h1 className="text-xl font-black">Premium</h1>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-3xl bg-warning/10 mx-auto flex items-center justify-center mb-4">
          <Crown size={40} className="text-warning" />
        </div>
        <h2 className="text-2xl font-black mb-2">
          ChatHala <span className="text-warning">Premium</span>
        </h2>
        <p className="text-text-muted">
          افتح كل الميزات واستمتع بتجربة بلا حدود
        </p>
      </div>

      {/* Features */}
      <div className="space-y-3 mb-8">
        {features.map((f) => (
          <div
            key={f.label}
            className="flex items-center gap-3 p-3 bg-bg-card border border-border rounded-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
              <f.icon size={20} className="text-warning" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{f.label}</h3>
              <p className="text-xs text-text-muted">{f.description}</p>
            </div>
            <CheckCircle2 size={18} className="text-warning mr-auto" />
          </div>
        ))}
      </div>

      {/* Plans */}
      <div className="space-y-3 mb-8">
        {plans.map((plan) => (
          <button
            key={plan.name}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
              plan.popular
                ? "border-warning bg-warning/5"
                : "border-border hover:border-warning/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{plan.name}</span>
                  {plan.popular && (
                    <span className="text-xs bg-warning text-bg-primary px-2 py-0.5 rounded-full font-bold">
                      الأكثر شعبية
                    </span>
                  )}
                </div>
                {plan.save && (
                  <p className="text-xs text-success mt-0.5">
                    وفّر {plan.save}
                  </p>
                )}
              </div>
            </div>
            <div className="text-left">
              <span className="text-lg font-black">{plan.price}</span>
              <span className="text-xs text-text-muted"> ر.س/{plan.period}</span>
            </div>
          </button>
        ))}
      </div>

      <Button className="w-full" size="lg">
        <Crown size={20} />
        اشترك الآن
      </Button>

      <p className="text-center text-xs text-text-muted mt-4">
        يتجدد تلقائياً. يمكنك الإلغاء في أي وقت.
      </p>
    </div>
  );
}
