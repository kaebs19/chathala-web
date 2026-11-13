import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { hreflang } from "@/lib/i18n";

// الصفحة نفسها "use client" فلا تصدّر metadata — تُعرَّف هنا
export const metadata: Metadata = pageMeta({
  title: "اتصل بنا",
  description: "تواصل مع فريق هلا (ChatHala) لأي استفسار أو اقتراح أو مشكلة — نردّ على بريدك في أقرب وقت.",
  path: "/contact", languages: hreflang("/contact"),
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
