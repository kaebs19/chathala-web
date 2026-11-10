import type { Metadata } from "next";
import AppFrame from "@/components/hala/AppFrame";

// صفحات خلف الدخول: لا فهرسة (ولا قيمة لها في نتائج البحث)
export const metadata: Metadata = {
  title: { absolute: "هلا" },
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppFrame>{children}</AppFrame>;
}
