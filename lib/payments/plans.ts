import type { Plan } from "./types";

// ⚠️ الأسعار هنا للعرض فقط ويحدّدها المالك. الأسبوعي بلا سعر بعد (null = مخفي).
//    أسعار App Store تأتي من StoreKit ولا تُنسخ هنا.
export const PLANS: Plan[] = [
  { id: "weekly", name: "أسبوعي", priceSAR: null, periodLabel: "أسبوع", days: 7, superLikesPerDay: 1 },
  { id: "monthly", name: "شهري", priceSAR: 29.99, periodLabel: "شهر", days: 30, superLikesPerDay: 3, badge: "الأكثر اختياراً" },
  { id: "quarterly", name: "ربع سنوي", priceSAR: 59.99, periodLabel: "3 أشهر", days: 90, superLikesPerDay: 5, badge: "وفّر 33%" },
];

// جدول المقارنة (PlanComparisonView في iOS)
export const COMPARISON: { name: string; free: string; weekly: string; monthly: string; quarterly: string }[] = [
  { name: "المحادثات", free: "3 يومياً", weekly: "∞", monthly: "∞", quarterly: "∞" },
  { name: "الإعجابات", free: "10 يومياً", weekly: "∞", monthly: "∞", quarterly: "∞" },
  { name: "سوبر لايك", free: "—", weekly: "1", monthly: "3", quarterly: "5" },
  { name: "بلا إعلانات", free: "—", weekly: "✓", monthly: "✓", quarterly: "✓" },
  { name: "من أعجب بك", free: "—", weekly: "✓", monthly: "✓", quarterly: "✓" },
  { name: "وضع التخفّي", free: "—", weekly: "—", monthly: "✓", quarterly: "✓" },
  { name: "القراءة الخفية", free: "—", weekly: "✓", monthly: "✓", quarterly: "✓" },
  { name: "صور المعرض", free: "—", weekly: "✓", monthly: "✓", quarterly: "✓" },
];
