"use client";
import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/** AppTextField في iOS: حقل بخلفية InputBackground وحدّ عند التركيز */
export default function Field({
  label, error, hint, icon, type = "text", className, textarea, rows = 3, ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string; error?: string | null; hint?: string; icon?: React.ReactNode; textarea?: boolean; rows?: number;
}) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPw = type === "password";
  const base = cn(
    "w-full bg-h-input text-h-text placeholder:text-h-text2/70 rounded-xl border-[1.5px] outline-none transition",
    "focus:border-h-primary", error ? "border-h-error" : "border-transparent",
    // جهات فعلية لا منطقية: بعض الحقول dir="ltr" (البريد) والحاوية RTL دائماً
    icon ? "pr-11" : "pr-4", isPw ? "pl-11" : "pl-4"
  );
  return (
    <div className={className}>
      {label && <label htmlFor={id} className="block text-sm font-bold text-h-text mb-1.5">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-h-text2 pointer-events-none">{icon}</span>}
        {textarea ? (
          <textarea id={id} rows={rows} className={cn(base, "py-3 resize-none leading-7")} aria-invalid={!!error} {...rest} />
        ) : (
          <input id={id} type={isPw && show ? "text" : type} className={cn(base, "h-[52px]")} aria-invalid={!!error} {...rest} />
        )}
        {isPw && (
          <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-h-text2 p-1">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error ? <p className="text-xs text-h-error mt-1.5 font-semibold">{error}</p> : hint ? <p className="text-xs text-h-text2 mt-1.5">{hint}</p> : null}
    </div>
  );
}
