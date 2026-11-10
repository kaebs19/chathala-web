"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Crown, Eye, Heart, MessageCircle, Settings, UserCircle2, Users } from "lucide-react";
import AppShell from "@/components/hala/AppShell";
import HalaLogo from "@/components/hala/HalaLogo";
import Avatar from "@/components/hala/Avatar";
import { Spinner } from "@/components/hala/Common";
import { useAuthStore, myId } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useBadges } from "@/stores/badgeStore";
import { usePresence } from "@/stores/presenceStore";
import { useRealtime } from "@/hooks/useRealtime";
import StoryHost from "@/components/stories/StoryHost";
import { replyToStory } from "@/lib/storyReply";
import { setTitleBadge } from "@/lib/browserNotify";
import { getToken } from "@/lib/api";
import { cn } from "@/lib/utils";

// التبويبات الأربعة كما في iOS (TabItem)
const TABS = [
  { href: "/explore", icon: Heart, label: "الاكتشاف", badge: null },
  { href: "/chats", icon: MessageCircle, label: "المحادثات", badge: "chats" },
  { href: "/notifications", icon: Bell, label: "الإشعارات", badge: "notifications" },
  { href: "/profile", icon: UserCircle2, label: "ملفي", badge: null },
] as const;

const EXTRA = [
  { href: "/friends", icon: Users, label: "الأصدقاء" },
  { href: "/visitors", icon: Eye, label: "الزوّار" },
  { href: "/settings", icon: Settings, label: "الإعدادات" },
];

function useBadgeCount(key: string | null) {
  const chats = useChatStore((s) => s.conversations.reduce((n, c) => n + (c.status === "accepted" || !c.status ? c.unreadCount || 0 : 0), 0));
  const requests = useChatStore((s) => s.conversations.filter((c) => c.status === "pending" && c.creator !== s.me).length);
  const notif = useBadges((s) => s.notifications);
  if (key === "chats") return chats + requests;
  if (key === "notifications") return notif;
  return 0;
}

function Count({ n, className }: { n: number; className?: string }) {
  if (!n) return null;
  return (
    <span className={cn("min-w-[18px] h-[18px] px-1 rounded-full bg-h-error text-white text-[10px] font-extrabold flex items-center justify-center", className)}>
      {n > 99 ? "99+" : n}
    </span>
  );
}

function SideLink({ href, icon: Icon, label, badge, active }: { href: string; icon: React.ElementType; label: string; badge?: string | null; active: boolean }) {
  const n = useBadgeCount(badge || null);
  return (
    <Link href={href} aria-current={active ? "page" : undefined}
      className={cn("flex items-center gap-3 h-12 px-4 rounded-xl text-[15px] font-bold transition",
        active ? "bg-h-primary/10 text-h-primary" : "text-h-text2 hover:bg-h-input hover:text-h-text")}>
      <Icon size={22} strokeWidth={active ? 2.4 : 2} />
      <span className="flex-1">{label}</span>
      <Count n={n} />
    </Link>
  );
}

