// فهرس المقالات: كل مقال ملفّان <slug>.ar.ts و<slug>.en.ts (انظر WRITING_BRIEF.md).
// لإضافة مقال: اكتب الملفّين ثم أضف استيراده وصفّه هنا — يظهر تلقائياً في /blog و/en/blog وsitemap.
import type { ArticleDoc, ArticleMeta } from "@/lib/blog";
import type { Locale } from "@/lib/i18n";
import ar1 from "./online-dating-safety-basics.ar";
import en1 from "./online-dating-safety-basics.en";
import ar2 from "./romance-scam-warning-signs.ar";
import en2 from "./romance-scam-warning-signs.en";
import ar3 from "./why-stay-in-app.ar";
import en3 from "./why-stay-in-app.en";
import ar4 from "./spot-fake-profiles.ar";
import en4 from "./spot-fake-profiles.en";
import ar5 from "./online-blackmail-what-to-do.ar";
import en5 from "./online-blackmail-what-to-do.en";
import ar6 from "./first-meeting-safety.ar";
import en6 from "./first-meeting-safety.en";
import ar7 from "./when-to-block-and-report.ar";
import en7 from "./when-to-block-and-report.en";
import ar8 from "./how-to-start-a-conversation.ar";
import en8 from "./how-to-start-a-conversation.en";
import ar9 from "./first-message-examples.ar";
import en9 from "./first-message-examples.en";
import ar10 from "./keep-the-conversation-going.ar";
import en10 from "./keep-the-conversation-going.en";
import ar11 from "./questions-to-get-to-know-someone.ar";
import en11 from "./questions-to-get-to-know-someone.en";
import ar12 from "./chat-games-to-break-the-ice.ar";
import en12 from "./chat-games-to-break-the-ice.en";
import ar13 from "./voice-message-etiquette.ar";
import en13 from "./voice-message-etiquette.en";
import ar14 from "./no-reply-and-rejection.ar";
import en14 from "./no-reply-and-rejection.en";
import ar15 from "./chat-mistakes-to-avoid.ar";
import en15 from "./chat-mistakes-to-avoid.en";
import ar16 from "./write-a-great-bio.ar";
import en16 from "./write-a-great-bio.en";
import ar17 from "./choose-profile-photos.ar";
import en17 from "./choose-profile-photos.en";
import ar18 from "./honest-profile-matters.ar";
import en18 from "./honest-profile-matters.en";
import ar19 from "./protect-your-privacy-in-chat-apps.ar";
import en19 from "./protect-your-privacy-in-chat-apps.en";
import ar20 from "./what-not-to-share-online.ar";
import en20 from "./what-not-to-share-online.en";
import ar21 from "./disappearing-photos-explained.ar";
import en21 from "./disappearing-photos-explained.en";
import ar22 from "./online-friendships-that-last.ar";
import en22 from "./online-friendships-that-last.en";
import ar23 from "./shy-in-chat-tips.ar";
import en23 from "./shy-in-chat-tips.en";
import ar24 from "./healthy-chat-habits.ar";
import en24 from "./healthy-chat-habits.en";

export type Article = ArticleMeta & Record<Locale, ArticleDoc>;

export const ARTICLES: Article[] = [
  { slug: "online-dating-safety-basics", category: "safety", date: "2026-11-13", ar: ar1, en: en1 },
  { slug: "romance-scam-warning-signs", category: "safety", date: "2026-11-13", ar: ar2, en: en2 },
  { slug: "why-stay-in-app", category: "safety", date: "2026-11-13", ar: ar3, en: en3 },
  { slug: "spot-fake-profiles", category: "safety", date: "2026-11-13", ar: ar4, en: en4 },
  { slug: "online-blackmail-what-to-do", category: "safety", date: "2026-11-13", ar: ar5, en: en5 },
  { slug: "first-meeting-safety", category: "safety", date: "2026-11-13", ar: ar6, en: en6 },
  { slug: "when-to-block-and-report", category: "safety", date: "2026-11-13", ar: ar7, en: en7 },
  { slug: "how-to-start-a-conversation", category: "conversation", date: "2026-11-13", ar: ar8, en: en8 },
  { slug: "first-message-examples", category: "conversation", date: "2026-11-13", ar: ar9, en: en9 },
  { slug: "keep-the-conversation-going", category: "conversation", date: "2026-11-13", ar: ar10, en: en10 },
  { slug: "questions-to-get-to-know-someone", category: "conversation", date: "2026-11-13", ar: ar11, en: en11 },
  { slug: "chat-games-to-break-the-ice", category: "conversation", date: "2026-11-13", ar: ar12, en: en12 },
  { slug: "voice-message-etiquette", category: "conversation", date: "2026-11-13", ar: ar13, en: en13 },
  { slug: "no-reply-and-rejection", category: "conversation", date: "2026-11-13", ar: ar14, en: en14 },
  { slug: "chat-mistakes-to-avoid", category: "conversation", date: "2026-11-13", ar: ar15, en: en15 },
  { slug: "write-a-great-bio", category: "profile", date: "2026-11-13", ar: ar16, en: en16 },
  { slug: "choose-profile-photos", category: "profile", date: "2026-11-13", ar: ar17, en: en17 },
  { slug: "honest-profile-matters", category: "profile", date: "2026-11-13", ar: ar18, en: en18 },
  { slug: "protect-your-privacy-in-chat-apps", category: "privacy", date: "2026-11-13", ar: ar19, en: en19 },
  { slug: "what-not-to-share-online", category: "privacy", date: "2026-11-13", ar: ar20, en: en20 },
  { slug: "disappearing-photos-explained", category: "privacy", date: "2026-11-13", ar: ar21, en: en21 },
  { slug: "online-friendships-that-last", category: "wellbeing", date: "2026-11-13", ar: ar22, en: en22 },
  { slug: "shy-in-chat-tips", category: "wellbeing", date: "2026-11-13", ar: ar23, en: en23 },
  { slug: "healthy-chat-habits", category: "wellbeing", date: "2026-11-13", ar: ar24, en: en24 },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

/** مقالات مقترحة: من القسم نفسه أولاً ثم من غيره */
export function relatedArticles(slug: string, count = 3): Article[] {
  const me = getArticle(slug);
  if (!me) return [];
  const others = ARTICLES.filter((a) => a.slug !== slug);
  return [...others.filter((a) => a.category === me.category), ...others.filter((a) => a.category !== me.category)].slice(0, count);
}
