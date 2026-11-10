import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "استعادة كلمة المرور",
  description: "استعد الوصول إلى حسابك في هلا برمز يصلك على بريدك.",
  path: "/forgot-password",
  noindex: true,
});

export default function L({ children }: { children: React.ReactNode }) { return children; }
