import Card from "@/components/ui/Card";
import {
  MessageCircle,
  Compass,
  Shield,
  Heart,
  Crown,
  Eye,
} from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "دردشة فورية",
    description:
      "تحدث مع أصدقائك في الوقت الحقيقي. رسائل نصية، صور، رسائل صوتية، وردود فعل تفاعلية.",
    color: "text-accent-pink",
    bg: "bg-accent-pink/10",
  },
  {
    icon: Compass,
    title: "اكتشاف ذكي",
    description:
      "اكتشف أشخاص قريبين منك بناءً على اهتماماتك وموقعك. اسحب يميناً للإعجاب!",
    color: "text-accent-purple",
    bg: "bg-accent-purple/10",
  },
  {
    icon: Shield,
    title: "خصوصية مطلقة",
    description:
      "تحكم كامل في خصوصيتك. إخفاء الظهور، قراءة خفية، وحماية من لقطات الشاشة.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: Heart,
    title: "مطابقات حقيقية",
    description:
      "خوارزمية ذكية تربطك بأشخاص يشاركونك نفس الاهتمامات لعلاقات حقيقية.",
    color: "text-error",
    bg: "bg-error/10",
  },
  {
    icon: Crown,
    title: "ميزات مميزة",
    description:
      "اشترك في Premium واحصل على Super Like، شارة مميزة، قراءة خفية، وأكثر!",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: Eye,
    title: "وضع التخفي",
    description:
      "تصفح البروفايلات بشكل مخفي تماماً. لا أحد يعلم أنك شاهدت ملفه الشخصي.",
    color: "text-info",
    bg: "bg-info/10",
  },
];

export default function Features() {
  return (
    <section className="py-24 relative" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            لماذا <span className="gradient-text">ChatHala</span>؟
          </h2>
          <p className="text-text-muted text-lg max-w-xl mx-auto">
            كل ما تحتاجه للتواصل والتعارف في مكان واحد
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} hover>
              <div
                className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-5`}
              >
                <feature.icon size={28} className={feature.color} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-text-muted leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
