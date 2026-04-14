"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  MessageCircle,
  Compass,
  Heart,
  Bell,
  User,
  Settings,
  Crown,
  LogOut,
  UserPlus,
} from "lucide-react";
import Logo from "@/components/shared/Logo";
import Avatar from "@/components/ui/Avatar";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useChatStore } from "@/stores/chatStore";
import { useSocket } from "@/hooks/useSocket";
import { disconnectSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/explore", icon: Compass, label: "اكتشاف" },
  { href: "/chats", icon: MessageCircle, label: "المحادثات", badgeKey: "chats" as const },
  { href: "/requests", icon: UserPlus, label: "الطلبات", badgeKey: "requests" as const },
  { href: "/notifications", icon: Bell, label: "إشعارات", badgeKey: "notifications" as const },
  { href: "/matches", icon: Heart, label: "مطابقات" },
  { href: "/profile", icon: User, label: "بروفايلي" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, loadUser, logout } = useAuthStore();
  const { unreadCount, loadNotifications, reset: resetNotifications } = useNotificationStore();
  const { conversations, totalUnread: chatUnread, loadConversations, reset: resetChat } = useChatStore();
  const myId = user?._id || user?.id;

  // Count pending requests (from others, not mine)
  const requestsCount = conversations.filter((c) => c.status === "pending" && c.creator !== myId).length;
  const { connected: socketConnected } = useSocket();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadUser().finally(() => setReady(true));
    loadNotifications();
    loadConversations();
  }, [loadUser, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-bg-secondary border-l border-border fixed right-0 top-0 bottom-0 z-40">
        {/* Logo */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <Link href="/chats">
              <Logo />
            </Link>
            <div className={cn("w-2 h-2 rounded-full", socketConnected ? "bg-success" : "bg-error animate-pulse")} title={socketConnected ? "متصل" : "غير متصل"} />
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-border">
          <Link
            href="/profile"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-bg-hover transition-colors"
          >
            <Avatar
              src={user?.profileImage}
              name={user?.name}
              size="md"
              isOnline
              isPremium={user?.isPremium}
            />
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">
                {user?.name || "مستخدم"}
              </p>
              <p className="text-xs text-text-muted truncate">
                {user?.email || ""}
              </p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "gradient-bg text-white shadow-lg shadow-accent-pink/20"
                    : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                )}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {(() => {
                  const count =
                    item.badgeKey === "notifications" ? unreadCount :
                    item.badgeKey === "chats" ? chatUnread :
                    item.badgeKey === "requests" ? requestsCount : 0;
                  return count > 0 ? (
                    <span className="mr-auto bg-error text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {count > 9 ? "9+" : count}
                    </span>
                  ) : null;
                })()}
              </Link>
            );
          })}

          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mt-2",
              pathname.startsWith("/settings")
                ? "gradient-bg text-white"
                : "text-text-secondary hover:bg-bg-hover"
            )}
          >
            <Settings size={20} />
            <span>الإعدادات</span>
          </Link>

          {!user?.isPremium && (
            <Link
              href="/premium"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-warning/10 text-warning hover:bg-warning/20 transition-all mt-4"
            >
              <Crown size={20} />
              <span>اشترك في Premium</span>
            </Link>
          )}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-border">
          <button
            onClick={() => {
              disconnectSocket();
              resetChat();
              resetNotifications();
              logout();
              router.push("/");
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-error/80 hover:bg-error/10 w-full transition-colors"
          >
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:mr-64 pb-20 lg:pb-0">{children}</main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative",
                  isActive ? "text-accent-pink" : "text-text-muted"
                )}
              >
                <item.icon size={22} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {(() => {
                  const count =
                    item.badgeKey === "notifications" ? unreadCount :
                    item.badgeKey === "chats" ? chatUnread :
                    item.badgeKey === "requests" ? requestsCount : 0;
                  return count > 0 ? (
                    <span className="absolute -top-0.5 right-1 bg-error text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {count > 9 ? "+" : count}
                    </span>
                  ) : null;
                })()}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
