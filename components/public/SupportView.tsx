import Link from "next/link";
import { HelpCircle, ChevronDown, MessageSquare, Mail, BookOpen } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { lp, type Locale } from "@/lib/i18n";

const T = {
  ar: {
    h1: "مركز الدعم", lead: "كيف يمكننا مساعدتك؟",
    contact: "تواصل معنا", contactSub: "أرسل رسالة مباشرة", inApp: "دعم التطبيق", inAppSub: "من داخل التطبيق",
    terms: "شروط الاستخدام", termsSub: "اقرأ السياسات", faq: "الأسئلة الشائعة",
    more: "لم تجد إجابتك؟", moreSub: "فريق الدعم متاح 24/7 لمساعدتك", moreBtn: "تواصل مع الدعم",
    faqs: [
      ["كيف أنشئ حساب جديد؟", "من الموقع: بحساب Google أو Apple من صفحة التسجيل. من التطبيق: بالبريد الإلكتروني أو Google أو Apple. العملية تستغرق أقل من دقيقة."],
      ["كيف أغير صورة ملفي الشخصي؟", "اذهب إلى الإعدادات > تعديل الملف الشخصي > اضغط على الصورة لتغييرها. يمكنك أيضاً إضافة صور إضافية للمعرض."],
      ["ما هي ميزات الحساب المميز (Premium)؟", "يتضمن الحساب المميز: Super Like، رؤية من أعجب بك، القراءة الخفية، وضع التخفي، شارة مميزة، وألوان مخصصة للاسم."],
      ["كيف أبلّغ عن مستخدم مسيء؟", "يمكنك الإبلاغ عن أي مستخدم من خلال الضغط على قائمة الخيارات في ملفه الشخصي أو في المحادثة واختيار 'إبلاغ'. سيتم مراجعة البلاغ خلال 24 ساعة."],
      ["كيف أحذف حسابي؟", "من الإعدادات ← «حذف الحساب أو إخفاؤه». الحذف نهائي ولا يمكن التراجع عنه، والإخفاء يحفظ بياناتك ولا يراها أحد حتى تعود بتسجيل الدخول."],
      ["هل أستطيع استخدام هلا من المتصفح؟", "نعم. افتح chathala.com وسجّل دخولك بالحساب نفسه، فتجد محادثاتك واكتشافك وقصصك كما في التطبيق، وتصل الرسائل فوراً."],
      ["هل بياناتي آمنة؟", "نعم، نستخدم تقنيات تشفير متقدمة (SSL/TLS) وإجراءات أمان صارمة. لا نبيع بياناتك لأي طرف ثالث. اقرأ المزيد في سياسة الخصوصية."],
      ["لماذا تم تقييد حسابي؟", "قد يتم تقييد الحساب نتيجة مخالفة شروط الاستخدام. يمكنك تقديم استئناف من خلال التطبيق إذا كنت تعتقد أن القرار خاطئ."],
      ["كيف ألغي الاشتراك المميز؟", "يمكنك إلغاء الاشتراك من إعدادات متجر التطبيقات (App Store أو Google Play). سيستمر الاشتراك حتى نهاية الفترة المدفوعة."],
    ],
  },
  en: {
    h1: "Help Centre", lead: "How can we help?",
    contact: "Contact us", contactSub: "Send us a message", inApp: "In-app support", inAppSub: "From inside the app",
    terms: "Terms of Use", termsSub: "Read the policies", faq: "Frequently asked questions",
    more: "Didn’t find your answer?", moreSub: "The support team is available 24/7 to help", moreBtn: "Contact support",
    faqs: [
      ["How do I create an account?", "On the website: with your Google or Apple account from the sign-up page. In the app: with email, Google or Apple. It takes less than a minute."],
      ["How do I change my profile photo?", "Go to Settings > Edit profile > tap the photo to change it. You can also add more photos to your gallery."],
      ["What does Premium (Hala+) include?", "Premium includes Super Likes, seeing who liked you, invisible read, stealth mode, a premium badge and custom name colours."],
      ["How do I report an abusive user?", "Open the options menu on their profile or inside the chat and choose “Report”. Reports are reviewed within 24 hours."],
      ["How do I delete my account?", "Go to Settings → “Delete or hide account”. Deleting is permanent and cannot be undone; hiding keeps your data but nobody can see it until you sign in again."],
      ["Can I use Hala in a browser?", "Yes. Open chathala.com and sign in with the same account to find your chats, discovery and stories just like in the app, with messages arriving instantly."],
      ["Is my data safe?", "Yes. We use encryption in transit (SSL/TLS) and strict security practices, and we do not sell your data to third parties. Read more in the Privacy Policy."],
      ["Why was my account restricted?", "An account may be restricted for violating the Terms of Use. You can submit an appeal in the app if you believe the decision was a mistake."],
      ["How do I cancel my subscription?", "Cancel from your store settings (App Store or Google Play). The subscription stays active until the end of the paid period."],
    ],
  },
} as const;

export default function SupportView({ locale = "ar" }: { locale?: Locale }) {
  const t = T[locale];
  // FAQPage: تظهر الأسئلة في نتائج البحث
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: t.faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl gradient-bg mx-auto flex items-center justify-center mb-4">
          <HelpCircle size={32} className="text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black mb-4">{t.h1}</h1>
        <p className="text-text-muted text-lg">{t.lead}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <Link href={lp(locale, "/contact")}>
          <Card hover className="text-center">
            <Mail size={28} className="text-accent-pink mx-auto mb-3" />
            <h2 className="font-bold">{t.contact}</h2>
            <p className="text-text-muted text-sm mt-1">{t.contactSub}</p>
          </Card>
        </Link>
        <Card hover className="text-center">
          <MessageSquare size={28} className="text-success mx-auto mb-3" />
          <h2 className="font-bold">{t.inApp}</h2>
          <p className="text-text-muted text-sm mt-1">{t.inAppSub}</p>
        </Card>
        <Link href={lp(locale, "/terms")}>
          <Card hover className="text-center">
            <BookOpen size={28} className="text-accent-purple mx-auto mb-3" />
            <h2 className="font-bold">{t.terms}</h2>
            <p className="text-text-muted text-sm mt-1">{t.termsSub}</p>
          </Card>
        </Link>
      </div>

      <div id="faq">
        <h2 className="text-2xl font-black mb-8">{t.faq}</h2>
        <div className="space-y-4">
          {t.faqs.map(([q, a]) => (
            <details key={q} className="group bg-bg-card border border-border rounded-2xl overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-bg-hover transition-colors">
                <span className="font-bold text-sm sm:text-base pe-2">{q}</span>
                <ChevronDown size={20} className="text-text-muted shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-5 pb-5 pt-0 text-text-muted leading-relaxed text-sm">{a}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center bg-bg-card border border-border rounded-2xl p-8">
        <h3 className="text-xl font-bold mb-3">{t.more}</h3>
        <p className="text-text-muted mb-6">{t.moreSub}</p>
        <Link href={lp(locale, "/contact")}>
          <Button>{t.moreBtn}</Button>
        </Link>
      </div>
    </div>
  );
}
