"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { logError } from "@/lib/logger";

/** خطأ رسم داخل صفحة: يبقى الشريط الجانبي والتبويبات، والصفحة وحدها تُعاد */
export default function AppError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => { logError("app:render", error); }, [error]);
  return (
    <div className="min-h-[60dvh] flex flex-col items-center justify-center text-center gap-4 px-8">
      <span className="w-16 h-16 rounded-full bg-h-error/10 text-h-error flex items-center justify-center"><AlertTriangle size={30} /></span>
      <h2 className="text-lg font-extrabold">حدث خطأ في عرض هذه الصفحة</h2>
      <div className="flex gap-3">
        <button onClick={() => unstable_retry()} className="h-11 px-5 rounded-xl h-gradient text-white font-bold">إعادة المحاولة</button>
        <Link href="/explore" className="h-11 px-5 rounded-xl bg-h-input font-bold flex items-center">الرئيسية</Link>
      </div>
    </div>
  );
}
