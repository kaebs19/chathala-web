import type { MetadataRoute } from "next";
import { ARTICLES } from "@/content/blog";
import { lp } from "@/lib/i18n";

const BASE = "https://chathala.com";

type Freq = MetadataRoute.Sitemap[number]["changeFrequency"];

/**
 * Public pages only. Everything under (app) is behind auth and everything
 * under (auth) is a form — neither belongs in a search index.
 * `bilingual` pages get an /en twin (see lib/i18n.ts) and hreflang alternates.
 */
const routes: Array<{ path: string; changeFrequency: Freq; priority: number; bilingual?: boolean }> = [
  { path: "/", changeFrequency: "weekly", priority: 1, bilingual: true },
  { path: "/blog", changeFrequency: "weekly", priority: 0.9, bilingual: true },
  { path: "/games", changeFrequency: "monthly", priority: 0.8, bilingual: true },
  { path: "/download", changeFrequency: "monthly", priority: 0.9, bilingual: true },
  { path: "/about", changeFrequency: "monthly", priority: 0.8, bilingual: true },
  { path: "/support", changeFrequency: "monthly", priority: 0.7, bilingual: true },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5, bilingual: true },
  { path: "/register", changeFrequency: "monthly", priority: 0.8 },
  { path: "/login", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3, bilingual: true },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3, bilingual: true },
  { path: "/child-safety", changeFrequency: "yearly", priority: 0.3 },
  { path: "/report-content", changeFrequency: "yearly", priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const out: MetadataRoute.Sitemap = [];
  const add = (path: string, changeFrequency: Freq, priority: number, bilingual: boolean | undefined, lastModified: Date) => {
    const languages = bilingual ? { ar: BASE + lp("ar", path), en: BASE + lp("en", path) } : undefined;
    out.push({ url: BASE + path, lastModified, changeFrequency, priority, ...(languages ? { alternates: { languages } } : {}) });
    if (bilingual) out.push({ url: BASE + lp("en", path), lastModified, changeFrequency, priority: Math.max(0.1, priority - 0.1), alternates: { languages } });
  };
  for (const r of routes) add(r.path, r.changeFrequency, r.priority, r.bilingual, now);
  for (const a of ARTICLES) add(`/blog/${a.slug}`, "monthly", 0.7, true, new Date(a.updated || a.date));
  return out;
}
