import type { Metadata } from "next";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "شروط الاستخدام",
  description: "شروط استخدام تطبيق ChatHala - القواعد والسياسات",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl gradient-bg mx-auto flex items-center justify-center mb-4">
          <FileText size={32} className="text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black mb-4">شروط الاستخدام</h1>
        <p className="text-text-muted">آخر تحديث: أبريل 2026</p>
      </div>

      <div className="space-y-8">
        <Section title="1. قبول الشروط">
          <p>
            باستخدامك لتطبيق ChatHala، فأنت توافق على الالتزام بهذه الشروط والأحكام.
            إذا كنت لا توافق على أي من هذه الشروط، يُرجى عدم استخدام التطبيق.
          </p>
        </Section>

        <Section title="2. أهلية الاستخدام">
          <ul>
            <li>يجب أن يكون عمرك 18 سنة أو أكثر لاستخدام التطبيق</li>
            <li>يجب أن تقدم معلومات صحيحة ودقيقة عند التسجيل</li>
            <li>أنت مسؤول عن الحفاظ على أمان حسابك</li>
          </ul>
        </Section>

        <Section title="3. قواعد السلوك">
          <p>عند استخدام ChatHala، يُمنع:</p>
          <ul>
            <li>نشر محتوى مسيء أو عنيف أو غير لائق</li>
            <li>التحرش بالمستخدمين الآخرين أو إزعاجهم</li>
            <li>انتحال شخصية شخص آخر</li>
            <li>استخدام التطبيق لأغراض تجارية بدون إذن</li>
            <li>إرسال رسائل مزعجة (spam) أو روابط ضارة</li>
            <li>محاولة اختراق أو تخريب التطبيق</li>
            <li>نشر معلومات شخصية للآخرين بدون إذنهم</li>
          </ul>
        </Section>

        <Section title="4. المحتوى">
          <p>
            أنت مسؤول عن كل المحتوى الذي تنشره. نحتفظ بحق إزالة أي محتوى
            ينتهك هذه الشروط. يمكن للمستخدمين الإبلاغ عن المحتوى المخالف.
          </p>
        </Section>

        <Section title="5. الاشتراكات المدفوعة">
          <ul>
            <li>الاشتراكات تتجدد تلقائياً ما لم يتم إلغاؤها</li>
            <li>يمكن إلغاء الاشتراك في أي وقت من إعدادات الجهاز</li>
            <li>لا يتم استرداد المبالغ المدفوعة عن الفترة الحالية</li>
          </ul>
        </Section>

        <Section title="6. نظام العقوبات">
          <p>
            في حالة مخالفة الشروط، قد يتم اتخاذ إجراءات تتدرج من التحذير إلى
            التقييد المؤقت وصولاً إلى الحظر الدائم، حسب شدة المخالفة.
          </p>
        </Section>

        <Section title="7. إخلاء المسؤولية">
          <p>
            ChatHala ليست مسؤولة عن سلوك المستخدمين أو أي ضرر ينتج عن
            التفاعل مع مستخدمين آخرين. نحرص على توفير بيئة آمنة لكن لا نضمن
            ذلك بشكل مطلق.
          </p>
        </Section>

        <Section title="8. التعديلات">
          <p>
            نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم إخطارك بالتغييرات الجوهرية.
            استمرارك في استخدام التطبيق يعني موافقتك على الشروط المعدلة.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg-card border border-border rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4 text-accent-pink">{title}</h2>
      <div className="text-text-muted leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pr-6 [&_ul]:space-y-2 [&_li]:text-text-muted">
        {children}
      </div>
    </div>
  );
}