function TabLink({ href, icon: Icon, label, badge, active }: { href: string; icon: React.ElementType; label: string; badge?: string | null; active: boolean }) {
  const n = useBadgeCount(badge || null);
  return (
    <Link href={href} aria-current={active ? "page" : undefined}
      className={cn("flex-1 flex flex-col items-center justify-center gap-0.5 h-full relative", active ? "text-h-primary" : "text-h-text2")}>
      <span className="relative">
        <Icon size={25} strokeWidth={active ? 2.4 : 1.9} className={active ? "fill-h-primary/15" : ""} />
        <Count n={n} className="absolute -top-1.5 -end-2.5" />
      </span>
      <span className="text-[10.5px] font-bold">{label}</span>
    </Link>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, ready, loadUser } = useAuthStore();
  const setMe = useChatStore((s) => s.setMe);
  const loadConversations = useChatStore((s) => s.loadConversations);
  const connected = usePresence((s) => s.connected);
  const hasToken = typeof window !== "undefined" && !!getToken();

  useEffect(() => {
    if (!getToken()) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    loadUser().then((u) => {
      if (!u && !getToken()) router.replace("/login");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const id = myId(user);
  useEffect(() => {
    if (!id) return;
    setMe(id);
    loadConversations();
    useBadges.getState().refresh();
    const onFocus = () => { useBadges.getState().refresh(); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [id, setMe, loadConversations]);

  useRealtime(!!id);
  const unreadTotal = useChatStore((s) => s.conversations.reduce((n, c) => n + (c.isMuted ? 0 : c.unreadCount || 0), 0));
  useEffect(() => { setTitleBadge(unreadTotal); }, [unreadTotal, pathname]);

  // شاشة كاملة بلا شريط تبويب على الجوال: غرفة المحادثة وشاشات التحرير
  const immersive = /^\/chats\/[^/]+/.test(pathname) || pathname.startsWith("/profile/edit");
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  if (!user && (!ready || hasToken)) {
    return (
      <AppShell>
        <div className="min-h-dvh flex flex-col items-center justify-center gap-5">
          <HalaLogo size={56} />
          <Spinner />
        </div>
      </AppShell>
    );
  }
  if (!user) return <AppShell>{null}</AppShell>;

  return (
    <AppShell>
      <div className="min-h-dvh lg:flex">
        {/* شريط جانبي — سطح المكتب */}
        <aside className="hidden lg:flex flex-col w-[264px] shrink-0 h-dvh sticky top-0 border-e border-h-border bg-h-card px-3 py-4">
          <Link href="/explore" className="px-3 mb-5 flex items-center justify-between">
            <HalaLogo size={38} />
            <span className={cn("w-2 h-2 rounded-full", connected ? "bg-[#22C55E]" : "bg-h-text2/40")} title={connected ? "متصل" : "غير متصل"} />
          </Link>
          <nav className="flex flex-col gap-1" aria-label="التنقّل">
            {TABS.map((t) => <SideLink key={t.href} {...t} active={isActive(t.href)} />)}
            <div className="h-px bg-h-divider my-2 mx-3" />
            {EXTRA.map((t) => <SideLink key={t.href} {...t} active={isActive(t.href)} />)}
          </nav>
          {!user.isPremium && (
            <Link href="/premium" className="mt-4 mx-1 rounded-2xl p-4 bg-gradient-to-br from-[#FFD600]/20 to-[#FF8C00]/15 border border-h-gold/40">
              <div className="flex items-center gap-2 font-extrabold text-h-text"><Crown size={20} className="text-h-gold" /> هلا+</div>
              <p className="text-xs text-h-text2 mt-1 leading-5">اعرف من أعجب بك، وزوّارك، ومزايا أكثر</p>
            </Link>
          )}
          <Link href="/profile" className="mt-auto flex items-center gap-3 p-2 rounded-xl hover:bg-h-input">
            <Avatar src={user.profileImage} name={user.name} size="sm" premium={user.isPremium} />
            <span className="min-w-0">
              <span className="block text-sm font-bold truncate">{user.name}</span>
              <span className="block text-xs text-h-text2 truncate">{user.isPremium ? "مشترك هلا+" : "عرض الملف"}</span>
            </span>
          </Link>
        </aside>

        <main className={cn("flex-1 min-w-0", !immersive && "pb-[calc(64px+env(safe-area-inset-bottom))] lg:pb-0")}>{children}</main>

        <StoryHost onReply={(owner, story, text) => replyToStory(owner._id, story._id, text)} />

        {/* شريط التبويب — الجوال */}
        {!immersive && (
          <nav aria-label="التبويبات" className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-h-card/90 backdrop-blur-xl border-t border-h-border pb-[env(safe-area-inset-bottom)]">
            <div className="flex h-16 max-w-lg mx-auto">
              {TABS.map((t) => <TabLink key={t.href} {...t} active={isActive(t.href)} />)}
            </div>
          </nav>
        )}
      </div>
    </AppShell>
  );
}
