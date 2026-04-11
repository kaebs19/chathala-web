"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  Bell,
  Crown,
  HelpCircle,
  FileText,
  Info,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const settingsGroups = [
  {
    title: "الحساب",
    items: [
      { href: "/profile/edit", icon: User, label: "تعديل الملف الشخصي" },
      { href: "/settings/privacy", icon: Shield, label: "الخصوصية والأمان" },
      { href: "#", icon: Bell, label: "الإشعارات" },
      { href: "/premium", icon: Crown, label: "الاشتراك المميز", accent: true },
    ],
  },
  {
    title: "المعلومات",
    items: [
      { href: "/support", icon: HelpCircle, label: "الدعم الفني" },
      { href: "/terms", icon: FileText, label: "شروط الاستخدام" },
      { href: "/privacy", icon: Shield, label: "سياسة الخصوصية" },
      { href: "/about", icon: Info, label: "حول ChatHala" },
    ],
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuthStore();

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <h1 className="text-xl font-black mb-6">الإعدادات</h1>

      {settingsGroups.map((group) => (
        <div key={group.title} className="mb-6">
          <h2 className="text-sm font-bold text-text-muted mb-3">
            {group.title}
          </h2>
          <div className="bg-bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border/50">
            {group.items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 p-4 hover:bg-bg-hover transition-colors"
              >
                <item.icon
                  size={20}
                  className={
                    item.accent ? "text-warning" : "text-text-muted"
                  }
                />
                <span
                  className={`flex-1 text-sm font-medium ${
                    item.accent ? "text-warning" : ""
                  }`}
                >
                  {item.label}
                </span>
                <ChevronLeft size={16} className="text-text-muted" />
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Logout */}
      <button
        onClick={() => {
          logout();
          router.push("/");
        }}
        className="w-full flex items-center justify-center gap-2 p-4 bg-error/5 border border-error/20 rounded-2xl text-error font-bold text-sm hover:bg-error/10 transition-colors"
      >
        <LogOut size={18} />
        تسجيل الخروج
      </button>

      {/* Version */}
      <p className="text-center text-text-muted/40 text-xs mt-8">
        ChatHala Web v1.0.0
      </p>
    </div>
  );
}
