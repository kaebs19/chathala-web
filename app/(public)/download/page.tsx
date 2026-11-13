import type { Metadata } from "next";
import DownloadView from "@/components/public/DownloadView";
import { pageMeta } from "@/lib/seo";
import { hreflang } from "@/lib/i18n";

export const metadata: Metadata = pageMeta({
  title: "تحميل تطبيق هلا",
  description: "حمّل تطبيق هلا للدردشة والتعارف مجاناً على iPhone وAndroid، أو ابدأ مباشرة من المتصفح بلا تنزيل.",
  path: "/download", languages: hreflang("/download"),
});

export default function DownloadPage() {
  return <DownloadView locale="ar" />;
}
