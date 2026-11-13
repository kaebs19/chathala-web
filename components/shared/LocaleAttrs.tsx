"use client";

import { useEffect } from "react";

/**
 * الجذر <html lang="ar" dir="rtl"> ثابت (تخطيط واحد لكل الموقع). الصفحات الإنجليزية ملفوفة
 * بـ <div lang="en" dir="ltr">، وهذا المكوّن يضبط <html> نفسه بعد التركيب (لقارئات الشاشة
 * والترجمة الآلية في المتصفح) ويعيده عند المغادرة.
 */
export default function LocaleAttrs({ lang, dir }: { lang: string; dir: "ltr" | "rtl" }) {
  useEffect(() => {
    const el = document.documentElement;
    const prev = { lang: el.lang, dir: el.dir };
    el.lang = lang;
    el.dir = dir;
    return () => { el.lang = prev.lang; el.dir = prev.dir; };
  }, [lang, dir]);
  return null;
}
