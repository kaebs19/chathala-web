import type { Metadata } from "next";
import Link from "next/link";
import {
  HelpCircle,
  ChevronDown,
  MessageSquare,
  Mail,
  BookOpen,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "الدعم الفني",
  description: "مركز الدعم والمساعدة - الأسئلة الشائعة والتواصل مع فريق الدعم",
};

const faqs = [
  {
    q: "كيف أنشئ حساب جديد؟",
    a: "يمكنك إنشاء حساب من خلال صفحة التسجيل باستخدام بريدك الإلكتروني أو حساب Google/Apple. العملية تستغرق أقل من دقيقة.",
  },
  {
    q: "كيف أغير صورة ملفي الشخصي؟",
    a: "اذهب إلى الإعدادات > تعديل الملف الشخصي > اضغط على الصورة لتغييرها. يمكنك أيضاً إضافة صور إضافية للمعرض.",
  },
  {
    q: "ما هي ميزات الحساب المميز (Premium)؟",
    a: "يتضمن الحساب المميز: Super Like، رؤية من أعجب بك، القراءة الخفية، وضع التخفي، شارة مميزة، وألوان مخصصة للاسم.",
  },
  {
    q: "كيف أبلّغ عن مستخدم مسيء؟",
    a: "يمكنك الإبلاغ عن أي مستخدم من خلال الضغط على قائمة الخيارات في ملفه الشخصي أو في المحادثة واختيار 'إبلاغ'. سيتم مراجعة البلاغ خلال 24 ساعة.",
  },
  {
    q: "كيف أحذف حسابي؟",
    a: "اذهب إلى الإعدادات > الحساب > حذف الحساب. يرجى العلم أن هذا الإجراء نهائي ولا يمكن التراجع عنه.",
  },
  {
    q: "هل بياناتي آمنة؟",
    a: "نعم، نستخدم تقنيات تشفير متقدمة (SSL/TLS) وإجراءات أمان صارمة. لا نبيع بياناتك لأي طرف ثالث. اقرأ المزيد في سياسة الخصوصية.",
  },
  {
    q: "لماذا تم تقييد حسابي؟",
    a: "قد يتم تقييد الحساب نتيجة مخالفة شروط الاستخدام. يمكنك تقديم استئناف من خلال التطبيق إذا كنت تعتقد أن القرار خاطئ.",
  },
  {
    q: "كيف ألغي الاشتراك المميز؟",
    a: "يمكنك إلغاء الاشتراك من إعدادات متجر التطبيقات (App Store أو Google Play). سيستمر الاشتراك حتى نهاية الفترة المدفوعة.",
  },
];

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl gradient-bg mx-auto flex items-center justify-center mb-4">
          <HelpCircle size={32} className="text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black mb-4">مركز الدعم</h1>
        <p className="text-text-muted text-lg">
          كيف يمكننا مساعدتك؟
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <Link href="/contact">
          <Card hover className="text-center">
            <Mail size={28} className="text-accent-pink mx-auto mb-3" />
            <h3 className="font-bold">تواصل معنا</h3>
            <p className="text-text-muted text-sm mt-1">أرسل رسالة مباشرة</p>
          </Card>
        </Link>
        <Card hover className="text-center">
          <MessageSquare size={28} className="text-success mx-auto mb-3" />
          <h3 className="font-bold">دعم التطبيق</h3>
          <p className="text-text-muted text-sm mt-1">من داخل التطبيق</p>
        </Card>
        <Link href="/terms">
          <Card hover className="text-center">
            <BookOpen size={28} className="text-accent-purple mx-auto mb-3" />
            <h3 className="font-bold">شروط الاستخدام</h3>
            <p className="text-text-muted text-sm mt-1">اقرأ السياسات</p>
          </Card>
        </Link>
      </div>

      {/* FAQ */}
      <div id="faq">
        <h2 className="text-2xl font-black mb-8">الأسئلة الشائعة</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group bg-bg-card border border-border rounded-2xl overflow-hidden"
            >
              <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-bg-hover transition-colors">
                <span className="font-bold text-sm sm:text-base pr-2">
                  {faq.q}
                </span>
                <ChevronDown
                  size={20}
                  className="text-text-muted shrink-0 transition-transform group-open:rotate-180"
                />
              </summary>
              <div className="px-5 pb-5 pt-0 text-text-muted leading-relaxed text-sm">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Still Need Help */}
      <div className="mt-12 text-center bg-bg-card border border-border rounded-2xl p-8">
        <h3 className="text-xl font-bold mb-3">لم تجد إجابتك؟</h3>
        <p className="text-text-muted mb-6">
          فريق الدعم متاح 24/7 لمساعدتك
        </p>
        <Link href="/contact">
          <Button>تواصل مع الدعم</Button>
        </Link>
      </div>
    </div>
  );
}
