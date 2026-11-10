"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRightLeft, BellOff, CreditCard, EyeOff, MessageSquareOff, ShieldAlert, Trash2 } from "lucide-react";
import Button from "@/components/hala/Button";
import Field from "@/components/hala/Field";
import { Confirm } from "@/components/hala/Sheet";
import { TopBar } from "@/components/hala/Common";
import { toast } from "@/components/hala/Toast";
import { authAPI } from "@/lib/api";
import { disconnectSocket } from "@/lib/socket";
import { useAuthStore, type HiddenAccount } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useStoryStore } from "@/stores/storyStore";
import { cn } from "@/lib/utils";

type Mode = "delete" | "hide";

// المرجع: iOS DeleteAccountView (تبويبا «حذف نهائي» المختار مسبقاً و«إخفاء الحساب»)
export default function AccountPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mode, setMode] = useState<Mode>("delete");
  const [carry, setCarry] = useState<{ willCarry: boolean; items: string[]; message?: string } | null>(null);
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [ask, setAsk] = useState<Mode | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const needsPassword = !user?.authProvider || user.authProvider === "app";

  useEffect(() => {
    authAPI.carryover().then((r) => r.success && r.data && setCarry(r.data as typeof carry));
  }, []);

  const signOutLocal = () => {
    disconnectSocket();
    useChatStore.getState().reset();
    useStoryStore.getState().reset();
    logout();
    router.replace("/login");
  };

  const hide = async () => {
    setBusy(true);
    const r = await authAPI.hideAccount();
    setBusy(false); setAsk(null);
    if (!r.success) { toast.error(r.message || "تعذّر إخفاء الحساب"); return; }
    // الردّ يحمل بيانات ACCOUNT_HIDDEN نفسها ← شاشة «حسابك مخفي» مباشرة (لا خروج لصفحة الدخول)
    const d = r.data as HiddenAccount | undefined;
    disconnectSocket();
    useChatStore.getState().reset();
    useStoryStore.getState().reset();
    logout();
    if (d?.reactivationToken) useAuthStore.setState({ hidden: { reactivationToken: d.reactivationToken, hiddenAt: d.hiddenAt, user: d.user || {} } });
    else toast.success(r.message || "أُخفي حسابك");
    router.replace("/login");
  };

  const del = async () => {
    setBusy(true); setErr(null);
    const r = await authAPI.deleteAccount(needsPassword ? password : undefined);
    setBusy(false); setAsk(null);
    if (r.success) { toast.success("حُذف حسابك"); signOutLocal(); }
    else if (r.code === "WRONG_PASSWORD" || r.status === 400) setErr(r.message || "كلمة المرور غير صحيحة");
    else toast.error(r.message || "فشل حذف الحساب");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <TopBar title="حذف الحساب أو إخفاؤه" back="/settings" />
      <div className="px-4 py-5 space-y-5">
        <div className="flex bg-h-input rounded-xl p-1 gap-1" role="tablist" aria-label="الإجراء">
          {([["delete", "حذف نهائي"], ["hide", "إخفاء الحساب"]] as [Mode, string][]).map(([v, l]) => (
            <button key={v} role="tab" aria-selected={mode === v} onClick={() => setMode(v)}
              className={cn("flex-1 h-10 rounded-lg text-sm font-bold transition", mode === v ? "bg-h-card shadow-sm text-h-text" : "text-h-text2")}>{l}</button>
          ))}
        </div>

        {carry?.willCarry && (
          <div className="rounded-2xl p-4 bg-h-warning/10 border border-h-warning/30">
            <p className="font-extrabold flex items-center gap-2"><ShieldAlert size={19} className="text-h-warning" /> التقييدات مرتبطة بجهازك</p>
            {carry.message && <p className="text-sm text-h-text2 mt-1.5 leading-7">{carry.message}</p>}
            {!!carry.items?.length && <ul className="mt-2 text-sm list-disc ps-5 space-y-1">{carry.items.map((i) => <li key={i}>{i}</li>)}</ul>}
          </div>
        )}

        {mode === "hide" ? (
          <>
            <div className="text-center pt-2">
              <span className="inline-flex w-16 h-16 rounded-full bg-h-primary/10 text-h-primary items-center justify-center"><EyeOff size={30} /></span>
              <h2 className="text-xl font-extrabold mt-3">إخفاء الحساب بالكامل</h2>
              <p className="text-sm text-h-text2 mt-1">استراحة بدل الحذف — بياناتك تبقى، ولا يراك أحد</p>
            </div>
            <ul className="bg-h-card border border-h-border rounded-2xl divide-y divide-h-divider">
              {([
                [EyeOff, "لا تظهر في الاكتشاف أو البحث أو القصص أو قوائم الإعجاب والزوّار"],
                [MessageSquareOff, "لا أحد يستطيع مشاهدة ملفك — يظهر للآخرين «مستخدم غير متاح»، ولا يستطيع أحد مراسلتك"],
                [BellOff, "لا تصلك إشعارات"],
                [ArrowRightLeft, "سجّل الدخول في أي وقت فيعود حسابك كما كان: محادثاتك وتطابقاتك وصورك"],
                [CreditCard, "اشتراك هلا+ لا يُلغى تلقائياً — ألغِه من متجر التطبيقات الذي اشتركت منه إن أردت"],
              ] as [React.ElementType, string][]).map(([I, t]) => (
                <li key={t} className="flex gap-3 p-4 text-sm leading-6"><I size={19} className="text-h-primary shrink-0 mt-0.5" />{t}</li>
              ))}
            </ul>
            <Button onClick={() => setAsk("hide")}>إخفاء حسابي</Button>
          </>
        ) : (
          <>
            <div className="text-center pt-2">
              <span className="inline-flex w-16 h-16 rounded-full bg-h-error/10 text-h-error items-center justify-center"><Trash2 size={28} /></span>
              <h2 className="text-xl font-extrabold mt-3">حذف الحساب نهائياً</h2>
              <p className="text-sm text-h-error mt-1 font-semibold flex items-center justify-center gap-1"><AlertTriangle size={15} /> هذا الإجراء لا يمكن التراجع عنه</p>
            </div>
            <div className="bg-h-card border border-h-border rounded-2xl p-4">
              <p className="font-bold mb-2">سيتم حذف:</p>
              <ul className="text-sm text-h-text2 list-disc ps-5 space-y-1">
                {["جميع بياناتك الشخصية", "جميع محادثاتك ورسائلك", "صورك ومعرض الصور", "اهتماماتك وإعداداتك", "اشتراكك (لن يتم استرداد المبلغ)", "سجل التفاعلات (لايكات، سوبر لايك)"].map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
            <p className="text-sm text-h-text2">تريد استراحة فقط؟ <button onClick={() => setMode("hide")} className="text-h-primary font-bold">أخفِ حسابك بدلاً من حذفه</button></p>
            {needsPassword && (
              <Field type="password" label="كلمة المرور" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={err} />
            )}
            <label className="flex items-start gap-3 text-sm leading-6 cursor-pointer">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 w-4 h-4 accent-[var(--h-error)]" />
              أفهم أن هذا الإجراء نهائي ولا يمكن التراجع عنه، وأن جميع بياناتي ستُحذف بشكل دائم.
            </label>
            <button onClick={() => setAsk("delete")} disabled={!agree || (needsPassword && !password)}
              className="w-full h-[52px] rounded-xl bg-h-error text-white font-bold disabled:opacity-40">حذف حسابي نهائياً</button>
          </>
        )}
        <Button variant="secondary" onClick={() => router.push("/settings")}>تراجع — احتفظ بحسابي</Button>
      </div>

      <Confirm open={ask === "hide"} onClose={() => setAsk(null)} onConfirm={hide} loading={busy} danger confirmText="إخفاء وتسجيل الخروج"
        title="إخفاء الحساب" message="سيختفي حسابك من كل مكان وتُسجَّل خارج الموقع. سجّل الدخول في أي وقت ليعود كما كان." />
      <Confirm open={ask === "delete"} onClose={() => setAsk(null)} onConfirm={del} loading={busy} danger confirmText="حذف نهائياً"
        title="تأكيد الحذف النهائي" message="هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك ومحادثاتك وصورك بشكل نهائي." />
    </div>
  );
}
