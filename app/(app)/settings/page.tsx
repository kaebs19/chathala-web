"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Ban, Clock, Crown, Eye, EyeOff, FileText, HelpCircle, KeyRound, Lock, LogOut, Mail, MapPin, Moon,
  PauseCircle, Shield, Smartphone, Sun, SunMoon, UserCheck, Users, Cake, Globe2,
} from "lucide-react";
import Avatar from "@/components/hala/Avatar";
import Button from "@/components/hala/Button";
import Field from "@/components/hala/Field";
import Sheet, { Confirm } from "@/components/hala/Sheet";
import Switch from "@/components/hala/Switch";
import { Row, Section, Spinner, TopBar } from "@/components/hala/Common";
import { toast } from "@/components/hala/Toast";
import { api, authAPI, privacyAPI } from "@/lib/api";
import { disconnectSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useStoryStore } from "@/stores/storyStore";
import { useTheme, type ThemePref } from "@/stores/themeStore";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

type Privacy = {
  showLastSeen: boolean; showAge: boolean; showCountry: boolean; showDistance: boolean;
  acceptingRequests: boolean; premiumOnlyRequests: boolean; stealthMode: boolean;
  discoveryPaused: { enabled: boolean; until: string | null };
};

// مفتاح كل إعداد ↔ مساره في /v2/mobile/privacy/* (showLastSeen وحده بالمسار القديم)
const PATCH: Record<string, [string, string]> = {
  showAge: ["show-age", "showAge"],
  showCountry: ["show-country", "showCountry"],
  showDistance: ["distance", "showDistance"],
  acceptingRequests: ["accepting-requests", "acceptingRequests"],
  premiumOnlyRequests: ["premium-only-requests", "premiumOnlyRequests"],
  stealthMode: ["stealth", "stealthMode"],
};

