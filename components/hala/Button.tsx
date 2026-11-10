"use client";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "gold";
type Size = "sm" | "md" | "lg";

export default function Button({
  variant = "primary", size = "lg", loading, block = true, className, children, disabled, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; loading?: boolean; block?: boolean }) {
  const sizes = { sm: "h-9 px-4 text-sm rounded-xl", md: "h-11 px-5 text-[15px] rounded-xl", lg: "h-[52px] px-6 text-base rounded-xl" };
  const variants = {
    // GradientButton في iOS: primary → accent مع توهّج
    primary: "h-gradient text-white shadow-[0_5px_14px_-4px_color-mix(in_srgb,var(--h-primary)_55%,transparent)] disabled:bg-none disabled:bg-h-text2/45 disabled:shadow-none",
    secondary: "bg-h-card text-h-text border border-h-border hover:bg-h-input",
    ghost: "text-h-primary hover:bg-h-primary/10",
    danger: "bg-h-error/10 text-h-error hover:bg-h-error/15",
    gold: "bg-gradient-to-l from-[#FFD600] to-[#FF8C00] text-[#3A2400]",
  };
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-bold transition active:scale-[.98] disabled:cursor-not-allowed",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-h-primary",
        sizes[size], variants[variant], block && "w-full", disabled && variant !== "primary" && "opacity-50", className
      )}
      {...rest}
    >
      {loading ? <Loader2 size={20} className="animate-spin" /> : children}
    </button>
  );
}
