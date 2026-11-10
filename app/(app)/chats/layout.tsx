"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import ConversationList from "@/components/chat/ConversationList";
import { EmptyState } from "@/components/hala/Common";
import { cn } from "@/lib/utils";

/** سطح المكتب: القائمة والمحادثة جنباً إلى جنب. الجوال: إحداهما. */
export default function ChatsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const inRoom = /^\/chats\/[^/]+/.test(pathname);
  return (
    <div className="lg:flex lg:h-dvh">
      <div className={cn("lg:w-[360px] xl:w-[380px] lg:shrink-0 lg:border-e lg:border-h-border lg:h-dvh lg:bg-h-card",
        inRoom ? "hidden lg:block" : "h-[calc(100dvh-64px-env(safe-area-inset-bottom))] lg:h-dvh")}>
        <ConversationList />
      </div>
      <div className={cn("flex-1 min-w-0", inRoom ? "block" : "hidden lg:flex items-center justify-center")}>
        {inRoom ? children : <EmptyState icon={MessageCircle} title="اختر محادثة" text="محادثاتك تظهر في القائمة، والرسائل تصل فوراً." />}
      </div>
    </div>
  );
}
