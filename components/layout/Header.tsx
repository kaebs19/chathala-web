"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Download,
  Info,
  Phone,
  HelpCircle,
  Smartphone,
} from "lucide-react";
import Logo from "@/components/shared/Logo";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/about", label: "حول التطبيق", icon: Info },
  { href: "/download", label: "تحميل التطبيق", icon: Download },
  { href: "/support", label: "الدعم", icon: HelpCircle },
  { href: "/contact", label: "اتصل بنا", icon: Phone },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "glass shadow-lg shadow-accent-pink/5"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" onClick={() => setIsOpen(false)}>
            <Logo />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-accent-pink bg-accent-pink/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {/* App Store Badge */}
            <a
              href="https://apps.apple.com/us/app/chat-hala/id1369295351"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-hover/50 hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors text-xs"
            >
              <Smartphone size={14} />
              <span>حمّل التطبيق</span>
            </a>

            <Link href="/login">
              <Button variant="ghost" size="sm">
                تسجيل الدخول
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">إنشاء حساب</Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-text-primary p-2"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden glass border-t border-border animate-fade-in-up">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors",
                  pathname === link.href
                    ? "text-accent-pink bg-accent-pink/10"
                    : "text-text-secondary hover:bg-bg-hover"
                )}
              >
                {link.icon && <link.icon size={18} />}
                {link.label}
              </Link>
            ))}

            {/* App Store في الموبايل */}
            <a
              href="https://apps.apple.com/us/app/chat-hala/id1369295351"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-success hover:bg-bg-hover transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Smartphone size={18} />
              حمّل من App Store
            </a>

            <div className="pt-3 flex flex-col gap-2">
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)}>
                <Button className="w-full">إنشاء حساب</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
