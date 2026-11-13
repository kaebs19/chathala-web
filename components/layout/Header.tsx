"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages, Menu, MessageCircle, Moon, Sun, X } from "lucide-react";
import HalaLogo from "@/components/hala/HalaLogo";
import Avatar from "@/components/hala/Avatar";
import StoreBadges from "@/components/landing/StoreBadges";
import { useTheme } from "@/stores/themeStore";
import { cn } from "@/lib/utils";
import { lp, switchLocalePath } from "@/lib/i18n";

// روابط أقسام الرئيسية فقط في الترويسة — الصفحات الثانوية (حول/الدعم/اتصل) في القائمة والتذييل.
// المسارات بصيغتها العربية وتُحوَّل بـ lp() — اللغة من المسار (/en…) فلا حاجة لتمريرها.
const T = {
  ar: {
    sections: [["/#features", "المزايا"], ["/#start", "ابدأ من هنا"], ["/blog", "المقالات"]],
    more: [["/about", "عن هلا"], ["/download", "تحميل التطبيق"], ["/support", "الدعم"], ["/contact", "اتصل بنا"]],
    home: "هلا — الرئيسية", navSections: "أقسام الصفحة", light: "الوضع الفاتح", dark: "الوضع الداكن",
    login: "دخول", start: "ابدأ مجاناً", chats: "محادثاتي", me: "ملفي", close: "إغلاق القائمة", menu: "القائمة",
    haveAccount: "لدي حساب — دخول", orDownload: "أو حمّل التطبيق", other: "English", otherShort: "EN",
  },
  en: {
    sections: [["/#features", "Features"], ["/#start", "Start here"], ["/blog", "Blog"]],
    more: [["/about", "About Hala"], ["/download", "Download"], ["/support", "Support"], ["/contact", "Contact"]],
    home: "Hala — Home", navSections: "Page sections", light: "Light mode", dark: "Dark mode",
    login: "Log in", start: "Start free", chats: "My chats", me: "My profile", close: "Close menu", menu: "Menu",
    haveAccount: "I have an account — log in", orDownload: "Or download the app", other: "العربية", otherShort: "ع",
  },
} as const;

export default function Header() {
  const pathname = usePathname();
  const sw = switchLocalePath(pathname || "/");
  const locale = sw.locale;
  const t = T[locale];
  const SECTIONS = t.sections.map(([href, label]) => ({ href: lp(locale, href), label }));
  const MORE = t.more.map(([href, label]) => ({ href: lp(locale, href), label }));
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [me, setMe] = useState<{ name?: string; profileImage?: string } | null>(null);
  const set = useTheme((s) => s.set);
  // ⚠️ يُحسب بعد التركيب لا أثناء الرسم: الخادم لا يعرف الوضع، وحسابه في الرسم كان يُنتج
  //    خطأ ترطيب (React #418) فيُعاد رسم الصفحة كلها (~3ث حجب في Lighthouse على الجوال)
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const read = () => setDark(document.documentElement.dataset.theme === "dark");
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

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
        <Link href={lp(locale, "/")} aria-label={t.home} className="shrink-0"><HalaLogo size={36} /></Link>

        <nav aria-label={t.navSections} className="hidden md:flex items-center gap-1 mx-auto">
          {SECTIONS.map((l) => (
            <Link key={l.href} href={l.href} className="px-3.5 h-9 rounded-full flex items-center text-[15px] font-semibold text-h-text2 hover:text-h-text hover:bg-h-input transition">{l.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 ms-auto md:ms-0">
          <button onClick={() => set(dark ? "light" : "dark")} aria-label={dark ? t.light : t.dark}
            className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-h-text2 hover:bg-h-input hover:text-h-text transition">
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {/* اللغة الأخرى: الصفحة نفسها إن وُجدت نسختها، وإلا رئيسية تلك اللغة */}
          <Link href={sw.href} hrefLang={sw.target} lang={sw.target} aria-label={t.other}
            className="flex h-10 px-3 rounded-full items-center gap-1.5 text-sm font-bold text-h-text2 hover:bg-h-input hover:text-h-text transition">
            <Languages size={17} /> <span className="hidden sm:inline">{t.other}</span><span className="sm:hidden">{t.otherShort}</span>
          </Link>

          {/* زائر */}
          <span className="auth-out flex items-center gap-2">
            <Link href="/login" className="hidden sm:flex h-10 px-4 rounded-full items-center text-[15px] font-bold text-h-text hover:bg-h-input transition">{t.login}</Link>
            <Link href="/register" className="h-10 px-5 rounded-full flex items-center text-[15px] font-bold text-white h-gradient shadow-[0_6px_18px_-6px_var(--h-primary)] hover:brightness-105 transition">{t.start}</Link>
          </span>
          {/* مسجّل */}
          <span className="auth-in flex items-center gap-2">
            <Link href="/chats" className="h-10 px-4 rounded-full flex items-center gap-2 text-[15px] font-bold text-white h-gradient">
              <MessageCircle size={17} /> {t.chats}
            </Link>
            {me && <Link href="/profile" aria-label={t.me} className="hidden sm:block"><Avatar src={me.profileImage} name={me.name} size="sm" /></Link>}
          </span>

          <button onClick={() => setOpen((v) => !v)} aria-label={open ? t.close : t.menu} aria-expanded={open}
            className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-h-text hover:bg-h-input">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden h-[calc(100dvh-64px)] overflow-y-auto bg-h-bg px-4 pb-8 h-fade">
          <nav aria-label={t.menu} className="py-3 space-y-1">
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
            <Link href="/register" className="h-12 rounded-xl flex items-center justify-center font-bold text-white h-gradient">{t.start}</Link>
            <Link href="/login" className="h-12 rounded-xl flex items-center justify-center font-bold bg-h-input">{t.haveAccount}</Link>
          </div>
          <div className="mt-6">
            <p className="text-sm font-bold text-h-text2 mb-3">{t.orDownload}</p>
            <StoreBadges />
          </div>
          <button onClick={() => set(dark ? "light" : "dark")} className="mt-6 flex items-center gap-2 text-sm font-bold text-h-text2">
            {dark ? <Sun size={17} /> : <Moon size={17} />} {dark ? t.light : t.dark}
          </button>
        </div>
      )}
    </header>
  );
}
