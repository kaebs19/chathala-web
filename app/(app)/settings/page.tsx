"use client";

import { useState } from "react";
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
  Trash2,
  AlertTriangle,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { disconnectSocket } from "@/lib/socket";
import { toast } from "@/components/ui/Toast";
import { api } from "@/lib/api";

const settingsGroups = [
  {
    title: "الحساب",
    items: [
      { href: "/profile/edit", icon: User, label: "تعديل الملف الشخصي" },
      { href: "/settings/privacy", icon: Shield, label: "الخصوصية والأمان" },
      { href: "/settings/notifications", icon: Bell, label: "الإشعارات" },
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
  const { user, logout } = useAuthStore();
  const { reset: resetChat } = useChatStore();
  const { reset: resetNotifications } = useNotificationStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => {
    disconnectSocket();
    resetChat();
    resetNotifications();
    logout();
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = (await api("/auth/delete-account", { method: "DELETE" })) as { success: boolean };
      if (res.success) {
        toast("تم حذف الحساب", "success");
        handleLogout();
      } else {
        toast("فشل حذف الحساب", "error");
      }
    } catch {
      toast("حدث خطأ", "error");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <h1 className="text-xl font-black mb-6">الإعدادات</h1>

      {/* User Info Card */}
      {user && (
        <Link
          href="/profile"
          className="flex items-center gap-4 p-4 mb-6 bg-bg-card border border-border rounded-2xl hover:bg-bg-hover transition-colors"
        >
          <Avatar
            src={user.profileImage}
            name={user.name}
            size="lg"
            isOnline
            isPremium={user.isPremium}
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base truncate">{user.name}</h2>
            <p className="text-sm text-text-muted truncate">{user.email}</p>
            {user.halaId && (
              <p className="text-xs text-accent-pink font-medium">@{user.halaId}</p>
            )}
          </div>
          <ChevronLeft size={18} className="text-text-muted shrink-0" />
        </Link>
      )}

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
                  className={item.accent ? "text-warning" : "text-text-muted"}
                />
                <span
                  className={`flex-1 text-sm font-medium ${item.accent ? "text-warning" : ""}`}
                >
                  {item.label}
                </span>
                <ChevronLeft size={16} className="text-text-muted" />
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Danger Zone */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-text-muted mb-3">منطقة الخطر</h2>
        <div className="bg-bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border/50">
          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 hover:bg-bg-hover transition-colors"
          >
            <LogOut size={20} className="text-error/70" />
            <span className="flex-1 text-sm font-medium text-error/80 text-right">تسجيل الخروج</span>
          </button>
          {/* Delete Account */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-3 p-4 hover:bg-error/5 transition-colors"
          >
            <Trash2 size={20} className="text-error/50" />
            <span className="flex-1 text-sm font-medium text-error/60 text-right">حذف الحساب</span>
          </button>
        </div>
      </div>

      {/* Version */}
      <p className="text-center text-text-muted/40 text-xs mt-8">
        ChatHala Web v2.0.0
      </p>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-bg-secondary border border-border rounded-2xl p-6 max-w-sm w-full animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                <AlertTriangle size={20} className="text-error" />
              </div>
              <h3 className="font-black text-lg">حذف الحساب</h3>
            </div>
            <p className="text-sm text-text-muted mb-6 leading-relaxed">
              هل أنت متأكد من حذف حسابك؟ سيتم حذف جميع بياناتك ومحادثاتك ولا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-border text-sm font-bold hover:bg-bg-hover transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-error text-white text-sm font-bold hover:bg-error/90 transition-colors disabled:opacity-50"
              >
                {deleting ? "جاري الحذف..." : "حذف نهائي"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
