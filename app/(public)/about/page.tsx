import type { Metadata } from "next";
import AboutView from "@/components/public/AboutView";
import { pageMeta } from "@/lib/seo";
import { hreflang } from "@/lib/i18n";

export const metadata: Metadata = pageMeta({
  title: "عن هلا",
  description: "تعرّف على هلا (ChatHala): تطبيق دردشة وتعارف عربي يجمعك بأشخاص يشاركونك اهتماماتك — قصتنا وقيمنا وكيف نحمي مستخدمينا.",
  path: "/about", languages: hreflang("/about"),
});

export default function AboutPage() {
  return <AboutView locale="ar" />;
}
