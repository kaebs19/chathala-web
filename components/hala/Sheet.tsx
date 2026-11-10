"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** ورقة سفلية على الجوال ونافذة وسطية على سطح المكتب */
export default function Sheet({ open, onClose, title, children, className, wide }: {
  open: boolean; onClose: () => void; title?: string; children: React.ReactNode; className?: string; wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-[var(--h-overlay)] h-fade" onClick={onClose} />
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className={cn("relative h-sheet w-full bg-h-card text-h-text rounded-t-3xl sm:rounded-3xl max-h-[88dvh] overflow-y-auto h-scroll outline-none",
          wide ? "sm:max-w-xl" : "sm:max-w-md", "pb-[max(1rem,env(safe-area-inset-bottom))]", className)}>
        <div className="sm:hidden mx-auto mt-2 h-1.5 w-10 rounded-full bg-h-border" />
        {title && (
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h2 className="text-lg font-extrabold">{title}</h2>
            <button onClick={onClose} aria-label="إغلاق" className="w-9 h-9 rounded-full bg-h-input flex items-center justify-center text-h-text2"><X size={18} /></button>
          </div>
        )}
        <div className="px-5 pb-2">{children}</div>
      </div>
    </div>
  );
}

export function Confirm({ open, title, message, confirmText = "تأكيد", danger, onConfirm, onClose, loading }: {
  open: boolean; title: string; message?: string; confirmText?: string; danger?: boolean; loading?: boolean; onConfirm: () => void; onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="text-center pt-5">
        <h2 className="text-lg font-extrabold mb-2">{title}</h2>
        {message && <p className="text-sm text-h-text2 leading-7 mb-5">{message}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-12 rounded-xl bg-h-input font-bold">إلغاء</button>
          <button onClick={onConfirm} disabled={loading}
            className={cn("flex-1 h-12 rounded-xl font-bold text-white", danger ? "bg-h-error" : "h-gradient", loading && "opacity-60")}>
            {confirmText}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
