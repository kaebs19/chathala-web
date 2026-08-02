import type { MetadataRoute } from "next";

/**
 * NOTE: Cloudflare currently serves its own managed robots.txt for this zone,
 * which may take precedence over this route at the edge. If /robots.txt does
 * not show the Sitemap line below, either turn off Cloudflare's managed
 * robots.txt or submit the sitemap directly in Search Console.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Auth-gated areas — nothing here is useful in an index, and the paths
      // themselves leak product surface.
      disallow: [
        "/api/",
        "/chats",
        "/explore",
        "/matches",
        "/notifications",
        "/profile",
        "/requests",
        "/settings",
        "/visitors",
      ],
    },
    sitemap: "https://chathala.com/sitemap.xml",
  };
}
