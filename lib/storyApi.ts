import { api } from "@/lib/api";
import { MOBILE } from "@/lib/config";

export const STORY_REACTIONS = ["❤️", "😍", "😂", "😮", "😢", "🔥", "👏"] as const;
export const STORY_TEXT_MAX = 250;

export interface Story {
  _id: string;
  kind: "image" | "text";
  text?: string;
  background?: number;
  imageUrl?: string | null;
  width?: number;
  height?: number;
  createdAt: string;
  expiresAt: string;
  // لصاحب القصة
  viewCount?: number;
  screenshotCount?: number;
  reactionCount?: number;
  held?: boolean;
  // للمشاهد
  viewed?: boolean;
  myReaction?: string | null;
}

export interface StoryOwner {
  _id: string;
  name: string;
  profileImage?: string | null;
  isPremium?: boolean;
  isVerified?: boolean;
  count: number;
  hasUnseen: boolean;
}

export interface StoryStatus { count: number; hasUnseen: boolean }

export interface StoryViewerRow {
  viewer: { _id: string; name: string; profileImage?: string | null; country?: string; isVerified?: boolean };
  viewedAt: string;
  screenshotAt?: string | null;
  reaction?: string | null;
}

export interface StoryViewersData {
  viewCount: number;
  screenshotCount: number;
  reactionCount: number;
  reactions: { emoji: string; count: number }[];
  screenshotters: StoryViewerRow[];
  viewers: StoryViewerRow[];
  isPremiumRequired: boolean;
}

const m = (p: string) => `${MOBILE}${p}`;

export const storyApi = {
  me: () => api<{ stories: Story[]; max: number; freeMax: number; premiumMax: number }>(m("/stories/me")),
  user: (id: string) => api<{ stories: Story[]; muted?: boolean }>(m(`/users/${id}/stories`)),
  feed: (limit = 30) => api<{ owners: StoryOwner[] }>(m(`/stories/feed?limit=${limit}`)),
  status: (userIds: string[]) => api<{ statuses: Record<string, StoryStatus> }>(m("/stories/status"), { body: { userIds } }),
  view: (id: string) => api<{ recorded: boolean }>(m(`/stories/${id}/view`), { method: "POST" }),
  react: (id: string, emoji: string | null) => api<{ reaction: string | null }>(m(`/stories/${id}/react`), { body: { emoji } }),
  viewers: (id: string) => api<StoryViewersData>(m(`/stories/${id}/viewers`)),
  remove: (id: string) => api(m(`/stories/${id}`), { method: "DELETE" }),
  mute: (userId: string) => api(m(`/stories/mute/${userId}`), { method: "POST" }),
  unmute: (userId: string) => api(m(`/stories/mute/${userId}`), { method: "DELETE" }),
  publishImage: (blob: Blob, opts: { caption?: string } = {}) => {
    const f = new FormData();
    f.append("image", blob, "story.jpg");
    if (opts.caption) f.append("caption", opts.caption);
    return api<{ story: Story; active: number; max: number }>(m("/stories"), { form: f });
  },
  publishText: (text: string, background: number) =>
    api<{ story: Story; active: number; max: number }>(m("/stories/text"), { body: { text, background } }),
  report: (reportedUser: string, storyId: string, reason: string, description?: string) =>
    api(m("/reports"), { body: { reportedUser, reason, description, storyId } }),
};
