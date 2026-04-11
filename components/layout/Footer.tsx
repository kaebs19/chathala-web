import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { Heart, Mail, Shield, FileText } from "lucide-react";

const footerLinks = {
  التطبيق: [
    { href: "/download", label: "تحميل التطبيق" },
    { href: "/about", label: "حول ChatHala" },
    { href: "/premium", label: "المميزات المدفوعة" },
  ],
  الدعم: [
    { href: "/contact", label: "اتصل بنا" },
    { href: "/support", label: "الدعم الفني" },
    { href: "/support#faq", label: "الأسئلة الشائعة" },
  ],
  قانوني: [
    { href: "/privacy", label: "سياسة الخصوصية" },
    { href: "/terms", label: "شروط الاستخدام" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Logo size="lg" />
            <p className="mt-4 text-text-muted text-sm leading-relaxed">
              منصة تواصل اجتماعي عربية للتعارف والدردشة. اكتشف أشخاص جدد وابنِ
              علاقات حقيقية بخصوصية تامة.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-bold text-text-primary mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted hover:text-accent-pink transition-colors"
                    >
                      {link.label}
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
            &copy; {new Date().getFullYear()} ChatHala. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-1 text-sm text-text-muted">
            صُنع بـ <Heart size={14} className="text-accent-pink mx-1" /> في
            السعودية
          </div>
        </div>
      </div>
    </footer>
  );
}
