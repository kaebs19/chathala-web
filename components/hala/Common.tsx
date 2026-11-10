"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ size = 28, className }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={cn("animate-spin text-h-primary", className)} aria-label="جارٍ التحميل" />;
}

export function CenterSpinner() {
  return <div className="flex items-center justify-center py-20"><Spinner /></div>;
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: React.ElementType; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center px-8 py-16">
      <div className="w-20 h-20 rounded-full bg-h-primary/10 flex items-center justify-center mb-4">
        <Icon size={36} className="text-h-primary" />
      </div>
      <h3 className="text-lg font-extrabold mb-1">{title}</h3>
      {text && <p className="text-sm text-h-text2 leading-7 max-w-xs">{text}</p>}
      {action && <div className="mt-5 w-full max-w-xs">{action}</div>}
    </div>
  );
}

/** ترويسة الصفحة (مثل NavigationStack: عنوان + رجوع + أزرار) */
export function TopBar({ title, back, actions, sub, className }: { title?: React.ReactNode; back?: string | boolean; actions?: React.ReactNode; sub?: React.ReactNode; className?: string }) {
  const router = useRouter();
  return (
    <header className={cn("sticky top-0 z-30 bg-h-bg/85 backdrop-blur-xl border-b border-h-divider", className)}>
      <div className="h-14 px-3 sm:px-5 flex items-center gap-2">
        {back && (
          <button onClick={() => (typeof back === "string" ? router.push(back) : router.back())} aria-label="رجوع"
            className="w-10 h-10 -ms-1 rounded-full flex items-center justify-center hover:bg-h-input text-h-text">
            <ArrowRight size={22} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          {typeof title === "string" ? <h1 className="text-xl font-extrabold truncate">{title}</h1> : title}
        </div>
        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </div>
      {sub}
    </header>
  );
}

export function IconButton({ label, children, className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button aria-label={label} title={label} className={cn("w-10 h-10 rounded-full flex items-center justify-center text-h-text hover:bg-h-input transition", className)} {...rest}>
      {children}
    </button>
  );
}

/** SettingsRow: أيقونة ملوّنة + عنوان + وصف + نهاية (سهم أو مفتاح) */
export function Row({ icon: Icon, color = "var(--h-primary)", title, subtitle, href, onClick, end, danger }: {
  icon?: React.ElementType; color?: string; title: string; subtitle?: string; href?: string; onClick?: () => void; end?: React.ReactNode; danger?: boolean;
}) {
  const inner = (
    <>
      {Icon && (
        <span className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
          <Icon size={19} />
        </span>
      )}
      <span className="flex-1 min-w-0 text-start">
        <span className={cn("block text-[15px] font-bold", danger && "text-h-error")}>{title}</span>
        {subtitle && <span className="block text-xs text-h-text2 mt-0.5 leading-5">{subtitle}</span>}
      </span>
      {end ?? ((href || onClick) && <ChevronLeft size={18} className="text-h-text2" />)}
    </>
  );
  const cls = "w-full flex items-center gap-3 px-4 py-3 hover:bg-h-input/60 transition";
  if (href) return <Link href={href} className={cls}>{inner}</Link>;
  if (onClick) return <button onClick={onClick} className={cls}>{inner}</button>;
  return <div className={cls}>{inner}</div>;
}

export function Section({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("mb-5", className)}>
      {title && <h2 className="text-xs font-bold text-h-text2 px-4 mb-2">{title}</h2>}
      <div className="bg-h-card rounded-2xl border border-h-border overflow-hidden divide-y divide-h-divider">{children}</div>
    </section>
  );
}

export function Chip({ active, children, onClick, className }: { active?: boolean; children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button onClick={onClick} aria-pressed={active}
      className={cn("h-9 px-4 rounded-full text-sm font-bold whitespace-nowrap transition shrink-0",
        active ? "h-gradient text-white" : "bg-h-chip text-h-text2 hover:text-h-text", className)}>
      {children}
    </button>
  );
}

export function LinkText({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="text-h-primary font-bold hover:underline">{children}</Link>;
}
