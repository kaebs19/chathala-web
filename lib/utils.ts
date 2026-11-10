import { API_ORIGIN } from "@/lib/config";

export function cn(...classes: unknown[]): string {
  return classes.filter((c) => typeof c === "string" && c).join(" ");
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "الآن";
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  if (days < 7) return `منذ ${days} يوم`;
  return d.toLocaleDateString("ar-SA");
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * The API stores three renditions of every upload:
 *   thumb    150x150   ~2 KB
 *   medium   370x400   ~9 KB
 *   original 740x800   ~28 KB
 * It hands back whichever one it feels like — usually `original` — so ask for
 * the size actually being rendered instead of shipping 740px into a 40px slot.
 */
export type ImageVariant = "thumb" | "medium" | "original";

const VARIANT_SEGMENT = /\/uploads\/(thumb|medium|original)\//;

export function getImageUrl(path?: string, variant?: ImageVariant): string {
  if (!path) return "/images/default-avatar.svg";

  const url = path.startsWith("http")
    ? path
    : `${API_ORIGIN}/uploads/${path.replace(/^\/?(uploads\/)?/, "")}`;

  // Only rewrite URLs that already point at a rendition directory — legacy
  // `profile-images/`, `defaults/` and external hosts (Google avatars) have no
  // variants and must be left alone.
  if (!variant) return url;
  return url.replace(VARIANT_SEGMENT, `/uploads/${variant}/`);
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + "...";
}

/** العمر من تاريخ الميلاد (null إن أخفاه صاحبه) */
export function ageOf(birthDate?: string | null): number | null {
  if (!birthDate) return null;
  const a = getAge(birthDate);
  return Number.isFinite(a) && a > 0 && a < 120 ? a : null;
}

/** صورة المستخدم: profileImage أو أول صورة معرض */
export function userImage(u?: { profileImage?: string | null; photos?: unknown[] } | null, variant?: ImageVariant): string {
  const first = u?.photos?.[0] as string | { medium?: string; original?: string } | undefined;
  const fromPhotos = typeof first === "string" ? first : first?.medium || first?.original;
  const src = u?.profileImage || fromPhotos;
  return getImageUrl(src || undefined, variant);
}

/** كل صور المعرض كروابط */
export function photoUrls(u?: { profileImage?: string | null; photos?: unknown[] } | null): string[] {
  const list = (u?.photos || [])
    .map((p) => (typeof p === "string" ? p : (p as { original?: string; medium?: string })?.original || (p as { medium?: string })?.medium))
    .filter(Boolean) as string[];
  if (!list.length && u?.profileImage) list.push(u.profileImage);
  return list.map((x) => getImageUrl(x));
}

/** متصل الآن أو نشط خلال الساعة (كما في iOS: livePresenceDotStyle) */
export function isRecentlyActive(u?: { isOnline?: boolean; lastLogin?: string | null; lastSeen?: string | null } | null): boolean {
  if (!u) return false;
  if (u.isOnline) return true;
  const t = u.lastLogin || u.lastSeen;
  return !!t && Date.now() - new Date(t).getTime() < 60 * 60 * 1000;
}

export function lastSeenText(u?: { isOnline?: boolean; lastLogin?: string | null; lastSeen?: string | null } | null): string {
  if (!u) return "";
  if (u.isOnline) return "متصل الآن";
  const t = u.lastLogin || u.lastSeen;
  if (!t) return "";
  return `آخر ظهور ${formatDate(t)}`;
}

export function chatTime(date: string): string {
  const d = new Date(date);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return formatTime(date);
  const y = new Date(now); y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "أمس";
  if (now.getTime() - d.getTime() < 6 * 864e5) return d.toLocaleDateString("ar-SA", { weekday: "long" });
  return d.toLocaleDateString("ar-SA", { day: "numeric", month: "numeric" });
}

export function idOf(x: unknown): string {
  if (!x) return "";
  if (typeof x === "string") return x;
  const o = x as { _id?: string; id?: string };
  return o._id || o.id || "";
}
