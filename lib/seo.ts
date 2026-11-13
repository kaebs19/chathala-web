import type { Metadata } from "next";

export const SITE_URL = "https://chathala.com";
export const SITE_NAME = "هلا — ChatHala";
export const OG_IMAGE = { url: "/og.png", width: 1200, height: 630, alt: "هلا — دردشة وتعارف عربي" };

/**
 * بيانات صفحة عامة: canonical خاصّ بها (لا للرئيسية — كان canonical الجذر "/" يُورَّث لكل صفحة
 * فتُعامَل الصفحات الداخلية نسخاً من الرئيسية)، ومعاينة مشاركة بنفس العنوان والوصف.
 */
export function pageMeta({ title, description, path, noindex, languages, locale = "ar", type = "website" }: {
  title: string; description: string; path: string; noindex?: boolean; languages?: Record<string, string>;
  locale?: "ar" | "en"; type?: "website" | "article";
}): Metadata {
  return {
    // الصفحات الإنجليزية: قالب العنوان العربي في الجذر لا يناسبها
    title: locale === "en" ? { absolute: `${title} | Hala — ChatHala` } : title,
    description,
    alternates: { canonical: path, ...(languages ? { languages } : {}) },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: locale === "en" ? "en_US" : "ar_SA",
      type,
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: `${title} | ${SITE_NAME}`, description, images: [OG_IMAGE.url] },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
