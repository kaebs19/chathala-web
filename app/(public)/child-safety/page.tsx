import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

// معايير سلامة الأطفال — النصّ نفسه في matchhala.chathala.com/child-safety (رابط Google Play).
// المصدر الواحد: لوحة التحكم ← الإعدادات ← الصفحات (GET /api/settings/child-safety).
// ⚠️ لا تكتب النصّ هنا: عدّله من اللوحة فتتحدّث الصفحتان معاً.
export const metadata: Metadata = {
  title: "معايير سلامة الأطفال | Child Safety Standards",
  description:
    "معايير سلامة الأطفال في تطبيق هلا (ChatHala): عدم تسامح مطلق مع الاستغلال الجنسي للأطفال، التطبيق للبالغين فقط، وطريقة الإبلاغ.",
};

export const revalidate = 300;

const SOURCE_URL = "https://matchhala.chathala.com/child-safety";

async function getChildSafety(): Promise<string | null> {
  // من طرف السيرفر: عنوان الحلقة المحلية — السيرفر لا يصل لدومينه العام (راجع app/page.tsx).
  const base =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://matchhala.chathala.com/api";
  try {
    const res = await fetch(`${base}/settings/child-safety`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      console.error(`[child-safety] ${base} returned HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    const content: unknown = data?.data?.content;
    return typeof content === "string" && content.trim() ? content : null;
  } catch (err) {
    console.error(`[child-safety] fetch failed for ${base}:`, err);
    return null;
  }
}

export default async function ChildSafetyPage() {
  const html = await getChildSafety();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl gradient-bg mx-auto flex items-center justify-center mb-4">
          <ShieldCheck size={32} className="text-white" />
        </div>
      </div>

      {html ? (
        <div
          className={[
            "bg-bg-card border border-border rounded-2xl p-6 sm:p-8 text-text-muted leading-loose",
            "[&_h1]:text-2xl [&_h1]:sm:text-3xl [&_h1]:font-black [&_h1]:text-text-primary [&_h1]:mb-2",
            "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-accent-pink [&_h2]:mt-8 [&_h2]:mb-3",
            "[&_p]:my-3 [&_.sub]:text-sm [&_.sub]:mb-6",
            "[&_ul]:list-disc [&_ul]:ps-6 [&_ol]:list-decimal [&_ol]:ps-6 [&_li]:my-1.5",
            "[&_strong]:text-text-primary [&_a]:text-accent-pink [&_a:hover]:underline",
            "[&_code]:text-xs [&_code]:bg-bg-input [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded",
            "[&_.box]:border [&_.box]:border-accent-pink/30 [&_.box]:bg-accent-pink/5 [&_.box]:rounded-xl [&_.box]:p-4 [&_.box]:my-4",
            "[&_hr]:border-border [&_hr]:my-10",
          ].join(" ")}
          // النصّ من لوحة التحكم (مشرفون فقط) ويُنظَّف في السيرفر من السكربتات ومعالجات الأحداث.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div className="bg-bg-card border border-border rounded-2xl p-6 text-center">
          <h1 className="text-2xl font-black mb-3">معايير سلامة الأطفال</h1>
          <p className="text-text-muted mb-4">
            تعذّر تحميل الصفحة الآن. النسخة الرسمية متاحة دائماً هنا:
          </p>
          <a href={SOURCE_URL} className="text-accent-pink hover:underline" dir="ltr">
            {SOURCE_URL}
          </a>
        </div>
      )}
    </div>
  );
}
