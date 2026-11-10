"use client";
import { cn } from "@/lib/utils";

export default function Switch({ checked, onChange, disabled, label }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("relative w-[51px] h-[31px] rounded-full transition-colors shrink-0", checked ? "bg-h-primary" : "bg-h-text2/30", disabled && "opacity-50")}>
      <span className={cn("absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white shadow transition-all", checked ? "start-[22px]" : "start-[2px]")} />
    </button>
  );
}
