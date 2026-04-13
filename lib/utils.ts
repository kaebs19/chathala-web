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

export function getImageUrl(path?: string): string {
  if (!path) return "/images/default-avatar.svg";
  if (path.startsWith("http")) return path;
  const base =
    process.env.NEXT_PUBLIC_API_URL || "https://matchhala.chathala.com";
  return `${base.replace("/api", "")}/uploads/${path}`;
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + "...";
}
