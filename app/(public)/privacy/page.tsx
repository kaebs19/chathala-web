import type { Metadata } from "next";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: "سياسة الخصوصية لتطبيق ChatHala - كيف نحمي بياناتك ومعلوماتك الشخصية",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl gradient-bg mx-auto flex items-center justify-center mb-4">
          <Shield size={32} className="text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black mb-4">سياسة الخصوصية</h1>
        <p className="text-text-muted">آخر تحديث: أبريل 2026</p>
      </div>

      <div className="prose-custom space-y-8">
        <Section title="1. المعلومات التي نجمعها">
          <p>عند استخدامك لتطبيق ChatHala، قد نجمع المعلومات التالية:</p>
          <ul>
            <li>معلومات الحساب: الاسم، البريد الإلكتروني، تاريخ الميلاد، الجنس</li>
            <li>صور الملف الشخصي والمعرض</li>
            <li>معلومات الموقع الجغرافي (بإذنك)</li>
            <li>محتوى المحادثات والرسائل</li>
            <li>معلومات الجهاز والنظام</li>
            <li>بيانات الاستخدام والتفاعل</li>
          </ul>
        </Section>

        <Section title="2. كيف نستخدم معلوماتك">
          <ul>
            <li>تقديم خدمات التطبيق وتحسينها</li>
            <li>مطابقتك مع مستخدمين آخرين بناءً على تفضيلاتك</li>
            <li>إرسال الإشعارات والتحديثات</li>
            <li>حماية أمان المستخدمين ومنع الإساءة</li>
            <li>تحليل الاستخدام لتحسين التجربة</li>
          </ul>
        </Section>

        <Section title="3. مشاركة المعلومات">
          <p>
            لا نبيع معلوماتك الشخصية لأي طرف ثالث. قد نشارك المعلومات فقط في الحالات التالية:
          </p>
          <ul>
            <li>مع مزودي الخدمات الضروريين لتشغيل التطبيق</li>
            <li>استجابةً لطلبات قانونية من الجهات المختصة</li>
            <li>لحماية حقوقنا وسلامة المستخدمين</li>
          </ul>
        </Section>

        <Section title="4. حماية البيانات">
          <p>
            نستخدم تقنيات تشفير متقدمة وإجراءات أمان صارمة لحماية بياناتك.
            جميع الاتصالات مشفرة باستخدام بروتوكول SSL/TLS.
          </p>
        </Section>

        <Section title="5. حقوقك">
          <ul>
            <li>الوصول إلى بياناتك الشخصية وتعديلها</li>
            <li>حذف حسابك وجميع بياناتك</li>
            <li>التحكم في إعدادات الخصوصية</li>
            <li>إلغاء الاشتراك في الإشعارات</li>
          </ul>
        </Section>

        <Section title="6. التواصل معنا">
          <p>
            لأي استفسار حول سياسة الخصوصية، يمكنك التواصل معنا عبر صفحة{" "}
            <a href="/contact" className="text-accent-pink hover:underline">
              اتصل بنا
            </a>
            .
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
