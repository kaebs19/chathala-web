"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/hala/Button";
import Field from "@/components/hala/Field";
import { Section, Spinner, TopBar } from "@/components/hala/Common";
import { toast } from "@/components/hala/Toast";
import { useInterests } from "@/lib/interests";
import { COUNTRIES, ARAB_FIRST, countryName } from "@/lib/countries";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

const MAX_INTERESTS = 10;

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loadUser } = useAuthStore();
  const all = useInterests();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    setName(user.name || ""); setBio(user.bio || ""); setCountry(user.country || ""); setPicked(user.interests || []);
  }, [user]);

  if (!user) return <div className="py-20 flex justify-center"><Spinner /></div>;

  const save = async () => {
    const e: Record<string, string> = {};
    const n = name.trim();
    if (n.length < 2 || n.length > 50) e.name = "الاسم بين 2 و50 حرفاً";
    else if (!/^[؀-ۿa-zA-Z\s]+$/.test(n)) e.name = "الاسم أحرف فقط";
    setErr(e);
    if (Object.keys(e).length) return;
    const body: Record<string, unknown> = {};
    if (n !== user.name) body.name = n;
    if (bio.trim() !== (user.bio || "")) body.bio = bio.trim();
    if (country && country !== user.country) body.country = country;
    if (JSON.stringify(picked) !== JSON.stringify(user.interests || [])) body.interests = picked;
    if (!Object.keys(body).length) return router.push("/profile");
    setSaving(true);
    const r = await authAPI.updateProfile(body);
    setSaving(false);
    if (r.success) {
      await loadUser();
      const notice = (r as unknown as { bioRedactedNotice?: string; data?: { bioRedactedNotice?: string } });
      toast.success("حُفظت التعديلات");
      if (notice.data?.bioRedactedNotice || notice.bioRedactedNotice) toast.info(String(notice.data?.bioRedactedNotice || notice.bioRedactedNotice));
      router.push("/profile");
    } else {
      if (r.code === "NAME_COOLDOWN" || r.code === "BANNED_NAME" || r.code === "NAME_BLOCKED" || r.code === "NAME_EXTERNAL_PROMO") setErr({ name: r.message || "" });
      else if (String(r.code || "").includes("BIO")) setErr({ bio: r.message || "" });
      else toast.error(r.message || "تعذّر الحفظ");
    }
  };

  return (
    <div className="max-w-2xl mx-auto min-h-dvh">
      <TopBar title="تعديل الملف" back="/profile" />
      <div className="px-4 py-5 space-y-5">
        <Field label="الاسم" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} error={err.name} hint="يمكن تغيير الاسم عدداً محدوداً من المرات" />
        <Field label="نبذة عنك" textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} error={err.bio}
          hint={`${bio.length}/500 — لا تضع حسابات تواصل أو أرقاماً`} />
        <div>
          <label className="block text-sm font-bold mb-1.5" htmlFor="country">الدولة</label>
          <select id="country" value={country} onChange={(e) => setCountry(e.target.value)}
            className="w-full h-[52px] px-4 rounded-xl bg-h-input border-[1.5px] border-transparent focus:border-h-primary outline-none">
            <option value="">—</option>
            {/* الخادم يخزّن الرمز (SA) — بيانات قديمة قد تحمل الاسم فتبقى خياراً كما هي */}
            {user.country && !COUNTRIES.some((c) => c.code === user.country) && <option value={user.country}>{countryName(user.country)}</option>}
            {[...COUNTRIES].sort((a, b) => (ARAB_FIRST.indexOf(a.code) + 1 || 99) - (ARAB_FIRST.indexOf(b.code) + 1 || 99)).map((c) => <option key={c.code} value={c.code}>{c.flag} {c.ar}</option>)}
          </select>
        </div>
        <Section title={`الاهتمامات (${picked.length}/${MAX_INTERESTS})`}>
          <div className="p-4 flex flex-wrap gap-2">
            {all.length === 0 && <Spinner size={20} />}
            {all.map((i) => {
              const on = picked.includes(i.key);
              return (
                <button key={i.key} aria-pressed={on}
                  onClick={() => setPicked((p) => on ? p.filter((x) => x !== i.key) : p.length >= MAX_INTERESTS ? p : [...p, i.key])}
                  className={cn("h-9 px-3 rounded-full text-sm font-semibold border-[1.5px] transition",
                    on ? "border-h-primary bg-h-primary/10 text-h-primary" : "border-transparent bg-h-chip")}>
                  {i.emoji} {i.nameAr}
                </button>
              );
            })}
          </div>
        </Section>
        <div className="sticky bottom-0 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-h-bg via-h-bg to-transparent">
          <Button onClick={save} loading={saving}>حفظ</Button>
        </div>
      </div>
    </div>
  );
}
