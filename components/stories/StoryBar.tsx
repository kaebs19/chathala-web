"use client";

import { useEffect } from "react";
import { Plus } from "lucide-react";
import Avatar from "@/components/hala/Avatar";
import StoryRing from "@/components/stories/StoryRing";
import { useStoryStore } from "@/stores/storyStore";
import { useAuthStore, myId } from "@/stores/authStore";

/** شريط القصص: «قصتك» ثم أصحاب القصص بترتيب الخادم (GET /stories/feed) */
export default function StoryBar() {
  const user = useAuthStore((s) => s.user);
  const { feed, mine, refreshFeed, refreshMine, openViewer, openComposer } = useStoryStore();
  const me = myId(user);

  useEffect(() => { refreshFeed(); refreshMine(); }, [refreshFeed, refreshMine]);

  const others = feed.filter((o) => o._id !== me);
  if (!user) return null;

  return (
    <div className="flex gap-3 overflow-x-auto h-no-scrollbar px-3 sm:px-5 py-2" aria-label="القصص">
      <div className="flex flex-col items-center gap-1 w-[72px] shrink-0">
        {mine.length ? (
          <StoryRing src={user.profileImage} name={user.name} size="lg" count={mine.length} unseen
            label="قصتك" onClick={() => openViewer({ ownerIds: [me], startIndex: 0, mine: true })} />
        ) : (
          <button type="button" onClick={openComposer} aria-label="قصة جديدة" className="relative p-[7px]">
            <Avatar src={user.profileImage} name={user.name} size="lg" />
            <span className="absolute bottom-1 end-1 w-6 h-6 rounded-full h-gradient text-white flex items-center justify-center border-2 border-h-bg">
              <Plus size={14} strokeWidth={3} />
            </span>
          </button>
        )}
        <span className="text-[11px] font-bold text-h-text2 truncate max-w-full">قصتك</span>
      </div>
      {others.map((o, i) => (
        <div key={o._id} className="flex flex-col items-center gap-1 w-[72px] shrink-0">
          <StoryRing src={o.profileImage} name={o.name} size="lg" count={o.count} unseen={o.hasUnseen}
            onClick={() => openViewer({ ownerIds: others.map((x) => x._id), startIndex: i })} />
          <span className={`text-[11px] truncate max-w-full ${o.hasUnseen ? "font-extrabold text-h-text" : "font-semibold text-h-text2"}`}>{o.name}</span>
        </div>
      ))}
    </div>
  );
}
