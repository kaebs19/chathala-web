"use client";

import { useEffect } from "react";
import { Bell, CheckCheck, Heart, MessageCircle, Eye, UserPlus } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { useNotificationStore } from "@/stores/notificationStore";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, typeof Heart> = {
  like: Heart,
  match: Heart,
  message: MessageCircle,
  profile_view: Eye,
  conversation_request: UserPlus,
};

export default function NotificationsPage() {
  const { notifications, isLoading, unreadCount, loadNotifications, markRead, markAllRead } =
    useNotificationStore();

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-bg-secondary">
        <h1 className="text-xl font-black">الإشعارات</h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck size={16} />
            قراءة الكل
          </Button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-accent-pink border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <Bell size={48} className="text-text-muted/30 mb-4" />
            <h3 className="text-lg font-bold mb-2">لا توجد إشعارات</h3>
            <p className="text-text-muted text-sm">
              سيتم إخطارك عند وجود نشاط جديد
            </p>
          </div>
        ) : (
          notifications.map((notif) => {
            const Icon = typeIcons[notif.type] || Bell;
            return (
              <button
                key={notif._id}
                onClick={() => !notif.read && markRead(notif._id)}
                className={cn(
                  "flex items-start gap-3 p-4 w-full text-right hover:bg-bg-hover border-b border-border/50 transition-colors",
                  !notif.read && "bg-accent-pink/5"
                )}
              >
                <div className="relative">
                  <Avatar
                    src={notif.relatedUser?.profileImage}
                    name={notif.relatedUser?.name}
                    size="md"
                  />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-bg-card border border-border flex items-center justify-center">
                    <Icon size={12} className="text-accent-pink" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed">
                    {notif.body || notif.title || "إشعار جديد"}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {formatDate(notif.createdAt)}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-pink shrink-0 mt-2" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
