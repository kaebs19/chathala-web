import Link from "next/link";
import {
  ArrowLeft, BadgeCheck, CircleDashed, Compass, Gamepad2, Globe2, MessageCircle,
  Mic, Sparkles, Smartphone, UserPlus, Users, Zap,
} from "lucide-react";
import ChatMockup from "@/components/landing/ChatMockup";
import StoreBadges from "@/components/landing/StoreBadges";

function PrimaryCta({ big }: { big?: boolean }) {
  const cls = big ? "h-14 px-8 text-lg" : "h-[52px] px-7 text-base";
  return (
    <>
      <Link href="/register" className={`auth-out inline-flex items-center justify-center gap-2 rounded-full font-extrabold text-white h-gradient shadow-[0_12px_30px_-10px_var(--h-primary)] hover:brightness-105 transition ${cls}`}>
        ابدأ الدردشة مجاناً <ArrowLeft size={19} />
      </Link>
      <Link href="/chats" className={`auth-in inline-flex items-center justify-center gap-2 rounded-full font-extrabold text-white h-gradient shadow-[0_12px_30px_-10px_var(--h-primary)] ${cls}`}>
        <MessageCircle size={19} /> افتح محادثاتك
      </Link>
    </>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 lg:pb-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_80%_10%,color-mix(in_srgb,var(--h-primary)_14%,transparent),transparent),radial-gradient(50%_45%_at_10%_60%,color-mix(in_srgb,var(--h-secondary)_12%,transparent),transparent)]" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.1fr_1fr] gap-14 lg:gap-8 items-center">
        <div className="text-center lg:text-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-h-primary/30 bg-h-primary/8 px-4 py-1.5 text-sm font-bold text-h-primary">
            <Sparkles size={15} /> دردشة وتعارف عربي — آمن ومجاني
          </span>
          <h1 className="mt-6 text-[42px] leading-[1.2] sm:text-6xl sm:leading-[1.15] font-black tracking-tight text-h-text">
            كل سالفة حلوة<br /><span className="h-gradient-text">تبدأ بـ هلا</span>
          </h1>
          <p className="mt-5 text-lg text-h-text2 leading-8 max-w-xl mx-auto lg:mx-0">
            اكتشف أشخاصاً قريبين منك يشاركونك اهتماماتك، وابدأ محادثة فورية بالنصّ والصوت والصور — بخصوصية وأمان، من جوالك أو من المتصفح مباشرة.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
            <PrimaryCta big />
            <Link href="/login" className="auth-out inline-flex h-14 px-7 items-center rounded-full font-bold text-h-text bg-h-card border border-h-border hover:border-h-primary/50 transition">لدي حساب</Link>
          </div>
          <ul className="mt-7 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-sm font-semibold text-h-text2">
            <li className="flex items-center gap-1.5"><BadgeCheck size={17} className="text-h-success" /> مجاني للبدء</li>
            <li className="flex items-center gap-1.5"><Globe2 size={17} className="text-h-success" /> بالعربية أولاً</li>
            <li className="flex items-center gap-1.5"><Smartphone size={17} className="text-h-success" /> الجوال والويب</li>
          </ul>
        </div>
        <ChatMockup />
      </div>
    </section>
  );
}

