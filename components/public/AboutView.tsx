import { Heart, Shield, Globe, Users, Zap, Lock } from "lucide-react";
import Card from "@/components/ui/Card";
import type { Locale } from "@/lib/i18n";

const ICONS = [Shield, Lock, Heart, Globe, Users, Zap];

const T = {
  ar: {
    h1a: "حول", lead: "ChatHala هي منصة تواصل اجتماعي عربية تهدف إلى ربط الأشخاص ببعضهم البعض من خلال تجربة تعارف آمنة، ممتعة، وذكية. نؤمن بأن كل شخص يستحق فرصة للتواصل وبناء علاقات حقيقية.",
    story: "قصتنا",
    p1: "بدأ ChatHala من فكرة بسيطة: إنشاء مساحة آمنة ومريحة للتعارف في العالم العربي. لاحظنا أن معظم تطبيقات التعارف لا تراعي خصوصية وثقافة المجتمع العربي، فقررنا بناء شيء مختلف.",
    p2: "اليوم، يستخدم ChatHala آلاف المستخدمين يومياً، مع أكثر من 130,000 محادثة وأكثر من 770,000 رسالة تم تبادلها. ونستمر في التطوير والتحسين لنقدم أفضل تجربة ممكنة.",
    valuesTitle: "قيمنا ومبادئنا",
    values: [
      ["الأمان أولاً", "نضع سلامة مستخدمينا في المقام الأول مع نظام حماية متقدم"],
      ["الخصوصية", "تحكم كامل في بياناتك ومن يستطيع رؤية ملفك الشخصي"],
      ["علاقات حقيقية", "نسعى لمساعدتك في بناء علاقات صادقة ومستمرة"],
      ["مجتمع عربي", "منصة مصممة خصيصاً للمجتمع العربي بكل تفاصيلها"],
      ["تنوع واحترام", "بيئة محترمة تقبل الجميع وتمنع أي شكل من أشكال التمييز"],
      ["تقنية متقدمة", "خوارزميات ذكية لمطابقتك مع الأشخاص المناسبين"],
    ],
    numbers: "ChatHala بالأرقام",
    stats: [["+12,000", "مستخدم"], ["+130,000", "محادثة"], ["+770,000", "رسالة"], ["+1.4M", "تفاعل"]],
  },
  en: {
    h1a: "About", lead: "ChatHala is an Arabic social app that connects people through a safe, enjoyable way to meet and talk. We believe everyone deserves a chance to connect and build real relationships.",
    story: "Our story",
    p1: "ChatHala started from a simple idea: a safe, comfortable place to meet people in the Arab world. Most apps in this space overlook the privacy expectations and culture of Arab communities, so we set out to build something different.",
    p2: "Today thousands of people use ChatHala every day, with more than 130,000 conversations started and more than 770,000 messages exchanged. We keep building and improving to offer the best experience we can.",
    valuesTitle: "What we stand for",
    values: [
      ["Safety first", "User safety comes first, backed by layered protection and reporting tools"],
      ["Privacy", "You control your data and who can see your profile"],
      ["Real connections", "We want to help you build honest, lasting relationships"],
      ["An Arab community", "A platform designed for Arab users in every detail"],
      ["Respect for everyone", "A respectful space that welcomes everyone and rejects discrimination"],
      ["Thoughtful technology", "Discovery that surfaces active people who are close to you"],
    ],
    numbers: "ChatHala in numbers",
    stats: [["12,000+", "users"], ["130,000+", "chats"], ["770,000+", "messages"], ["1.4M+", "interactions"]],
  },
} as const;

export default function AboutView({ locale = "ar" }: { locale?: Locale }) {
  const t = T[locale];
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-black mb-6">
          {t.h1a} <span className="gradient-text">ChatHala</span>
        </h1>
        <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">{t.lead}</p>
      </div>

      <div className="bg-bg-card border border-border rounded-3xl p-8 sm:p-12 mb-16">
        <h2 className="text-2xl font-black mb-6 gradient-text">{t.story}</h2>
        <div className="text-text-muted leading-relaxed space-y-4">
          <p>{t.p1}</p>
          <p>{t.p2}</p>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-black text-center mb-10">{t.valuesTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.values.map(([title, description], i) => {
            const Icon = ICONS[i];
            return (
              <Card key={title} hover>
                <Icon size={32} className="text-accent-pink mb-4" />
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-text-muted text-sm">{description}</p>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="gradient-bg rounded-3xl p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-black mb-8 text-white">{t.numbers}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {t.stats.map(([value, label]) => (
            <div key={label}>
              <div className="text-3xl sm:text-4xl font-black text-white" dir="ltr">{value}</div>
              <div className="text-white/70 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
