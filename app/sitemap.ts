import type { MetadataRoute } from "next";

const BASE = "https://chathala.com";

/**
 * Public pages only. Everything under (app) is behind auth and everything
 * under (auth) is a form — neither belongs in a search index.
 */
const routes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/download", changeFrequency: "monthly", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/support", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