export function Stats() {
  const items = [
    { v: "+12,000", l: "مستخدم نشط" },
    { v: "+130,000", l: "محادثة بدأت" },
    { v: "+770,000", l: "رسالة" },
    { v: "4", l: "ألعاب داخل المحادثة" },
  ];
  return (
    <section aria-label="أرقام" className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-3xl overflow-hidden border border-h-border bg-h-border">
        {items.map((s) => (
          <div key={s.l} className="bg-h-card py-7 text-center">
            <p className="text-3xl sm:text-4xl font-black h-gradient-text" dir="ltr">{s.v}</p>
            <p className="mt-1 text-sm font-semibold text-h-text2">{s.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: Zap, color: "#E91E8C", t: "محادثات فورية", d: "ترى «يكتب…» وعلامتي القراءة ✓✓ لحظة بلحظة، وتردّ على أي رسالة بعينها." },
  { icon: Mic, color: "#8B5CF6", t: "صوت وصور وفيديو", d: "أرسل رسالتك بصوتك، أو صورة مؤقتة تختفي بعد أن تُشاهَد." },
  { icon: Compass, color: "#0EA5E9", t: "اكتشف من حولك", d: "بطاقات لأشخاص نشطين وقريبين — أعجب، أو أرسل رسالة مباشرة." },
  { icon: Gamepad2, color: "#F59E0B", t: "ألعاب تكسر الجليد", d: "حقيقة أم جرأة، هل تفضّل؟، لم أفعل قط، وحقيقتان وكذبة — داخل المحادثة." },
  { icon: CircleDashed, color: "#10B981", t: "القصص", d: "شارك لحظتك لـ24 ساعة، وتفاعل مع قصص الآخرين وردّ عليها." },
  { icon: Users, color: "#EF4444", t: "الأصدقاء", d: "أضف من ترتاح لهم، واعرف متى يكونون متصلين." },
];

export function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
      <SectionHead kicker="المزايا" title="كل ما تحتاجه لسالفة حلوة" sub="صُمّم هلا للمحادثة أولاً: سريع وخفيف، ومليء بما يجعل البداية أسهل." />
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(({ icon: I, color, t, d }) => (
          <article key={t} className="group rounded-3xl bg-h-card border border-h-border p-6 hover:border-h-primary/40 hover:-translate-y-0.5 transition">
            <span className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}><I size={24} /></span>
            <h3 className="mt-4 text-lg font-extrabold text-h-text">{t}</h3>
            <p className="mt-1.5 text-[15px] leading-7 text-h-text2">{d}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function StartHere() {
  const steps = [
    { icon: Globe2, t: "افتح chathala.com", d: "من أي متصفح على الجوال أو الكمبيوتر — لا تحتاج تنزيل أي شيء." },
    { icon: UserPlus, t: "أنشئ حسابك", d: "بالبريد أو بحساب Google أو Apple في أقل من دقيقة، ثم أكمل عمرك ودولتك." },
    { icon: Compass, t: "اكتشف وأعجب", d: "تصفّح البطاقات، أعجب بمن يلفتك، أو أرسل له رسالة مباشرة." },
    { icon: MessageCircle, t: "دردش فوراً", d: "رسائلك تصل لحظياً، ومحادثاتك نفسها تجدها في تطبيق الجوال متى نزّلته." },
  ];
  return (
    <section id="start" className="bg-h-card border-y border-h-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <SectionHead kicker="ابدأ من هنا" title="ابدأ من المتصفح الآن — بلا تنزيل" sub="هلا يعمل على الويب كما يعمل في التطبيق: حساب واحد، ومحادثاتك متزامنة بين الجوال والمتصفح." />
        <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map(({ icon: I, t, d }, i) => (
            <li key={t} className="relative rounded-3xl bg-h-bg border border-h-border p-6">
              <span className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-2xl h-gradient text-white flex items-center justify-center shrink-0"><I size={21} /></span>
                <span className="text-sm font-extrabold text-h-primary">الخطوة {i + 1}</span>
              </span>
              <h3 className="mt-4 text-lg font-extrabold text-h-text">{t}</h3>
              <p className="mt-1.5 text-[15px] leading-7 text-h-text2">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 rounded-3xl border border-h-border bg-h-bg p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-6 justify-between text-center lg:text-start">
          <div>
            <p className="text-xl font-extrabold text-h-text">ما تحتاجه على الويب موجود</p>
            <p className="mt-2 text-h-text2 leading-7">الاكتشاف، المحادثات بالنصّ والصوت والصور، القصص، الأصدقاء، الألعاب، والإعدادات — وتصلك إشعارات المتصفح بالرسائل الجديدة.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <PrimaryCta />
            <Link href="/login" className="auth-out inline-flex h-[52px] px-6 items-center rounded-full font-bold text-h-text bg-h-card border border-h-border hover:border-h-primary/50 transition">لدي حساب</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
      <div className="rounded-[36px] h-gradient p-10 sm:p-14 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_80%,white,transparent_30%)]" />
        <h2 className="relative text-3xl sm:text-5xl font-black">جاهز تقول «هلا»؟</h2>
        <p className="relative mt-3 text-white/85 text-lg">ابدأ من المتصفح الآن، أو حمّل التطبيق.</p>
        <div className="relative mt-8 flex flex-col items-center gap-5">
          <Link href="/register" className="auth-out inline-flex h-14 px-9 items-center gap-2 rounded-full bg-white text-[#D81B60] font-extrabold text-lg hover:bg-white/95">ابدأ مجاناً <ArrowLeft size={19} /></Link>
          <Link href="/chats" className="auth-in inline-flex h-14 px-9 items-center gap-2 rounded-full bg-white text-[#D81B60] font-extrabold text-lg">افتح محادثاتك</Link>
          <StoreBadges className="justify-center" />
        </div>
      </div>
    </section>
  );
}

function SectionHead({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <p className="text-sm font-extrabold text-h-primary">{kicker}</p>
      <h2 className="mt-2 text-3xl sm:text-4xl font-black text-h-text leading-tight">{title}</h2>
      {sub && <p className="mt-3 text-h-text2 text-lg leading-8">{sub}</p>}
    </div>
  );
}
