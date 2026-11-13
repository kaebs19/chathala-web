"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import HalaLogo from "@/components/hala/HalaLogo";
import StoreBadges from "@/components/landing/StoreBadges";
import { Heart } from "lucide-react";
import { lp, switchLocalePath } from "@/lib/i18n";

// المسارات بصيغتها العربية وتُحوَّل بـ lp() — اللغة من المسار (/en…)
const T = {
  ar: {
    tagline: "دردشة وتعارف عربي — من الجوال أو المتصفح، بخصوصية وأمان.",
    cols: [
      ["التطبيق", [["/download", "تحميل التطبيق"], ["/about", "حول ChatHala"], ["/blog", "المقالات"], ["/premium", "المميزات المدفوعة"]]],
      ["الدعم", [["/contact", "اتصل بنا"], ["/support", "الدعم الفني"], ["/support#faq", "الأسئلة الشائعة"]]],
      ["قانوني", [["/privacy", "سياسة الخصوصية"], ["/terms", "شروط الاستخدام"], ["/child-safety", "معايير سلامة الأطفال"], ["/report-content", "طلب إزالة محتوى"]]],
    ],
    rights: "هلا — ChatHala. جميع الحقوق محفوظة.", madeA: "صُنع بـ", madeB: "في السعودية", other: "English",
  },
  en: {
    tagline: "Arabic chat and friendship — on mobile or in the browser, private and safe.",
    cols: [
      ["App", [["/download", "Download the app"], ["/about", "About ChatHala"], ["/blog", "Blog"]]],
      ["Support", [["/contact", "Contact us"], ["/support", "Help centre"], ["/support#faq", "FAQ"]]],
      ["Legal", [["/privacy", "Privacy Policy"], ["/terms", "Terms of Use"], ["/child-safety", "Child Safety Standards"], ["/report-content", "Request content removal"]]],
    ],
    rights: "Hala — ChatHala. All rights reserved.", madeA: "Made with", madeB: "in Saudi Arabia", other: "العربية",
  },
} as const;

export default function Footer() {
  const sw = switchLocalePath(usePathname() || "/");
  const locale = sw.locale;
  const t = T[locale];
  return (
    <footer className="bg-bg-secondary border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <HalaLogo size={40} />
            <p className="mt-4 text-text-muted text-sm leading-relaxed">{t.tagline}</p>
            <StoreBadges className="mt-5" />
          </div>

          {/* Links */}
          {t.cols.map(([title, links]) => (
            <div key={title}>
              <h3 className="font-bold text-text-primary mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={lp(locale, href)} className="text-sm text-text-muted hover:text-accent-pink transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} {t.rights}
          </p>
          <div className="flex items-center gap-4 text-sm text-text-muted">
            <Link href={sw.href} hrefLang={sw.target} lang={sw.target} className="font-bold hover:text-accent-pink transition-colors">{t.other}</Link>
            <span className="flex items-center gap-1">
              {t.madeA} <Heart size={14} className="text-accent-pink mx-1" /> {t.madeB}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
