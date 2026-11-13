import type { Metadata } from "next";
import AboutView from "@/components/public/AboutView";
import { pageMeta } from "@/lib/seo";
import { hreflang } from "@/lib/i18n";

export const metadata: Metadata = pageMeta({
  title: "About Hala",
  description: "About Hala (ChatHala): an Arabic chat and friendship app that connects you with people who share your interests — our story, values and how we protect users.",
  path: "/en/about", languages: hreflang("/about"), locale: "en",
});

export default function AboutPageEn() {
  return <AboutView locale="en" />;
}
