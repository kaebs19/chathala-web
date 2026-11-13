import type { Metadata } from "next";
import TermsView from "@/components/public/TermsView";
import { pageMeta } from "@/lib/seo";
import { hreflang } from "@/lib/i18n";

export const metadata: Metadata = pageMeta({
  title: "Terms of Use",
  description: "Terms of Use for Hala (ChatHala), the chat and friendship app: eligibility, rules of conduct, accounts and subscriptions.",
  path: "/en/terms", languages: hreflang("/terms"), locale: "en",
});

export default function TermsPageEn() {
  return <TermsView locale="en" />;
}
