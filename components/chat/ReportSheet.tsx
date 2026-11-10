"use client";
import { useState } from "react";
import Sheet from "@/components/hala/Sheet";
import Button from "@/components/hala/Button";
import Field from "@/components/hala/Field";
import { toast } from "@/components/hala/Toast";
import { userAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

// القيم التي يقبلها POST /mobile/reports وحدها (validReasons في الخادم)
const REASONS: [string, string][] = [
  ["inappropriate", "محتوى غير لائق"],
  ["harassment", "تحرّش أو إساءة"],
  ["spam", "إزعاج أو رسائل مكرّرة"],
  ["fake_profile", "حساب مزيّف أو انتحال"],
  ["other", "سبب آخر (احتيال، قاصر…) — اكتبه بالأسفل"],
];

export default function ReportSheet({ open, onClose, userId, name }: { open: boolean; onClose: () => void; userId: string; name?: string }) {
  const [reason, setReason] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    const r = await userAPI.report(userId, reason, desc.trim() || undefined);
    setBusy(false);
    if (r.success) { toast.success("وصل بلاغك، شكراً لك"); onClose(); setReason(""); setDesc(""); }
    else toast.error(r.message || "تعذّر إرسال البلاغ");
  };
  return (
    <Sheet open={open} onClose={onClose} title={`إبلاغ عن ${name || "المستخدم"}`}>
      <div className="space-y-2 py-2">
        {REASONS.map(([k, l]) => (
          <button key={k} onClick={() => setReason(k)} aria-pressed={reason === k}
            className={cn("w-full text-start px-4 py-3 rounded-xl border-[1.5px] font-semibold text-[15px] transition",
              reason === k ? "border-h-primary bg-h-primary/8 text-h-primary" : "border-h-border")}>{l}</button>
        ))}
        <Field textarea rows={3} placeholder="تفاصيل إضافية (اختياري)" value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={500} className="pt-2" />
        <Button onClick={submit} loading={busy} disabled={!reason} className="mt-2">إرسال البلاغ</Button>
      </div>
    </Sheet>
  );
}
