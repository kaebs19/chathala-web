"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, Camera, Clock, Eye, Heart, Mail, MessageCircle, Monitor, Reply, Sparkles, Star, UserPlus, Users } from "lucide-react";
import Switch from "@/components/hala/Switch";
import { Row, Section, Spinner, TopBar } from "@/components/hala/Common";
import { toast } from "@/components/hala/Toast";
import { notificationAPI } from "@/lib/api";
import { browserNotifyEnabled, browserNotifySupported, disableBrowserNotify, enableBrowserNotify } from "@/lib/browserNotify";
import { cn } from "@/lib/utils";

type Level = "all" | "digest" | "off";
type Delivery = "sound" | "quiet" | "off";
type Prefs = {
  pushEnabled: boolean; messages: boolean; invitations: boolean; matches: boolean; superLikes: boolean; appAlerts: boolean;
  storyReplies: boolean; storyScreenshots: boolean; friendStories: boolean; storyExpiryReminder: boolean; profileVisits: boolean;
  likes: Level; visits: Level; storyReactions: Level;
  delivery: { stories: Delivery; likes: Delivery; visits: Delivery };
};

// المصدر الواحد للمفاتيح: config/notificationPreferences.js في الخادم (والتطبيق NotificationPreferences)
export default function NotificationSettingsPage() {
  const [p, setP] = useState<Prefs | null>(null);
  const [browser, setBrowser] = useState(false);

  useEffect(() => {
    setBrowser(browserNotifyEnabled());
    notificationAPI.prefs().then((r) => (r.success && r.data ? setP(r.data as Prefs) : toast.error(r.message || "تعذّر جلب الإعدادات")));
  }, []);

  const save = async (patch: Partial<Prefs>) => {
    if (!p) return;
    const prev = p;
    setP({ ...p, ...patch, delivery: { ...p.delivery, ...(patch.delivery || {}) } });
    const r = await notificationAPI.setPrefs(patch);
    if (r.success && r.data) setP(r.data as Prefs);
    else { setP(prev); toast.error(r.message || "تعذّر الحفظ"); }
  };

  const toggleBrowser = async (v: boolean) => {
    if (v) {
      const ok = await enableBrowserNotify();
      setBrowser(ok);
      if (!ok) toast.error("رفض المتصفح الإذن — فعّله من إعدادات الموقع في المتصفح");
    } else { disableBrowserNotify(); setBrowser(false); }
  };

  const sw = (k: keyof Prefs) => <Switch checked={!!p?.[k]} onChange={(v) => save({ [k]: v } as Partial<Prefs>)} disabled={!p?.pushEnabled && k !== "pushEnabled"} label={String(k)} />;
  const off = !p?.pushEnabled;

  return (
    <div className="max-w-2xl mx-auto">
      <TopBar title="الإشعارات" back="/settings" />
      <div className="px-4 py-5">
        <Section title="هذا المتصفح">
          <Row icon={Monitor} color="#3B82F6" title="إشعارات المتصفح"
            subtitle={browserNotifySupported() ? "رسائل وطلبات جديدة والموقع مفتوح في الخلفية" : "متصفحك لا يدعم الإشعارات (مثل Safari على iPhone)"}
            end={browserNotifySupported() ? <Switch checked={browser} onChange={toggleBrowser} label="إشعارات المتصفح" /> : null} />
        </Section>

        {!p ? <div className="py-10 flex justify-center"><Spinner /></div> : (
          <>
            <Section title="إشعارات تطبيق الجوال">
              <Row icon={Bell} color="#E91E8C" title="كل الإشعارات" subtitle="إيقافها يوقف إشعارات هلا على جوالك" end={sw("pushEnabled")} />
            </Section>
            <div className={cn(off && "opacity-50 pointer-events-none")} aria-disabled={off}>
              <Section title="المحادثات">
                <Row icon={MessageCircle} color="#8B5CF6" title="الرسائل" end={sw("messages")} />
                <Row icon={Mail} color="#0EA5E9" title="طلبات المحادثة" end={sw("invitations")} />
              </Section>
              <Section title="الإعجابات">
                <Row icon={Sparkles} color="#E91E8C" title="التطابق" end={sw("matches")} />
                <Row icon={Star} color="#3B82F6" title="سوبر لايك" end={sw("superLikes")} />
                <LevelRow icon={Heart} color="#EF4444" title="الإعجابات" value={p.likes} onChange={(v) => save({ likes: v })} />
                <DeliveryRow value={p.delivery.likes} onChange={(v) => save({ delivery: { ...p.delivery, likes: v } })} />
              </Section>
              <Section title="الزيارات">
                <LevelRow icon={Eye} color="#10B981" title="زوّار ملفك" value={p.visits} onChange={(v) => save({ visits: v })} />
                <DeliveryRow value={p.delivery.visits} onChange={(v) => save({ delivery: { ...p.delivery, visits: v } })} />
              </Section>
              <Section title="القصص">
                <Row icon={Reply} color="#8B5CF6" title="الردود على قصصك" end={sw("storyReplies")} />
                <LevelRow icon={Heart} color="#F59E0B" title="التفاعلات" value={p.storyReactions} onChange={(v) => save({ storyReactions: v })} />
                <Row icon={Camera} color="#6E6E78" title="لقطات الشاشة" end={sw("storyScreenshots")} />
                <Row icon={Users} color="#10B981" title="قصص الأصدقاء" end={sw("friendStories")} />
                <Row icon={Clock} color="#F97316" title="تذكير قبل انتهاء قصتك" end={sw("storyExpiryReminder")} />
                <DeliveryRow value={p.delivery.stories} onChange={(v) => save({ delivery: { ...p.delivery, stories: v } })} />
              </Section>
              <Section title="أخرى">
                <Row icon={BellRing} color="#6366F1" title="تنبيهات هلا" subtitle="تحديثات وإعلانات رسمية" end={sw("appAlerts")} />
                <Row icon={UserPlus} color="#14B8A6" title="الصداقة" subtitle="طلبات وقبول — تتبع «الرسائل»" />
              </Section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="flex bg-h-input rounded-xl p-1 gap-1" role="radiogroup" aria-label={label}>
      {options.map(([v, l]) => (
        <button key={v} role="radio" aria-checked={value === v} onClick={() => onChange(v)}
          className={cn("px-3 h-8 rounded-lg text-xs font-bold transition", value === v ? "bg-h-card text-h-primary shadow-sm" : "text-h-text2")}>{l}</button>
      ))}
    </div>
  );
}

function LevelRow({ icon, color, title, value, onChange }: { icon: React.ElementType; color: string; title: string; value: Level; onChange: (v: Level) => void }) {
  return <Row icon={icon} color={color} title={title} subtitle={value === "digest" ? "ملخّص كل بضع ساعات بدل إشعار لكل حدث" : undefined}
    end={<Segmented label={title} value={value} onChange={onChange} options={[["all", "كل"], ["digest", "ملخّص"], ["off", "إيقاف"]]} />} />;
}

function DeliveryRow({ value, onChange }: { value: Delivery; onChange: (v: Delivery) => void }) {
  return <Row title="طريقة الوصول" end={<Segmented label="طريقة الوصول" value={value} onChange={onChange} options={[["sound", "بصوت"], ["quiet", "بهدوء"], ["off", "إيقاف"]]} />} />;
}
