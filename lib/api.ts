import { API_BASE, MOBILE } from "@/lib/config";
import { logError } from "@/lib/logger";

export type ApiResult<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  errors?: { field?: string; message: string }[];
  status: number;
  [k: string]: unknown;
};

type RequestOptions = {
  method?: string;
  body?: unknown;
  form?: FormData;
  signal?: AbortSignal;
  /** لا تحوّل لصفحة الدخول عند 401 (لطلبات الدخول نفسها) */
  noAuthRedirect?: boolean;
};

const TOKEN = "token";
const REFRESH = "refreshToken";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(TOKEN); } catch { return null; }
}

export function setTokens(token: string, refreshToken?: string | null) {
  localStorage.setItem(TOKEN, token);
  if (refreshToken) localStorage.setItem(REFRESH, refreshToken);
  document.documentElement.dataset.auth = "in";
}

export function clearTokens() {
  try {
    localStorage.removeItem(TOKEN);
    localStorage.removeItem(REFRESH);
    localStorage.removeItem("user");
    document.documentElement.dataset.auth = "out";
  } catch { /* storage blocked */ }
}

let refreshing: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const rt = localStorage.getItem(REFRESH);
    if (!rt) return false;
    try {
      const res = await fetch(`${API_BASE}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: rt }),
      });
      if (!res.ok) return false;
      const j = await res.json();
      const token = j.token || j.data?.token;
      if (!token) return false;
      setTokens(token, j.refreshToken || j.data?.refreshToken);
      return true;
    } catch (e) {
      logError("api:refresh", e);
      return false;
    }
  })();
  try { return await refreshing; } finally { refreshing = null; }
}

async function raw(endpoint: string, opts: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = { "X-Client-Platform": "web" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let body: BodyInit | undefined;
  if (opts.form) body = opts.form;
  else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }
  return fetch(`${API_BASE}${endpoint}`, {
    method: opts.method || (body ? "POST" : "GET"),
    headers,
    body,
    signal: opts.signal,
  });
}

/** نداء API: لا يرمي عند أخطاء HTTP — يعيد { success:false, message, status }. */
export async function api<T = unknown>(endpoint: string, opts: RequestOptions = {}): Promise<ApiResult<T>> {
  try {
    let res = await raw(endpoint, opts);
    if (res.status === 401 && getToken() && !opts.noAuthRedirect) {
      if (await refreshToken()) res = await raw(endpoint, opts);
      if (res.status === 401) {
        clearTokens();
        if (typeof window !== "undefined" && !location.pathname.startsWith("/login")) {
          location.href = `/login?next=${encodeURIComponent(location.pathname)}`;
        }
      }
    }
    let json: Record<string, unknown> = {};
    try { json = await res.json(); } catch { /* empty body */ }
    return {
      ...json,
      success: res.ok && json.success !== false,
      status: res.status,
      message: (json.message as string) || (res.ok ? undefined : defaultError(res.status)),
    } as ApiResult<T>;
  } catch (e) {
    if ((e as Error)?.name === "AbortError") throw e;
    logError(`api:${endpoint}`, e);
    return { success: false, status: 0, message: "تعذّر الاتصال — تحقّق من الإنترنت" };
  }
}

function defaultError(status: number) {
  if (status === 429) return "طلبات كثيرة — حاول بعد قليل";
  if (status === 403) return "غير مسموح";
  if (status === 404) return "غير موجود";
  if (status >= 500) return "خطأ في الخادم — حاول لاحقاً";
  return "حدث خطأ";
}

const m = (p: string) => `${MOBILE}${p}`;

// ─────────────────────────────── المصادقة والحساب
export const authAPI = {
  login: (email: string, password: string) =>
    api("/auth/login", { body: { email, password, platform: "web" }, noAuthRedirect: true }),
  register: (d: { name: string; email: string; password: string }) =>
    api("/auth/register", { body: { ...d, platform: "web" }, noAuthRedirect: true }),
  google: (accessToken: string, info: { sub: string; email: string; name?: string; picture?: string }) =>
    api("/auth/google", { body: { idToken: accessToken, platform: "web", googleUserInfo: info }, noAuthRedirect: true }),
  apple: (d: Record<string, unknown>) =>
    api("/auth/apple", { body: { ...d, platform: "web" }, noAuthRedirect: true }),
  me: () => api("/auth/me"),
  updateProfile: (d: Record<string, unknown>) => api("/auth/update-profile", { method: "PUT", body: d }),
  uploadProfileImage: (file: File) => {
    const f = new FormData(); f.append("profileImage", file);
    return api("/auth/upload-profile-image", { method: "PUT", form: f });
  },
  deleteProfileImage: () => api("/auth/profile-image", { method: "DELETE" }),
  uploadGalleryPhoto: (file: File) => {
    const f = new FormData(); f.append("galleryPhoto", file);
    return api("/auth/upload-gallery-photo", { method: "POST", form: f });
  },
  deleteGalleryPhoto: (order: number) => api(`/auth/gallery-photo/${order}`, { method: "DELETE" }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api("/auth/change-password", { method: "PUT", body: { currentPassword, newPassword } }),
  hideAccount: () => api("/auth/hide-account", { method: "POST" }),
  deleteAccount: (password?: string) => api("/auth/delete-account", { method: "DELETE", body: password ? { password } : {} }),
  carryover: () => api("/auth/delete-account/carryover"),
  forgotPassword: (email: string) => api("/auth/forgot-password", { body: { email }, noAuthRedirect: true }),
  resetPassword: (email: string, resetToken: string, newPassword: string) =>
    api("/auth/reset-password", { body: { email, resetToken, newPassword }, noAuthRedirect: true }),
};

// ─────────────────────────────── الاكتشاف
export const exploreAPI = {
  cards: (q: Record<string, string | number | undefined> = {}) => {
    const p = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => { if (v !== undefined && v !== "") p.set(k, String(v)); });
    return api(`/swipes/cards?${p}`);
  },
  /** type: like | dislike (الخادم يقرأ "type" — كان الموقع يرسل "action" فيُرفض كل سحب) */
  swipe: (userId: string, type: "like" | "dislike") => api("/swipes", { body: { userId, type } }),
  superLike: (userId: string) => api(m("/super-like"), { body: { userId } }),
  superLikeRemaining: () => api(m("/super-like/remaining")),
  unlike: (userId: string) => api(`/swipes/${userId}`, { method: "DELETE" }),
  likesMe: () => api("/swipes/likes-me"),
  myLikes: () => api("/swipes/my-likes"),
};

// ─────────────────────────────── المحادثات
export const chatAPI = {
  conversations: (q = "all=true") => api(m(`/conversations?${q}`)),
  conversation: (id: string) => api(m(`/conversations/${id}`)),
  messages: (id: string, before?: string | null) =>
    api(m(`/messages/${id}?limit=40${before ? `&before=${before}` : ""}`)),
  send: (conversationId: string, content: string, replyTo?: string, storyId?: string) =>
    api(m("/messages/send"), { body: { conversationId, content, type: "text", ...(replyTo ? { replyTo } : {}), ...(storyId ? { storyId } : {}) } }),
  sendAudio: (conversationId: string, file: File, duration: number, waveform: number[]) => {
    const f = new FormData();
    f.append("audio", file, file.name);
    f.append("conversationId", conversationId);
    f.append("duration", String(duration));
    f.append("waveform", JSON.stringify(waveform));
    return api(m("/messages/send-audio"), { form: f });
  },
  sendVideo: (conversationId: string, file: File, duration: number, mode: "once" | "24h", dims: { width: number; height: number }) => {
    const f = new FormData();
    f.append("video", file, file.name);
    f.append("conversationId", conversationId);
    f.append("duration", String(duration));
    f.append("mode", mode);
    f.append("width", String(dims.width));
    f.append("height", String(dims.height));
    return api(m("/messages/send-video"), { form: f });
  },
  sendSticker: (conversationId: string, stickerId: string) =>
    api(m("/messages/send-sticker"), { body: { conversationId, stickerId } }),
  sendImage: (conversationId: string, file: Blob, caption = "", dims?: { width: number; height: number }, disappearingSeconds?: number) => {
    const f = new FormData();
    if (disappearingSeconds) f.append("disappearingDuration", String(disappearingSeconds));
    f.append("image", file, "photo.jpg");
    f.append("conversationId", conversationId);
    f.append("imageSource", "gallery");
    if (caption) f.append("caption", caption);
    if (dims) { f.append("width", String(dims.width)); f.append("height", String(dims.height)); }
    return api(m("/messages/send-image"), { form: f });
  },
  markRead: (id: string) => api(m(`/conversations/${id}/read`), { method: "PUT" }),
  listened: (messageId: string) => api(m(`/messages/${messageId}/listened`), { method: "POST" }),
  request: (targetUserId: string, initialMessage?: string, storyId?: string) =>
    api(m("/conversations/request"), { body: { targetUserId, ...(initialMessage ? { initialMessage } : {}), ...(storyId ? { storyId } : {}) } }),
  accept: (id: string) => api(m(`/conversations/${id}/accept`), { method: "PUT" }),
  reject: (id: string) => api(m(`/conversations/${id}/reject`), { method: "PUT" }),
  cancel: (id: string) => api(m(`/conversations/${id}/cancel`), { method: "PUT" }),
  remove: (id: string) => api(m(`/conversations/${id}`), { method: "DELETE" }),
  mute: (id: string) => api(m(`/conversations/${id}/mute`), { method: "PUT" }),
  react: (messageId: string, emoji: string) => api(m(`/messages/${messageId}/react`), { body: { emoji } }),
  deleteMessage: (messageId: string) => api(m(`/messages/${messageId}`), { method: "DELETE" }),
  sentRequests: () => api(m("/conversations/sent-requests")),
};

// ─────────────────────────────── المستخدمون
export const userAPI = {
  profile: (id: string) => api(m(`/users/${id}/profile`)),
  recordVisit: (viewedUserId: string) => api(m("/profile-views"), { body: { viewedUserId } }),
  visitors: (page = 1) => api(m(`/profile-views?page=${page}`)),
  search: (q: string) => api(m(`/users/search?q=${encodeURIComponent(q)}`)),
  report: (reportedUser: string, reason: string, description?: string) =>
    api(m("/reports"), { body: { reportedUser, reason, description } }),
};

// ─────────────────────────────── الإشعارات
export const notificationAPI = {
  list: (page = 1) => api(m(`/notifications?page=${page}`)),
  read: (id: string) => api(m(`/notifications/${id}/read`), { method: "PUT" }),
  readAll: () => api(m("/notifications/read-all"), { method: "PUT" }),
  unreadCount: () => api(m("/notifications/unread-count")),
  prefs: () => api(m("/notifications/preferences")),
  setPrefs: (d: Record<string, unknown>) => api(m("/notifications/preferences"), { method: "PATCH", body: d }),
};

// ─────────────────────────────── الخصوصية
export const privacyAPI = {
  settings: () => api(m("/privacy/settings")),
  patch: (key: string, body: Record<string, unknown>) => api(m(`/privacy/${key}`), { method: "PATCH", body }),
  legacyUpdate: (d: Record<string, unknown>) => api("/privacy/settings", { method: "PUT", body: d }),
  blocked: () => api("/privacy/blocked"),
  block: (userId: string) => api(`/privacy/block/${userId}`, { method: "POST" }),
  unblock: (userId: string) => api(`/privacy/unblock/${userId}`, { method: "DELETE" }),
};

// ─────────────────────────────── هلا+
export const premiumAPI = {
  status: () => api(m("/subscription/status")),
  verifyExpiration: () => api(m("/subscription/verify-expiration"), { method: "POST" }),
};

export const bootstrapAPI = { get: () => api(m("/app/bootstrap")) };

// ─────────────────────────────── الملصقات
export const stickerAPI = { list: () => api(m("/stickers")) };

// ─────────────────────────────── الأصدقاء
export type FriendStatus = "none" | "friends" | "pending_sent" | "pending_received";
export const friendAPI = {
  bootstrap: () => api(m("/friends/bootstrap")),
  list: () => api(m("/friends")),
  requests: () => api(m("/friends/requests")),
  suggestions: () => api(m("/friends/suggestions")),
  status: (userId: string) => api(m(`/friends/status/${userId}`)),
  request: (userId: string) => api(m("/friends/request"), { body: { userId } }),
  accept: (friendshipId: string) => api(m(`/friends/requests/${friendshipId}/accept`), { method: "POST" }),
  decline: (friendshipId: string) => api(m(`/friends/requests/${friendshipId}/decline`), { method: "POST" }),
  remove: (userId: string) => api(m(`/friends/${userId}`), { method: "DELETE" }),
};
