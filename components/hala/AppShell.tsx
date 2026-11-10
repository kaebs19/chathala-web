"use client";

import { useEffect } from "react";
import { useTheme } from "@/stores/themeStore";
import { HalaToasts } from "@/components/hala/Toast";

/** غلاف الهوية لكل صفحات التطبيق والمصادقة */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const init = useTheme((s) => s.init);
  useEffect(() => {
    document.documentElement.dataset.app = "1";
    const off = init();
    return () => { off(); delete document.documentElement.dataset.app; };
  }, [init]);
  return (
    <div className="hala min-h-dvh">
      <HalaToasts />
      {children}
    </div>
  );
}
