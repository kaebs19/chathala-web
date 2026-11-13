import type { Metadata } from "next";
import TermsView from "@/components/public/TermsView";
import { pageMeta } from "@/lib/seo";
import { hreflang } from "@/lib/i18n";

export const metadata: Metadata = pageMeta({
  title: "شروط الاستخدام",
  description: "شروط استخدام تطبيق هلا (ChatHala) للدردشة والتعارف: الأهلية، قواعد السلوك، والحسابات والاشتراكات.",
  path: "/terms", languages: hreflang("/terms"),
});

export default function TermsPage() {
  return <TermsView locale="ar" />;
}
