"use client";
import { chatAPI } from "@/lib/api";
import { useChatStore } from "@/stores/chatStore";
import { toast } from "@/components/hala/Toast";
import { idOf } from "@/lib/utils";

/**
 * الرد على قصة (كما في iOS): محادثة مقبولة ← رسالة بـ storyId؛ وإلا طلب محادثة بـ storyId
 * (origin: story_reply، لا يُحسب من حدود الطلبات) ثم الرسالة عبر /messages/send بـ storyId — تمرّ على الفلاتر.
 */
export async function replyToStory(ownerId: string, storyId: string, text: string): Promise<boolean> {
  const chat = useChatStore.getState();
  let conv = chat.conversations.find((c) => c.participants?.some((p) => idOf(p) === ownerId) && c.status !== "rejected" && c.status !== "cancelled" && c.status !== "expired");
  let convId = conv?.status === "accepted" || (conv?.status === "pending" && conv.creator === chat.me) ? conv._id : null;
  if (!convId) {
    const r = await chatAPI.request(ownerId, undefined, storyId);
    const c = (r.data as { conversation?: { _id: string } } | undefined)?.conversation;
    if (!r.success || !c?._id) {
      toast.error(r.message || "تعذّر إرسال الرد");
      return false;
    }
    convId = String(c._id);
    conv = (await chat.fetchConversation(convId)) || undefined;
  }
  const s = await chatAPI.send(convId, text, undefined, storyId);
  if (!s.success) { toast.error(s.message || "تعذّر إرسال الرد"); return false; }
  chat.fetchConversation(convId);
  return true;
}
