"use client";

import StoryViewer, { type StoryReplyHandler } from "@/components/stories/StoryViewer";
import StoryComposer from "@/components/stories/StoryComposer";
import { useStoryStore } from "@/stores/storyStore";

/** يعرض العارض والمحرّر فوق أي شاشة من حالة storyStore */
export default function StoryHost({ onReply }: { onReply?: StoryReplyHandler }) {
  const { viewer, closeViewer, composerOpen, closeComposer } = useStoryStore();
  return (
    <>
      {viewer && (
        <StoryViewer key={`${viewer.ownerIds.join(",")}:${viewer.startIndex}`} ownerIds={viewer.ownerIds}
          startIndex={viewer.startIndex} mine={viewer.mine} onClose={closeViewer} onReply={onReply} />
      )}
      <StoryComposer open={composerOpen} onClose={closeComposer} />
    </>
  );
}
