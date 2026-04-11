import type { Metadata } from "next";
import {
  Heart,
  Shield,
  Globe,
  Users,
  Zap,
  Lock,
} from "lucide-react";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "حول ChatHala",
  description: "تعرف على تطبيق ChatHala - منصة التواصل والتعارف العربية",
};

const values = [
  {
    icon: Shield,
    title: "الأمان أولاً",
    description: "نضع سلامة مستخدمينا في المقام الأول مع نظام حماية متقدم",
  },
  {
    icon: Lock,
    title: "الخصوصية",
    description: "تحكم كامل في بياناتك ومن يستطيع رؤية ملفك الشخصي",
  },
  {
    icon: Heart,
    title: "علاقات حقيقية",
    description: "نسعى لمساعدتك في بناء علاقات صادقة ومستمرة",
  },
  {
    icon: Globe,
    title: "مجتمع عربي",
    description: "منصة مصممة خصيصاً للمجتمع العربي بكل تفاصيلها",
  },
  {
    icon: Users,
    title: "تنوع واحترام",
    description: "بيئة محترمة تقبل الجميع وتمنع أي شكل من أشكال التمييز",
  },
  {
    icon: Zap,
    title: "تقنية متقدمة",
    description: "خوارزميات ذكية لمطابقتك مع الأشخاص المناسبين",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-black mb-6">
          حول <span className="gradient-text">ChatHala</span>
        </h1>
        <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
          ChatHala هي منصة تواصل اجتماعي عربية تهدف إلى ربط الأشخاص ببعضهم
          البعض من خلال تجربة تعارف آمنة، ممتعة، وذكية. نؤمن بأن كل شخص يستحق
          فرصة للتواصل وبناء علاقات حقيقية.
        </p>
      </div>

      {/* Story */}
      <div className="bg-bg-card border border-border rounded-3xl p-8 sm:p-12 mb-16">
        <h2 className="text-2xl font-black mb-6 gradient-text">قصتنا</h2>
        <div className="text-text-muted leading-relaxed space-y-4">
          <p>
            بدأ ChatHala من فكرة بسيطة: إنشاء مساحة آمنة ومريحة للتعارف في
            العالم العربي. لاحظنا أن معظم تطبيقات التعارف لا تراعي خصوصية
            وثقافة المجتمع العربي، فقررنا بناء شيء مختلف.
          </p>
          <p>
            اليوم، يستخدم ChatHala آلاف المستخدمين يومياً، مع أكثر من 130,000
            محادثة وأكثر من 770,000 رسالة تم تبادلها. ونستمر في التطوير والتحسين
            لنقدم أفضل تجربة ممكنة.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="mb-16">
        <h2 className="text-2xl font-black text-center mb-10">
          قيمنا ومبادئنا
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value) => (
            <Card key={value.title} hover>
              <value.icon size={32} className="text-accent-pink mb-4" />
              <h3 className="text-lg font-bold mb-2">{value.title}</h3>
              <p className="text-text-muted text-sm">{value.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Numbers */}
      <div className="gradient-bg rounded-3xl p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-black mb-8 text-white">
          ChatHala بالأرقام
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {[
            { value: "+12,000", label: "مستخدم" },
            { value: "+130,000", label: "محادثة" },
            { value: "+770,000", label: "رسالة" },
            { value: "+1.4M", label: "تفاعل" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl sm:text-4xl font-black text-white">
                {stat.value}
              </div>
              <div className="text-white/70 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
