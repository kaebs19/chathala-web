import Link from "next/link";
import {
  ArrowLeft, BadgeCheck, Ban, CircleDashed, Compass, EyeOff, Flag, Gamepad2, Globe2, Lock, MessageCircle,
  Mic, ShieldCheck, Sparkles, Smartphone, UserPlus, Users, Zap, Heart, ChevronDown,
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

export function HowItWorks() {
  const steps = [
    { icon: UserPlus, t: "أنشئ حسابك", d: "دقيقة واحدة بالبريد أو Google أو Apple." },
    { icon: Heart, t: "اكتشف وأعجب", d: "تصفّح البطاقات، وعند الإعجاب المتبادل يحدث التطابق." },
    { icon: MessageCircle, t: "ابدأ السالفة", d: "رسالة، صوت، أو لعبة — وأنت تتحكم بمن يراسلك." },
  ];
  return (
    <section id="how" className="bg-h-card border-y border-h-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <SectionHead kicker="كيف يعمل" title="ثلاث خطوات وتبدأ" />
        <ol className="mt-12 grid md:grid-cols-3 gap-6">
          {steps.map(({ icon: I, t, d }, i) => (
            <li key={t} className="relative rounded-3xl bg-h-bg border border-h-border p-7">
              <span className="absolute top-6 end-6 text-5xl font-black text-h-text/5 select-none" aria-hidden>{i + 1}</span>
              <span className="w-12 h-12 rounded-2xl h-gradient text-white flex items-center justify-center"><I size={23} /></span>
              <h3 className="mt-4 text-lg font-extrabold text-h-text">{t}</h3>
              <p className="mt-1.5 text-[15px] leading-7 text-h-text2">{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Safety() {
  const items = [
    { icon: ShieldCheck, t: "حجب الحسابات الخارجية", d: "طلبات الانتقال لتطبيقات أخرى تُحجب تلقائياً — أكثر ما يستعمله المحتالون." },
    { icon: Lock, t: "صور مؤقتة محمية", d: "تُفتح مرة واحدة في التطبيق، بحماية من لقطات الشاشة." },
    { icon: Flag, t: "حظر وإبلاغ بضغطة", d: "وفريق مراجعة يتابع البلاغات ويتخذ الإجراء." },
    { icon: EyeOff, t: "خصوصيتك بيدك", d: "أخفِ عمرك أو آخر ظهورك، أو أوقف استقبال الطلبات متى شئت." },
    { icon: Ban, t: "للبالغين فقط", d: "هلا لمن هم 18 عاماً فأكثر، مع معايير صارمة لسلامة الأطفال." },
  ];
  return (
    <section id="safety" className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
      <div className="rounded-[36px] p-8 sm:p-12 bg-[#16161A] text-white relative overflow-hidden">
        <div className="absolute -top-24 -start-24 w-80 h-80 rounded-full bg-[#E91E8C]/30 blur-3xl" />
        <div className="absolute -bottom-24 -end-24 w-80 h-80 rounded-full bg-[#7B2CBF]/30 blur-3xl" />
        <div className="relative grid lg:grid-cols-[1fr_1.4fr] gap-10 items-start">
          <div>
            <p className="text-sm font-bold text-[#FF8FCB]">الأمان</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black leading-tight">خصوصيتك أولاً،<br />وراحتك قبل كل شيء</h2>
            <p className="mt-4 text-white/70 leading-8">بنينا هلا ليكون مكاناً مريحاً للتعارف: أدوات واضحة تحميك، وفريق يراجع ما يصله.</p>
            <Link href="/child-safety" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-white/85 hover:text-white">معايير السلامة <ArrowLeft size={16} /></Link>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3">
            {items.map(({ icon: I, t, d }) => (
              <li key={t} className="rounded-2xl bg-white/[.06] border border-white/10 p-5">
                <I size={22} className="text-[#FF8FCB]" />
                <p className="mt-3 font-extrabold">{t}</p>
                <p className="mt-1 text-sm text-white/65 leading-6">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const FAQ = [
  { q: "هل هلا مجاني؟", a: "نعم. التسجيل والدردشة والاكتشاف مجانية. واشتراك «هلا+» اختياري يضيف مزايا مثل معرفة من أعجب بك وزوّار ملفك والقراءة الخفية." },
  { q: "هل أستطيع استخدامه من المتصفح؟", a: "نعم — سجّل الدخول من chathala.com وستجد محادثاتك واكتشافك وقصصك كما في التطبيق، وتصل الرسائل فوراً." },
  { q: "كيف تحمون خصوصيتي؟", a: "لا نعرض بريدك لأحد، وتتحكم بما يظهر من ملفك. والحسابات الخارجية تُحجب تلقائياً، والحظر والإبلاغ متاحان في كل محادثة." },
  { q: "من يستطيع مراسلتي؟", a: "من تطابقت معه، أو من يرسل لك طلب محادثة تقبله أنت. ويمكنك إيقاف الطلبات أو قصرها على مشتركي هلا+ من الإعدادات." },
  { q: "كيف أحذف حسابي أو أخفيه مؤقتاً؟", a: "من الإعدادات ← «حذف الحساب أو إخفاؤه». الإخفاء يحفظ بياناتك ولا يراها أحد حتى تعود بتسجيل الدخول." },
];

export function Faq() {
  return (
    <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 pb-24">
      <SectionHead kicker="الأسئلة" title="أسئلة شائعة" />
      <div className="mt-10 space-y-3">
        {FAQ.map((f) => (
          <details key={f.q} className="group rounded-2xl bg-h-card border border-h-border open:border-h-primary/40 transition">
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4 font-extrabold text-h-text [&::-webkit-details-marker]:hidden">
              {f.q}
              <ChevronDown size={20} className="shrink-0 text-h-text2 transition group-open:rotate-180" />
            </summary>
            <p className="px-5 pb-5 -mt-1 text-[15px] leading-8 text-h-text2">{f.a}</p>
          </details>
        ))}
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
