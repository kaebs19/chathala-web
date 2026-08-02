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
    : `${(process.env.NEXT_PUBLIC_API_URL || "https://matchhala.chathala.com").replace("/api", "")}/uploads/${path}`;

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
