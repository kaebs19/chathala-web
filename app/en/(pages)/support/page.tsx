import type { Metadata } from "next";
import SupportView from "@/components/public/SupportView";
import { pageMeta } from "@/lib/seo";
import { hreflang } from "@/lib/i18n";

export const metadata: Metadata = pageMeta({
  title: "Help & Support",
  description: "Hala help centre: answers to common questions about your account, chats and subscription, and how to reach the support team.",
  path: "/en/support", languages: hreflang("/support"), locale: "en",
});

export default function SupportPageEn() {
  return <SupportView locale="en" />;
}
