"use client";

import { useEffect, useState } from "react";
import { Check, UserCheck, UserMinus, UserPlus, X, Clock } from "lucide-react";
import Sheet, { Confirm } from "@/components/hala/Sheet";
import { toast } from "@/components/hala/Toast";
import { friendAPI, type FriendStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

/** زر الصداقة في ملف الآخرين: إضافة / مُرسل (سحب) / وصلك طلب (قبول ورفض) / صديقان (إزالة) */
export default function FriendButton({ userId, name, className }: { userId: string; name: string; className?: string }) {
  const [status, setStatus] = useState<FriendStatus | null>(null);
  const [fid, setFid] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [askRemove, setAskRemove] = useState(false);

  useEffect(() => {
    friendAPI.status(userId).then((r) => {
      const d = r.data as { status?: FriendStatus; friendshipId?: string | null } | undefined;
      if (r.success && d?.status) { setStatus(d.status); setFid(d.friendshipId || null); }
    });
  }, [userId]);

  const run = async (fn: () => Promise<{ success: boolean; message?: string; data?: unknown }>, next: FriendStatus, ok: string) => {
    setBusy(true);
    const r = await fn();
    setBusy(false); setSheet(false); setAskRemove(false);
    const d = r.data as { status?: FriendStatus; friendshipId?: string } | undefined;
    if (r.success) { setStatus(d?.status || next); if (d?.friendshipId) setFid(d.friendshipId); toast.success(ok); }
    else { if (d?.status) setStatus(d.status); toast.error(r.message || "تعذّر"); }
  };

  if (!status) return null;
  const base = "h-10 px-4 rounded-full text-sm font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50";

  return (
    <>
      {status === "none" && (
        <button disabled={busy} onClick={() => run(() => friendAPI.request(userId), "pending_sent", "أُرسل طلب الصداقة")} className={cn(base, "bg-h-primary/10 text-h-primary", className)}>
          <UserPlus size={17} /> إضافة صديق
        </button>
      )}
      {status === "pending_sent" && (
        <button disabled={busy} onClick={() => setSheet(true)} className={cn(base, "bg-h-chip text-h-text2", className)}>
          <Clock size={16} /> الطلب مُرسل
        </button>
      )}
      {status === "pending_received" && (
        <div className={cn("flex gap-2", className)}>
          <button disabled={busy || !fid} onClick={() => run(() => friendAPI.accept(fid!), "friends", `أصبحت صديقاً لـ${name}`)} className={cn(base, "h-gradient text-white")}><Check size={17} /> قبول الصداقة</button>
          <button disabled={busy || !fid} onClick={() => run(() => friendAPI.decline(fid!), "none", "رُفض الطلب")} aria-label="رفض طلب الصداقة" className={cn(base, "bg-h-chip text-h-text2 px-3")}><X size={17} /></button>
        </div>
      )}
      {status === "friends" && (
        <button disabled={busy} onClick={() => setAskRemove(true)} className={cn(base, "bg-h-success/12 text-h-success", className)}>
          <UserCheck size={17} /> صديقان
        </button>
      )}

      <Sheet open={sheet} onClose={() => setSheet(false)}>
        <div className="py-4 space-y-3 text-center">
          <p className="font-bold">طلب الصداقة إلى {name} بانتظار الرد</p>
          <button onClick={() => run(() => friendAPI.remove(userId), "none", "سُحب الطلب")} className="w-full h-12 rounded-xl bg-h-error/10 text-h-error font-bold flex items-center justify-center gap-2"><UserMinus size={18} /> سحب الطلب</button>
        </div>
      </Sheet>
      <Confirm open={askRemove} onClose={() => setAskRemove(false)} danger confirmText="إزالة" loading={busy}
        title={`إزالة ${name} من الأصدقاء؟`} message="تبقى محادثتكما كما هي."
        onConfirm={() => run(() => friendAPI.remove(userId), "none", "أُزيل من الأصدقاء")} />
    </>
  );
}
