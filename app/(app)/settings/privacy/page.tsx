"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Shield, Clock, MapPin, Crown, Bell, UserX, Lock } from "lucide-react";
import { privacyAPI } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import type { PrivacySettings } from "@/types";

const settingItems = [
  { key: "profileVisibility" as const, icon: Eye, label: "إظهار الملف الشخصي", description: "السماح للآخرين برؤية ملفك" },
  { key: "showLastSeen" as const, icon: Clock, label: "آخر ظهور", description: "إظهار وقت آخر تواجد لك" },
  { key: "showAge" as const, icon: Eye, label: "إظهار العمر", description: "عرض عمرك في ملفك الشخصي" },
  { key: "showCountry" as const, icon: MapPin, label: "إظهار البلد", description: "عرض بلدك في ملفك الشخصي" },
  { key: "showDistance" as const, icon: MapPin, label: "إظهار المسافة", description: "عرض بُعدك عن الآخرين" },
  { key: "notificationSound" as const, icon: Bell, label: "صوت الإشعارات", description: "تفعيل أصوات الإشعارات" },
  { key: "acceptingRequests" as const, icon: Lock, label: "قبول الطلبات", description: "السماح بتلقي طلبات محادثة" },
  { key: "invisibleRead" as const, icon: EyeOff, label: "القراءة الخفية", description: "اقرأ الرسائل دون علم المرسل", premium: true },
  { key: "stealthMode" as const, icon: Shield, label: "وضع التخفي", description: "تصفح دون أن يعرف أحد", premium: true },
  { key: "premiumOnlyRequests" as const, icon: Crown, label: "Premium فقط", description: "اقبل طلبات من Premium فقط", premium: true },
];

export default function PrivacySettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<PrivacySettings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = (await privacyAPI.getSettings()) as {
          success: boolean;
          data?: { settings?: PrivacySettings } | PrivacySettings;
        };
        if (res.success && res.data) {
          const s = res.data && "settings" in (res.data as object)
            ? (res.data as { settings: PrivacySettings }).settings
            : (res.data as PrivacySettings);
          setSettings(s || {});
        }
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const toggle = async (key: keyof PrivacySettings) => {
    const newValue = !settings[key];
    setSaving(key);
    setSettings((prev) => ({ ...prev, [key]: newValue }));
    try {
      await privacyAPI.updateSettings({ [key]: newValue });
      toast(newValue ? "تم التفعيل" : "تم الإيقاف", "success");
    } catch {
      setSettings((prev) => ({ ...prev, [key]: !newValue }));
      toast("فشل الحفظ", "error");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-text-muted hover:text-text-primary">
          <ArrowRight size={22} />
        </button>
        <h1 className="text-xl font-black">الخصوصية والأمان</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="bg-bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border/50">
          {settingItems.map((item) => {
            const isPremiumLocked = item.premium && !user?.isPremium;
            return (
              <div
                key={item.key}
                className={`flex items-center justify-between p-4 ${isPremiumLocked ? "opacity-60" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className="text-text-muted" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.premium && <Crown size={12} className="text-warning" />}
                    </div>
                    <p className="text-xs text-text-muted">{item.description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings[item.key] ?? true}
                    onChange={() => {
                      if (isPremiumLocked) {
                        toast("هذه الميزة متاحة لمشتركي Premium", "info");
                        return;
                      }
                      toggle(item.key);
                    }}
                    disabled={saving === item.key}
                  />
                  <div className="w-11 h-6 bg-bg-input rounded-full peer peer-checked:bg-accent-pink transition-colors after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-[-20px]" />
                </label>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
