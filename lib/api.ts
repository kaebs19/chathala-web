// API requests go through Next.js rewrite proxy → no CORS issues
const API_BASE = "/api";

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  isFormData?: boolean;
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function removeToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

export async function api<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, isFormData = false } = options;

  const token = getToken();
  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  if (!isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body) {
    config.body = isFormData ? (body as FormData) : JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);

  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      requestHeaders["Authorization"] = `Bearer ${getToken()}`;
      const retryRes = await fetch(`${API_BASE}${endpoint}`, {
        ...config,
        headers: requestHeaders,
      });
      return retryRes.json();
    }
    removeToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  return res.json();
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export const authAPI = {
  login: (email: string, password: string) =>
    api("/auth/login", { method: "POST", body: { email, password } }),
  register: (data: {
    name: string;
    email: string;
    password: string;
    birthDate: string;
    gender: string;
  }) => api("/auth/register", { method: "POST", body: data }),
  me: () => api("/auth/me"),
  forgotPassword: (email: string) =>
    api("/auth/forgot-password", { method: "POST", body: { email } }),
  updateProfile: (data: Partial<{ name: string; bio: string; interests: string[] }>) =>
    api("/auth/update-profile", { method: "PUT", body: data }),
  uploadProfileImage: (formData: FormData) =>
    api("/auth/upload-profile-image", {
      method: "PUT",
      body: formData,
      isFormData: true,
    }),
};

export const chatAPI = {
  getConversations: (page = 1) =>
    api(`/v2/mobile/conversations?page=${page}`),
  getMessages: (conversationId: string, page = 1) =>
    api(`/v2/mobile/messages/${conversationId}?page=${page}`),
  sendMessage: (conversationId: string, content: string) =>
    api("/v2/mobile/messages/send", {
      method: "POST",
      body: { conversationId, content },
    }),
  sendRequest: (userId: string, message?: string) =>
    api("/v2/mobile/conversations/request", {
      method: "POST",
      body: { userId, message },
    }),
  acceptRequest: (conversationId: string) =>
    api(`/v2/mobile/conversations/${conversationId}/accept`, { method: "PUT" }),
  rejectRequest: (conversationId: string) =>
    api(`/v2/mobile/conversations/${conversationId}/reject`, { method: "PUT" }),
  deleteConversation: (conversationId: string) =>
    api(`/v2/mobile/conversations/${conversationId}`, { method: "DELETE" }),
};

export const exploreAPI = {
  getCards: () => api("/swipes/cards"),
  swipe: (userId: string, action: "like" | "dislike" | "superlike") =>
    api("/swipes", { method: "POST", body: { userId, action } }),
  getLikesMe: () => api("/swipes/likes-me"),
  getMyLikes: () => api("/swipes/my-likes"),
};

export const notificationAPI = {
  getNotifications: (page = 1) =>
    api(`/v2/mobile/notifications?page=${page}`),
  markRead: (id: string) =>
    api(`/v2/mobile/notifications/${id}/read`, { method: "PUT" }),
  markAllRead: () =>
    api("/v2/mobile/notifications/read-all", { method: "PUT" }),
};

export const matchAPI = {
  getMatches: () => api("/matches"),
  deleteMatch: (id: string) => api(`/matches/${id}`, { method: "DELETE" }),
};

export const userAPI = {
  getProfile: (userId: string) => api(`/users/${userId}`),
};

export const settingsAPI = {
  getPrivacyPolicy: () => api("/settings/privacy-policy"),
  getTerms: () => api("/settings/terms"),
  getAbout: () => api("/settings/about"),
  getContactUs: () => api("/settings/contact-us"),
};

export const privacyAPI = {
  getSettings: () => api("/privacy/settings"),
  updateSettings: (data: Record<string, unknown>) =>
    api("/privacy/settings", { method: "PUT", body: data }),
  getBlocked: () => api("/privacy/blocked"),
  blockUser: (userId: string) =>
    api(`/privacy/block/${userId}`, { method: "POST" }),
  unblockUser: (userId: string) =>
    api(`/privacy/unblock/${userId}`, { method: "DELETE" }),
};
