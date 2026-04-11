import type { Metadata } from "next";
import Link from "next/link";
import {
  Smartphone,
  Globe,
  Shield,
  Zap,
  Heart,
  CheckCircle2,
} from "lucide-react";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "تحميل التطبيق",
  description: "حمّل تطبيق ChatHala على هاتفك أو استخدم نسخة الويب",
};

const features = [
  "دردشة فورية مع رسائل نصية وصور وصوت",
  "اكتشاف أشخاص قريبين منك",
  "خصوصية متقدمة وتحكم كامل",
  "إشعارات فورية للرسائل والإعجابات",
  "وضع داكن مريح للعين",
  "دعم كامل للغة العربية",
];

export default function DownloadPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-black mb-6">
          حمّل <span className="gradient-text">ChatHala</span>
        </h1>
        <p className="text-lg text-text-muted max-w-xl mx-auto">
          متاح على iOS و Android ونسخة الويب — اختر المنصة المناسبة لك
        </p>
      </div>

      {/* Download Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {/* iOS */}
        <div className="bg-bg-card border border-border rounded-3xl p-8 text-center hover:border-accent-pink/50 transition-all">
          <Smartphone size={48} className="text-accent-pink mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-2">iOS</h2>
          <p className="text-text-muted mb-6">iPhone & iPad</p>
          <a href="#">
            <Button className="w-full">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              App Store
            </Button>
          </a>
          <p className="text-text-muted text-xs mt-3">
            يتطلب iOS 16.0 أو أحدث
          </p>
        </div>

        {/* Android */}
        <div className="bg-bg-card border border-border rounded-3xl p-8 text-center hover:border-success/50 transition-all">
          <Smartphone size={48} className="text-success mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-2">Android</h2>
          <p className="text-text-muted mb-6">هواتف Android</p>
          <a href="#">
            <Button
              className="w-full !bg-success hover:!bg-success/90"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M3 20.5v-17c0-.83.52-1.28 1-1.5l10 10-10 10c-.48-.22-1-.67-1-1.5zm15.54-8.27l-2.6 1.5-2.74-2.73 2.74-2.73 2.6 1.5c.96.55.96 1.91 0 2.46zM5.26 2.16L14.54 11 12 13.54 5.26 2.16zM5.26 21.84L12 14.46l2.54 2.54-9.28 4.84z"/>
              </svg>
              Google Play
            </Button>
          </a>
          <p className="text-text-muted text-xs mt-3">
            يتطلب Android 8.0 أو أحدث
          </p>
        </div>

        {/* Web */}
        <div className="bg-bg-card border border-border rounded-3xl p-8 text-center hover:border-accent-purple/50 transition-all relative overflow-hidden">
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-accent-pink/10 text-accent-pink text-xs font-bold">
            جديد
          </div>
          <Globe size={48} className="text-accent-purple mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-2">الويب</h2>
          <p className="text-text-muted mb-6">من أي متصفح</p>
          <Link href="/register">
            <Button variant="outline" className="w-full !border-accent-purple !text-accent-purple">
              استخدم الآن
            </Button>
          </Link>
          <p className="text-text-muted text-xs mt-3">
            يعمل على Chrome, Safari, Firefox
          </p>
        </div>
      </div>

      {/* Features List */}
      <div className="bg-bg-card border border-border rounded-3xl p-8 sm:p-12">
        <h2 className="text-2xl font-black text-center mb-8">
          ما الذي ستحصل عليه؟
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <CheckCircle2
                size={20}
                className="text-success shrink-0"
              />
              <span className="text-text-muted">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
