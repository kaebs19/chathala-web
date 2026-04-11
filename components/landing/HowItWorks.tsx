import { UserPlus, Search, MessageCircle, Heart } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "أنشئ حسابك",
    description: "سجّل مجاناً في ثوانٍ بالإيميل أو حساب Google/Apple",
    step: "01",
  },
  {
    icon: Search,
    title: "اكتشف أشخاص",
    description: "تصفح بروفايلات قريبة منك واسحب يميناً لمن يعجبك",
    step: "02",
  },
  {
    icon: MessageCircle,
    title: "ابدأ الدردشة",
    description: "عند الإعجاب المتبادل، تبدأ محادثة فورية مع الشخص",
    step: "03",
  },
  {
    icon: Heart,
    title: "ابنِ علاقة",
    description: "تعرّف أكثر وابنِ صداقة أو علاقة حقيقية ومستمرة",
    step: "04",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-bg-secondary" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            كيف يعمل <span className="gradient-text">ChatHala</span>؟
          </h2>
          <p className="text-text-muted text-lg">
            أربع خطوات بسيطة تفصلك عن تجربة تعارف مميزة
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.step} className="relative text-center group">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 -left-4 w-8 h-0.5 bg-border" />
              )}

              {/* Step Number */}
              <div className="text-6xl font-black text-accent-pink/10 mb-2">
                {step.step}
              </div>

              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl gradient-bg mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <step.icon size={28} className="text-white" />
              </div>

              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
