"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MessageCircle, Moon, Sun, X } from "lucide-react";
import HalaLogo from "@/components/hala/HalaLogo";
import Avatar from "@/components/hala/Avatar";
import StoreBadges from "@/components/landing/StoreBadges";
import { useTheme } from "@/stores/themeStore";
import { cn } from "@/lib/utils";

// روابط أقسام الرئيسية فقط في الترويسة — الصفحات الثانوية (حول/الدعم/اتصل) في القائمة والتذييل
const SECTIONS = [
  { href: "/#features", label: "المزايا" },
  { href: "/#how", label: "كيف يعمل" },
  { href: "/#safety", label: "الأمان" },
  { href: "/#faq", label: "الأسئلة" },
];
const MORE = [
  { href: "/about", label: "عن هلا" },
  { href: "/download", label: "تحميل التطبيق" },
  { href: "/support", label: "الدعم" },
  { href: "/contact", label: "اتصل بنا" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [me, setMe] = useState<{ name?: string; profileImage?: string } | null>(null);
  const { pref, set } = useTheme();
  const dark = pref === "dark" || (pref === "system" && typeof document !== "undefined" && document.documentElement.dataset.theme === "dark");

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    try { const u = localStorage.getItem("token") && localStorage.getItem("user"); if (u) setMe(JSON.parse(u)); } catch {}
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className={cn("fixed top-0 inset-x-0 z-50 transition-all", scrolled || open ? "bg-h-bg/85 backdrop-blur-xl border-b border-h-border" : "bg-transparent border-b border-transparent")}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        <Link href="/" aria-label="هلا — الرئيسية" className="shrink-0"><HalaLogo size={36} /></Link>

        <nav aria-label="أقسام الصفحة" className="hidden md:flex items-center gap-1 mx-auto">
          {SECTIONS.map((l) => (
            <Link key={l.href} href={l.href} className="px-3.5 h-9 rounded-full flex items-center text-[15px] font-semibold text-h-text2 hover:text-h-text hover:bg-h-input transition">{l.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 ms-auto md:ms-0">
          <button onClick={() => set(dark ? "light" : "dark")} aria-label={dark ? "الوضع الفاتح" : "الوضع الداكن"}
            className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-h-text2 hover:bg-h-input hover:text-h-text transition">
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {/* زائر */}
          <span className="auth-out flex items-center gap-2">
            <Link href="/login" className="hidden sm:flex h-10 px-4 rounded-full items-center text-[15px] font-bold text-h-text hover:bg-h-input transition">دخول</Link>
            <Link href="/register" className="h-10 px-5 rounded-full flex items-center text-[15px] font-bold text-white h-gradient shadow-[0_6px_18px_-6px_var(--h-primary)] hover:brightness-105 transition">ابدأ مجاناً</Link>
          </span>
          {/* مسجّل */}
          <span className="auth-in flex items-center gap-2">
            <Link href="/chats" className="h-10 px-4 rounded-full flex items-center gap-2 text-[15px] font-bold text-white h-gradient">
              <MessageCircle size={17} /> محادثاتي
            </Link>
            {me && <Link href="/profile" aria-label="ملفي" className="hidden sm:block"><Avatar src={me.profileImage} name={me.name} size="sm" /></Link>}
          </span>

          <button onClick={() => setOpen((v) => !v)} aria-label={open ? "إغلاق القائمة" : "القائمة"} aria-expanded={open}
            className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-h-text hover:bg-h-input">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden h-[calc(100dvh-64px)] overflow-y-auto bg-h-bg px-4 pb-8 h-fade">
          <nav aria-label="القائمة" className="py-3 space-y-1">
            {SECTIONS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="flex h-12 px-4 rounded-xl items-center text-lg font-bold hover:bg-h-input">{l.label}</Link>
            ))}
          </nav>
          <div className="h-px bg-h-divider my-2" />
          <div className="py-2 grid grid-cols-2 gap-1">
            {MORE.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="flex h-11 px-4 rounded-xl items-center text-[15px] font-semibold text-h-text2 hover:bg-h-input">{l.label}</Link>
            ))}
          </div>
          <div className="auth-out mt-4 grid gap-2">
            <Link href="/register" className="h-12 rounded-xl flex items-center justify-center font-bold text-white h-gradient">ابدأ مجاناً</Link>
            <Link href="/login" className="h-12 rounded-xl flex items-center justify-center font-bold bg-h-input">لدي حساب — دخول</Link>
          </div>
          <div className="mt-6">
            <p className="text-sm font-bold text-h-text2 mb-3">أو حمّل التطبيق</p>
            <StoreBadges />
          </div>
          <button onClick={() => set(dark ? "light" : "dark")} className="mt-6 flex items-center gap-2 text-sm font-bold text-h-text2">
            {dark ? <Sun size={17} /> : <Moon size={17} />} {dark ? "الوضع الفاتح" : "الوضع الداكن"}
          </button>
        </div>
      )}
    </header>
  );
}
