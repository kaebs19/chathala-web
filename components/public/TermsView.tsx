import { FileText } from "lucide-react";
import type { Locale } from "@/lib/i18n";

type Block = { p: string } | { ul: readonly string[] };
type Sec = { title: string; blocks: readonly Block[] };

// ⚠️ النسختان يجب أن تبقيا متطابقتين في المعنى — عدّلهما معاً.
const T: Record<Locale, { h1: string; updated: string; sections: readonly Sec[] }> = {
  ar: {
    h1: "شروط الاستخدام", updated: "آخر تحديث: أبريل 2026",
    sections: [
      { title: "1. قبول الشروط", blocks: [{ p: "باستخدامك لتطبيق ChatHala، فأنت توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يُرجى عدم استخدام التطبيق." }] },
      { title: "2. أهلية الاستخدام", blocks: [{ ul: ["يجب أن يكون عمرك 18 سنة أو أكثر لاستخدام التطبيق", "يجب أن تقدم معلومات صحيحة ودقيقة عند التسجيل", "أنت مسؤول عن الحفاظ على أمان حسابك"] }] },
      { title: "3. قواعد السلوك", blocks: [{ p: "عند استخدام ChatHala، يُمنع:" }, { ul: ["نشر محتوى مسيء أو عنيف أو غير لائق", "التحرش بالمستخدمين الآخرين أو إزعاجهم", "انتحال شخصية شخص آخر", "استخدام التطبيق لأغراض تجارية بدون إذن", "إرسال رسائل مزعجة (spam) أو روابط ضارة", "محاولة اختراق أو تخريب التطبيق", "نشر معلومات شخصية للآخرين بدون إذنهم"] }] },
      { title: "4. المحتوى", blocks: [{ p: "أنت مسؤول عن كل المحتوى الذي تنشره. نحتفظ بحق إزالة أي محتوى ينتهك هذه الشروط. يمكن للمستخدمين الإبلاغ عن المحتوى المخالف." }] },
      { title: "5. الاشتراكات المدفوعة", blocks: [{ ul: ["الاشتراكات تتجدد تلقائياً ما لم يتم إلغاؤها", "يمكن إلغاء الاشتراك في أي وقت من إعدادات الجهاز", "لا يتم استرداد المبالغ المدفوعة عن الفترة الحالية"] }] },
      { title: "6. نظام العقوبات", blocks: [{ p: "في حالة مخالفة الشروط، قد يتم اتخاذ إجراءات تتدرج من التحذير إلى التقييد المؤقت وصولاً إلى الحظر الدائم، حسب شدة المخالفة." }] },
      { title: "7. إخلاء المسؤولية", blocks: [{ p: "ChatHala ليست مسؤولة عن سلوك المستخدمين أو أي ضرر ينتج عن التفاعل مع مستخدمين آخرين. نحرص على توفير بيئة آمنة لكن لا نضمن ذلك بشكل مطلق." }] },
      { title: "8. التعديلات", blocks: [{ p: "نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم إخطارك بالتغييرات الجوهرية. استمرارك في استخدام التطبيق يعني موافقتك على الشروط المعدلة." }] },
    ],
  },
  en: {
    h1: "Terms of Use", updated: "Last updated: April 2026",
    sections: [
      { title: "1. Acceptance of the terms", blocks: [{ p: "By using ChatHala you agree to be bound by these terms and conditions. If you do not agree with any of them, please do not use the app." }] },
      { title: "2. Eligibility", blocks: [{ ul: ["You must be 18 or older to use the app", "You must provide true and accurate information when you sign up", "You are responsible for keeping your account secure"] }] },
      { title: "3. Rules of conduct", blocks: [{ p: "When using ChatHala you may not:" }, { ul: ["Post abusive, violent or inappropriate content", "Harass or bother other users", "Impersonate another person", "Use the app for commercial purposes without permission", "Send spam or harmful links", "Attempt to hack or disrupt the app", "Share other people’s personal information without their consent"] }] },
      { title: "4. Content", blocks: [{ p: "You are responsible for everything you post. We reserve the right to remove any content that violates these terms. Users can report content that breaks the rules." }] },
      { title: "5. Paid subscriptions", blocks: [{ ul: ["Subscriptions renew automatically unless cancelled", "You can cancel at any time from your device settings", "Payments for the current period are not refunded"] }] },
      { title: "6. Enforcement", blocks: [{ p: "If you violate these terms we may take action ranging from a warning to a temporary restriction up to a permanent ban, depending on the severity of the violation." }] },
      { title: "7. Disclaimer", blocks: [{ p: "ChatHala is not responsible for the behaviour of users or for any harm resulting from interactions with other users. We work to provide a safe environment but cannot guarantee it absolutely." }] },
      { title: "8. Changes", blocks: [{ p: "We may change these terms at any time. You will be notified of material changes. Continuing to use the app means you accept the updated terms." }] },
    ],
  },
};

export default function TermsView({ locale = "ar" }: { locale?: Locale }) {
  const t = T[locale];
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl gradient-bg mx-auto flex items-center justify-center mb-4">
          <FileText size={32} className="text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black mb-4">{t.h1}</h1>
        <p className="text-text-muted">{t.updated}</p>
      </div>

      <div className="space-y-8">
        {t.sections.map((s) => (
          <div key={s.title} className="bg-bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 text-accent-pink">{s.title}</h2>
            <div className="text-text-muted leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:ps-6 [&_ul]:space-y-2 [&_li]:text-text-muted">
              {s.blocks.map((b, i) => "p" in b
                ? <p key={i}>{b.p}</p>
                : <ul key={i}>{b.ul.map((li) => <li key={li}>{li}</li>)}</ul>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
