"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Bell, MessageCircle, Heart, Eye, UserPlus } from "lucide-react";
import { toast } from "@/components/ui/Toast";

const notificationSettings = [
  { key: "messages", icon: MessageCircle, label: "رسائل جديدة", description: "إشعار عند استلام رسالة" },
  { key: "matches", icon: Heart, label: "مطابقات", description: "إشعار عند حدوث تطابق" },
  { key: "likes", icon: Heart, label: "إعجابات", description: "إشعار عند إعجاب شخص بك" },
  { key: "views", icon: Eye, label: "زيارات الملف", description: "إشعار عند زيارة ملفك الشخصي" },
  { key: "requests", icon: UserPlus, label: "طلبات محادثة", description: "إشعار عند استلام طلب محادثة" },
  { key: "sound", icon: Bell, label: "الأصوات", description: "تفعيل أصوات الإشعارات" },
];

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, boolean>>({
    messages: true, matches: true, likes: true, views: true, requests: true, sound: true,
  });

  const toggle = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    toast(!settings[key] ? "تم التفعيل" : "تم الإيقاف", "success");
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-text-muted hover:text-text-primary">
          <ArrowRight size={22} />
        </button>
        <h1 className="text-xl font-black">إعدادات الإشعارات</h1>
      </div>

      <div className="bg-bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border/50">
        {notificationSettings.map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <item.icon size={20} className="text-text-muted" />
              <div>
                <span className="text-sm font-medium">{item.label}</span>
                <p className="text-xs text-text-muted">{item.description}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings[item.key]}
                onChange={() => toggle(item.key)}
              />
              <div className="w-11 h-6 bg-bg-input rounded-full peer peer-checked:bg-accent-pink transition-colors after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-[-20px]" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
