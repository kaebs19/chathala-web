import type { Metadata } from "next";
import GamesView from "@/components/public/GamesView";
import { pageMeta } from "@/lib/seo";
import { hreflang } from "@/lib/i18n";

export const metadata: Metadata = pageMeta({
  title: "ألعاب هلا — العب داخل المحادثة",
  description: "ألعاب المحادثة في هلا: حقيقة أم جرأة، هل تفضّل؟، لم أفعل قط، وحقيقتان وكذبة — كيف تُلعب وكيف تبدأها، وهلا لودو قريباً في التطبيق.",
  path: "/games", languages: hreflang("/games"),
});

export default function GamesPage() {
  return <GamesView locale="ar" />;
}
