import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "إنشاء حساب مجاني",
  description: "أنشئ حسابك في هلا مجاناً خلال دقيقة، وابدأ الدردشة والتعارف من المتصفح أو التطبيق.",
  path: "/register",
});

export default function L({ children }: { children: React.ReactNode }) { return children; }