function PremiumLock() {
  return <Link href="/premium" className="text-xs font-bold text-h-warning flex items-center gap-1"><Crown size={14} /> هلا+</Link>;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, loadUser, logout } = useAuthStore();
  const { pref, set: setTheme } = useTheme();
  const [p, setP] = useState<Privacy | null>(null);
  const [invisible, setInvisible] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [sheet, setSheet] = useState<null | "password" | "blocked">(null);
  const [askLogout, setAskLogout] = useState(false);
  const premium = !!user?.isPremium;

  const load = useCallback(async () => {
    const r = await privacyAPI.settings();
    if (r.success && r.data) setP(r.data as Privacy);
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setInvisible(!!user?.privacySettings?.invisibleRead); }, [user]);

  const toggle = async (key: keyof Privacy, v: boolean) => {
    if (!p) return;
    const prev = p;
    setP({ ...p, [key]: v });
    setSaving(key);
    let r;
    if (key === "showLastSeen") r = await api("/privacy/last-seen", { method: "PUT", body: { show: v } });
    else { const [path, field] = PATCH[key]; r = await privacyAPI.patch(path, { [field]: v }); }
    setSaving(null);
    if (!r.success) { setP(prev); toast.error(r.message || "تعذّر الحفظ"); }
  };

  const toggleInvisible = async (v: boolean) => {
    setInvisible(v);
    const r = await api("/privacy/invisible-read", { method: "PUT", body: { enabled: v } });
    if (!r.success) { setInvisible(!v); toast.error(r.message || "تعذّر الحفظ"); } else loadUser();
  };

  const pause = async (v: boolean) => {
    if (!p) return;
    setSaving("pause");
    const r = await privacyAPI.patch("pause-discovery", v ? { enabled: true, durationHours: 24 * 7 } : { enabled: false });
    setSaving(null);
    if (r.success) { load(); toast.success(v ? "أُخفي ملفك من الاكتشاف أسبوعاً" : "عاد ملفك للاكتشاف"); }
    else toast.error(r.message || "تعذّر");
  };

  const doLogout = () => {
    disconnectSocket();
    useChatStore.getState().reset();
    useStoryStore.getState().reset();
    logout();
    router.replace("/login");
  };

  const sw = (key: keyof Privacy, needPremium = false) =>
    needPremium && !premium ? <PremiumLock /> :
      <Switch checked={!!p?.[key]} onChange={(v) => toggle(key, v)} disabled={!p || saving === key} />;

  return (
    <div className="max-w-2xl mx-auto">
      <TopBar title="الإعدادات" back="/profile" />
      <div className="px-4 py-5">
        {user && (
          <Link href="/profile" className="flex items-center gap-3 bg-h-card border border-h-border rounded-2xl p-4 mb-5">
            <Avatar src={user.profileImage} name={user.name} size="md" premium={premium} />
            <div className="min-w-0 flex-1">
              <p className="font-extrabold truncate">{user.name}</p>
              <p className="text-xs text-h-text2 truncate" dir="ltr">{user.email}</p>
            </div>
          </Link>
        )}

        <Section title="المظهر">
          <div className="p-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label="المظهر">
            {([["light", "فاتح", Sun], ["dark", "داكن", Moon], ["system", "تلقائي", SunMoon]] as [ThemePref, string, React.ElementType][]).map(([v, l, I]) => (
              <button key={v} role="radio" aria-checked={pref === v} onClick={() => setTheme(v)}
                className={cn("h-16 rounded-xl flex flex-col items-center justify-center gap-1 text-sm font-bold border-[1.5px] transition",
                  pref === v ? "border-h-primary bg-h-primary/10 text-h-primary" : "border-transparent bg-h-input text-h-text2")}>
                <I size={20} /> {l}
              </button>
            ))}
          </div>
        </Section>

        <Section title="الخصوصية">
          {!p ? <div className="py-6 flex justify-center"><Spinner size={22} /></div> : (
            <>
              <Row icon={Clock} color="#10B981" title="إظهار آخر ظهور" subtitle="إن أخفيته لن ترى آخر ظهور الآخرين أيضاً" end={sw("showLastSeen")} />
              <Row icon={Cake} color="#F59E0B" title="إظهار عمري" end={sw("showAge")} />
              <Row icon={Globe2} color="#3B82F6" title="إظهار دولتي" end={sw("showCountry")} />
              <Row icon={MapPin} color="#EF4444" title="إظهار المسافة" end={sw("showDistance")} />
              <Row icon={Users} color="#8B5CF6" title="استقبال طلبات المحادثة" end={sw("acceptingRequests")} />
              <Row icon={UserCheck} color="#E91E8C" title="الطلبات من مشتركي هلا+ فقط" end={sw("premiumOnlyRequests")} />
              <Row icon={EyeOff} color="#6E6E78" title="وضع التخفّي" subtitle="تصفّح الملفات دون أن تظهر في الزوّار" end={sw("stealthMode", true)} />
              <Row icon={Eye} color="#0EA5E9" title="القراءة الخفية" subtitle="اقرأ الرسائل دون إظهار ✓✓ للمرسل"
                end={premium ? <Switch checked={invisible} onChange={toggleInvisible} /> : <PremiumLock />} />
              <Row icon={PauseCircle} color="#F97316" title="إخفاء ملفي من الاكتشاف"
                subtitle={p.discoveryPaused?.enabled && p.discoveryPaused.until ? `حتى ${new Date(p.discoveryPaused.until).toLocaleDateString("ar-SA")}` : "أسبوعاً، ومحادثاتك تعمل كالمعتاد"}
                end={premium || p.discoveryPaused?.enabled ? <Switch checked={!!p.discoveryPaused?.enabled} onChange={pause} disabled={saving === "pause"} /> : <PremiumLock />} />
              <Row icon={Ban} color="#DC2626" title="المحظورون" onClick={() => setSheet("blocked")} />
            </>
          )}
        </Section>

        <Section title="الحساب">
          <Row icon={Crown} color="#F5B301" title="هلا+" subtitle={premium ? "اشتراكك فعّال" : "المزايا والأسعار"} href="/premium" />
          <Row icon={KeyRound} color="#6366F1" title="تغيير كلمة المرور" onClick={() => setSheet("password")} />
          <Row icon={Smartphone} color="#6E6E78" title="الإشعارات" subtitle="المتصفح وتطبيق الجوال" href="/settings/notifications" />
        </Section>

        <Section title="عن هلا">
          <Row icon={Shield} color="#10B981" title="سياسة الخصوصية" href="/privacy" />
          <Row icon={FileText} color="#6E6E78" title="الشروط والأحكام" href="/terms" />
          <Row icon={Lock} color="#8B5CF6" title="معايير سلامة الأطفال" href="/child-safety" />
          <Row icon={HelpCircle} color="#3B82F6" title="المساعدة والدعم" href="/support" />
          <Row icon={Mail} color="#E91E8C" title="اتصل بنا" href="/contact" />
        </Section>

        <Section>
          <Row icon={LogOut} color="#D32F2F" title="تسجيل الخروج" danger onClick={() => setAskLogout(true)} />
        </Section>
      </div>

      <Confirm open={askLogout} onClose={() => setAskLogout(false)} onConfirm={doLogout} danger confirmText="خروج" title="تسجيل الخروج؟" />
      <PasswordSheet open={sheet === "password"} onClose={() => setSheet(null)} />
      <BlockedSheet open={sheet === "blocked"} onClose={() => setSheet(null)} />
    </div>
  );
}

function PasswordSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (next.length < 6 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(next)) return setErr("6 أحرف على الأقل، وفيها حرف كبير وحرف صغير ورقم");
    setErr(null); setBusy(true);
    const r = await authAPI.changePassword(cur, next);
    setBusy(false);
    if (r.success) { toast.success("تغيّرت كلمة المرور"); setCur(""); setNext(""); onClose(); }
    else setErr(r.errors?.[0]?.message || r.message || "تعذّر التغيير");
  };
  return (
    <Sheet open={open} onClose={onClose} title="تغيير كلمة المرور">
      <div className="space-y-4 py-2">
        <Field type="password" label="كلمة المرور الحالية" value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" />
        <Field type="password" label="كلمة المرور الجديدة" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" error={err} />
        <Button onClick={submit} loading={busy} disabled={!cur || !next}>حفظ</Button>
        <p className="text-xs text-h-text2 text-center">دخلت بـ Google أو Apple؟ لا كلمة مرور لحسابك.</p>
      </div>
    </Sheet>
  );
}

function BlockedSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [list, setList] = useState<User[] | null>(null);
  useEffect(() => {
    if (!open) return;
    setList(null);
    privacyAPI.blocked().then((r) => setList(((r.data as { blockedUsers?: User[] } | undefined)?.blockedUsers) || []));
  }, [open]);
  const unblock = async (u: User) => {
    const id = u._id || u.id || "";
    const r = await privacyAPI.unblock(id);
    if (r.success) { setList((l) => (l || []).filter((x) => (x._id || x.id) !== id)); toast.success(`أُلغي حظر ${u.name}`); }
    else toast.error(r.message || "تعذّر");
  };
  return (
    <Sheet open={open} onClose={onClose} title="المحظورون">
      <div className="py-2">
        {!list ? <div className="py-8 flex justify-center"><Spinner /></div> : !list.length ? (
          <p className="py-8 text-center text-sm text-h-text2">لا أحد في قائمة الحظر</p>
        ) : (
          <ul className="divide-y divide-h-divider">
            {list.map((u) => (
              <li key={u._id || u.id} className="flex items-center gap-3 py-3">
                <Avatar src={u.profileImage} name={u.name} size="sm" />
                <span className="flex-1 font-bold truncate">{u.name}</span>
                <button onClick={() => unblock(u)} className="text-sm font-bold text-h-primary">إلغاء الحظر</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Sheet>
  );
}
