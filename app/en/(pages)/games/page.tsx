import type { Metadata } from "next";
import GamesView from "@/components/public/GamesView";
import { pageMeta } from "@/lib/seo";
import { hreflang } from "@/lib/i18n";

export const metadata: Metadata = pageMeta({
  title: "Games — Play Inside the Chat",
  description: "Hala’s in-chat games: Truth or Dare, Would You Rather, Never Have I Ever and Two Truths and a Lie — how they work and how to start one, plus Hala Ludo coming soon.",
  path: "/en/games", languages: hreflang("/games"), locale: "en",
});

export default function GamesPageEn() {
  return <GamesView locale="en" />;
}
