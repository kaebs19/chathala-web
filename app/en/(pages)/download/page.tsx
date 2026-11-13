import type { Metadata } from "next";
import DownloadView from "@/components/public/DownloadView";
import { pageMeta } from "@/lib/seo";
import { hreflang } from "@/lib/i18n";

export const metadata: Metadata = pageMeta({
  title: "Download Hala",
  description: "Download Hala, the Arabic chat and friendship app, free on iPhone and Android — or start right in your browser with nothing to install.",
  path: "/en/download", languages: hreflang("/download"), locale: "en",
});

export default function DownloadPageEn() {
  return <DownloadView locale="en" />;
}
