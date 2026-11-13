import type { Metadata } from "next";
import ContactView from "@/components/public/ContactView";
import { pageMeta } from "@/lib/seo";
import { hreflang } from "@/lib/i18n";

export const metadata: Metadata = pageMeta({
  title: "Contact Us",
  description: "Get in touch with the Hala (ChatHala) team for any question, suggestion or problem — we reply to your email as soon as we can.",
  path: "/en/contact", languages: hreflang("/contact"), locale: "en",
});

export default function ContactPageEn() {
  return <ContactView locale="en" />;
}
