import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "تسجيل الدخول",
  description: "سجّل دخولك إلى هلا من المتصفح وتابع محادثاتك واكتشافك وقصصك — بالبريد أو Google أو Apple.",
  path: "/login",
});

export default function L({ children }: { children: React.ReactNode }) { return children; }
