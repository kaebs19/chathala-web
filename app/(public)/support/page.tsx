import type { Metadata } from "next";
import SupportView from "@/components/public/SupportView";
import { pageMeta } from "@/lib/seo";
import { hreflang } from "@/lib/i18n";

export const metadata: Metadata = pageMeta({
  title: "الدعم والمساعدة",
  description: "مركز مساعدة هلا: إجابات الأسئلة الشائعة عن الحساب والمحادثات والاشتراك، وطرق التواصل مع فريق الدعم.",
  path: "/support", languages: hreflang("/support"),
});

export default function SupportPage() {
  return <SupportView locale="ar" />;
}
