"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Shield, Clock, MapPin, Crown } from "lucide-react";

const privacyItems = [
  { icon: Eye, label: "إظهار الملف الشخصي", description: "السماح للآخرين برؤية ملفك" },
  { icon: Clock, label: "آخر ظهور", description: "إظهار وقت آخر تواجد لك" },
  { icon: EyeOff, label: "القراءة الخفية", description: "اقرأ الرسائل دون علم المرسل", premium: true },
  { icon: Shield, label: "وضع التخفي", description: "تصفح دون أن يعرف أحد", premium: true },
  { icon: MapPin, label: "إظهار المسافة", description: "عرض بُعدك عن الآخرين" },
];

export default function PrivacySettingsPage() {
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
        <h1 className="text-xl font-black">الخصوصية والأمان</h1>
      </div>

      <div className="bg-bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border/50">
        {privacyItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} className="text-text-muted" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.premium && (
                    <Crown size={12} className="text-warning" />
                  )}
                </div>
                <p className="text-xs text-text-muted">{item.description}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-bg-input rounded-full peer peer-checked:bg-accent-pink transition-colors after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-[-20px]" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
