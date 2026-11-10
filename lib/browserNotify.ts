"use client";

/**
 * إشعارات المتصفح والموقع مفتوح (تبويب في الخلفية). لا Web Push بعد: الخادم يحفظ توكن إشعارات
 * واحداً لكل مستخدم (للجوال)، وتسجيل توكن ويب كان سيستبدل توكن iPhone — يحتاج تغيير خادم أولاً.
 * ⚠️ Safari/Chrome على iPhone بلا Notification — افحص 'Notification' in window قبل اللمس (درس لوحة التحكم).
 */
const KEY = "hala-browser-notify";

export function browserNotifySupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function browserNotifyEnabled() {
  if (!browserNotifySupported()) return false;
  try { return Notification.permission === "granted" && localStorage.getItem(KEY) !== "off"; } catch { return false; }
}

export async function enableBrowserNotify(): Promise<boolean> {
  if (!browserNotifySupported()) return false;
  const p = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
  try { localStorage.setItem(KEY, p === "granted" ? "on" : "off"); } catch {}
  return p === "granted";
}

export function disableBrowserNotify() {
  try { localStorage.setItem(KEY, "off"); } catch {}
}

export function showBrowserNotification(title: string, body: string, opts: { tag?: string; icon?: string; href?: string } = {}) {
  if (!browserNotifyEnabled() || document.visibilityState === "visible") return;
  try {
    const n = new Notification(title, { body, tag: opts.tag, icon: opts.icon || "/images/logo-192.png" });
    n.onclick = () => {
      window.focus();
      if (opts.href) window.location.assign(opts.href);
      n.close();
    };
  } catch { /* بعض المتصفحات تمنع الإنشاء خارج Service Worker */ }
}

/** عدّاد غير المقروء في عنوان التبويب */
export function setTitleBadge(n: number) {
  if (typeof document === "undefined") return;
  const base = document.title.replace(/^\(\d+\+?\)\s*/, "");
  document.title = n > 0 ? `(${n > 99 ? "99+" : n}) ${base}` : base;
}
