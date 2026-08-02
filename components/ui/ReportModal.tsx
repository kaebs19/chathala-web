"use client";

import { useState } from "react";
import { X, Flag, AlertTriangle } from "lucide-react";
import { reportAPI } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { logError } from "@/lib/logger";

interface ReportModalProps {
  userId: string;
  userName?: string;
  onClose: () => void;
}

const reasons = [
  { value: "spam", label: "رسائل مزعجة (سبام)", icon: "📩" },
  { value: "inappropriate", label: "محتوى غير لائق", icon: "🚫" },
  { value: "harassment", label: "تحرّش أو إزعاج", icon: "⚠️" },
  { value: "fake_profile", label: "حساب مزيّف", icon: "🎭" },
  { value: "other", label: "سبب آخر", icon: "📝" },
];

export default function ReportModal({ userId, userName, onClose }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast("يرجى اختيار سبب البلاغ", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = (await reportAPI.reportUser(
        userId,
        selectedReason,
        description.trim() || undefined
      )) as { success: boolean; message?: string };
      if (res.success) {
        toast("تم إرسال البلاغ. شكراً لمساهمتك في الحفاظ على بيئة آمنة", "success", 4000);
        onClose();
      } else {
        toast(res.message || "فشل إرسال البلاغ", "error");
      }
    } catch (err) {
      logError("report", err);
      toast("حدث خطأ في الاتصال", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-bg-secondary border border-border rounded-2xl p-6 max-w-sm w-full animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
              <Flag size={20} className="text-error" />
            </div>
            <div>
              <h3 className="font-black text-base">الإبلاغ عن مستخدم</h3>
              {userName && <p className="text-xs text-text-muted">{userName}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X size={20} />
          </button>
        </div>

        {/* Reasons */}
        <div className="space-y-2 mb-4">
          {reasons.map((r) => (
            <button
              key={r.value}
              onClick={() => setSelectedReason(r.value)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border text-sm font-medium text-right transition-all",
                selectedReason === r.value
                  ? "border-error bg-error/5 text-error"
                  : "border-border hover:border-error/30 text-text-primary"
              )}
            >
              <span className="text-lg">{r.icon}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </div>

        {/* Description */}
        <textarea
          className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-base sm:text-sm text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-error/50 min-h-[80px] resize-y mb-4"
          placeholder="وصف إضافي (اختياري)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
        />

        {/* Warning */}
        <div className="flex items-start gap-2 mb-4 p-3 bg-warning/5 border border-warning/20 rounded-xl">
          <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-text-muted leading-relaxed">
            البلاغات الكاذبة قد تؤدي لتقييد حسابك. يرجى الإبلاغ فقط عن المخالفات الحقيقية.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-border text-sm font-bold hover:bg-bg-hover transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedReason || submitting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-error text-white text-sm font-bold hover:bg-error/90 transition-colors disabled:opacity-50"
          >
            {submitting ? "جاري الإرسال..." : "إرسال البلاغ"}
          </button>
        </div>
      </div>
    </div>
  );
}
