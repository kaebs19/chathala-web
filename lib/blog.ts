import type { Locale } from "@/lib/i18n";

/** ملف مقال واحد بلغة واحدة: content/blog/<slug>.<locale>.ts */
export interface ArticleDoc {
  title: string;
  /** وصف meta: جملة واحدة 120–160 حرفاً */
  description: string;
  /** Markdown مصغّر: ## و### وفقرات و- و1. و> و**غامق** و[نصّ](/رابط) — يرسمه ArticleBody */
  body: string;
}

export type CategoryKey = "safety" | "conversation" | "profile" | "privacy" | "wellbeing";

export const CATEGORIES: Record<CategoryKey, { ar: string; en: string; color: string }> = {
  safety: { ar: "الأمان", en: "Safety", color: "#EF4444" },
  conversation: { ar: "فنّ المحادثة", en: "Conversation", color: "#E91E8C" },
  profile: { ar: "الملف الشخصي", en: "Profile", color: "#8B5CF6" },
  privacy: { ar: "الخصوصية", en: "Privacy", color: "#0EA5E9" },
  wellbeing: { ar: "علاقات وعادات", en: "Wellbeing", color: "#10B981" },
};

export interface ArticleMeta {
  slug: string;
  category: CategoryKey;
  /** تاريخ النشر ISO */
  date: string;
  /** آخر تعديل ISO (إن اختلف) */
  updated?: string;
}

/** تقدير وقت القراءة بالدقائق (≈200 كلمة/دقيقة) */
export function readMinutes(body: string): number {
  return Math.max(2, Math.round(body.trim().split(/\s+/).length / 200));
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-US", {
    year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  }).format(new Date(iso));
}
