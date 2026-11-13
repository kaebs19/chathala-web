// لغتا الموقع العام: العربية على الجذر، والإنجليزية تحت /en.
// صفحات التطبيق والمصادقة ((app) و(auth)) عربية فقط حتى الآن.
export type Locale = "ar" | "en";

/** مسار الصفحة نفسها بلغة معيّنة (المسار يُعطى بصيغته العربية، مثل "/about") */
export function lp(locale: Locale, path: string): string {
  if (locale === "ar") return path;
  // سياسة الخصوصية الإنجليزية رابطها في App Store Connect — يبقى /privacy/en
  if (path === "/privacy") return "/privacy/en";
  if (path === "/") return "/en";
  if (path.startsWith("/#")) return "/en" + path.slice(1);
  // صفحات بلا نسخة إنجليزية (نموذج الإزالة ثنائي اللغة أصلاً، وسلامة الأطفال نصّها من اللوحة)
  if (AR_ONLY.some((p) => path === p || path.startsWith(p + "/") || path.startsWith(p + "#"))) return path;
  return `/en${path}`;
}

const AR_ONLY = ["/report-content", "/child-safety", "/login", "/register", "/forgot-password", "/chats", "/profile", "/premium"];

/** الصفحات العامة التي لها نسخة باللغتين (بصيغتها العربية) */
const BILINGUAL = ["/", "/about", "/download", "/support", "/contact", "/terms", "/privacy", "/blog", "/games"];

/** من مسار حالي ← المسار المقابل باللغة الأخرى (أو رئيسية تلك اللغة إن لم توجد نسخة) */
export function switchLocalePath(pathname: string): { locale: Locale; target: Locale; href: string } {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (clean === "/privacy/en") return { locale: "en", target: "ar", href: "/privacy" };
  if (clean === "/en" || clean.startsWith("/en/")) {
    const ar = clean.slice(3) || "/";
    return { locale: "en", target: "ar", href: ar };
  }
  const ok = BILINGUAL.includes(clean) || clean.startsWith("/blog/");
  return { locale: "ar", target: "en", href: ok ? lp("en", clean) : "/en" };
}

/** روابط hreflang لصفحة لها نسخة باللغتين */
export function hreflang(path: string): Record<string, string> {
  return { ar: lp("ar", path), en: lp("en", path), "x-default": lp("ar", path) };
}
