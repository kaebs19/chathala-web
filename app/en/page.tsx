import type { Metadata } from "next";
import { Features, FinalCta, Hero, StartHere, Stats } from "@/components/landing/HomeSections";
import LatestArticles from "@/components/blog/LatestArticles";
import { pageMeta } from "@/lib/seo";
import { hreflang } from "@/lib/i18n";

export const metadata: Metadata = pageMeta({
  title: "Hala — Arabic Chat & Friendship App",
  description: "Hala (ChatHala) is an Arabic chat and friendship app: discover people near you and start chatting instantly with text, voice and photos — private, safe and free on mobile or web.",
  path: "/en", languages: hreflang("/"), locale: "en",
});

export default function HomeEn() {
  return (
    <main>
      <Hero locale="en" />
      <Stats locale="en" />
      <Features locale="en" />
      <StartHere locale="en" />
      <LatestArticles locale="en" />
      <FinalCta locale="en" />
    </main>
  );
}
