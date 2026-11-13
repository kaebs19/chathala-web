import Link from "next/link";
import {
  ArrowLeft, ArrowRight, BadgeCheck, CircleDashed, Compass, Gamepad2, Globe2, MessageCircle,
  Mic, Sparkles, Smartphone, UserPlus, Users, Zap,
} from "lucide-react";
import ChatMockup from "@/components/landing/ChatMockup";
import StoreBadges from "@/components/landing/StoreBadges";
import type { Locale } from "@/lib/i18n";

// نصوص الرئيسية باللغتين. التسجيل والدخول والتطبيق نفسه بالعربية فقط حتى الآن — الروابط إليها واحدة.
const T = {
  ar: {
    start: "ابدأ الدردشة مجاناً", openChats: "افتح محادثاتك", haveAccount: "لدي حساب",
    badge: "دردشة وتعارف عربي — آمن ومجاني",
    h1a: "كل سالفة حلوة", h1b: "تبدأ بـ هلا",
    lead: "اكتشف أشخاصاً قريبين منك يشاركونك اهتماماتك، وابدأ محادثة فورية بالنصّ والصوت والصور — بخصوصية وأمان، من جوالك أو من المتصفح مباشرة.",
    ticks: ["مجاني للبدء", "بالعربية أولاً", "الجوال والويب"],
    statsLabel: "أرقام",
    stats: [["+12,000", "مستخدم نشط"], ["+130,000", "محادثة بدأت"], ["+770,000", "رسالة"], ["4", "ألعاب داخل المحادثة"]],
    featKicker: "المزايا", featTitle: "كل ما تحتاجه لسالفة حلوة", featSub: "صُمّم هلا للمحادثة أولاً: سريع وخفيف، ومليء بما يجعل البداية أسهل.",
    features: [
      ["محادثات فورية", "ترى «يكتب…» وعلامتي القراءة ✓✓ لحظة بلحظة، وتردّ على أي رسالة بعينها."],
      ["صوت وصور وفيديو", "أرسل رسالتك بصوتك، أو صورة مؤقتة تختفي بعد أن تُشاهَد."],
      ["اكتشف من حولك", "بطاقات لأشخاص نشطين وقريبين — أعجب، أو أرسل رسالة مباشرة."],
      ["ألعاب تكسر الجليد", "حقيقة أم جرأة، هل تفضّل؟، لم أفعل قط، وحقيقتان وكذبة — داخل المحادثة."],
      ["القصص", "شارك لحظتك لـ24 ساعة، وتفاعل مع قصص الآخرين وردّ عليها."],
      ["الأصدقاء", "أضف من ترتاح لهم، واعرف متى يكونون متصلين."],
    ],
    startKicker: "ابدأ من هنا", startTitle: "ابدأ من المتصفح الآن — بلا تنزيل",
    startSub: "هلا يعمل على الويب كما يعمل في التطبيق: حساب واحد، ومحادثاتك متزامنة بين الجوال والمتصفح.",
    step: "الخطوة",
    steps: [
      ["افتح chathala.com", "من أي متصفح على الجوال أو الكمبيوتر — لا تحتاج تنزيل أي شيء."],
      ["أنشئ حسابك", "بحساب Google أو Apple في أقل من دقيقة، ثم أكمل عمرك ودولتك."],
      ["اكتشف وأعجب", "تصفّح البطاقات، أعجب بمن يلفتك، أو أرسل له رسالة مباشرة."],
      ["دردش فوراً", "رسائلك تصل لحظياً، ومحادثاتك نفسها تجدها في تطبيق الجوال متى نزّلته."],
    ],
    webTitle: "ما تحتاجه على الويب موجود",
    webBody: "الاكتشاف، المحادثات بالنصّ والصوت والصور، القصص، الأصدقاء، الألعاب، والإعدادات — وتصلك إشعارات المتصفح بالرسائل الجديدة.",
    ctaTitle: "جاهز تقول «هلا»؟", ctaSub: "ابدأ من المتصفح الآن، أو حمّل التطبيق.", ctaStart: "ابدأ مجاناً",
  },
  en: {
    start: "Start chatting free", openChats: "Open your chats", haveAccount: "I have an account",
    badge: "Arabic chat & friendship — safe and free",
    h1a: "Every good conversation", h1b: "starts with Hala",
    lead: "Discover people near you who share your interests and start chatting instantly with text, voice and photos — private and safe, on your phone or straight from the browser.",
    ticks: ["Free to start", "Arabic first", "Mobile & web"],
    statsLabel: "Numbers",
    stats: [["12,000+", "active users"], ["130,000+", "chats started"], ["770,000+", "messages"], ["4", "in-chat games"]],
    featKicker: "Features", featTitle: "Everything a good chat needs", featSub: "Hala is built for conversation first: fast, light, and full of things that make starting easier.",
    features: [
      ["Instant messaging", "See “typing…” and read receipts ✓✓ in real time, and reply to any specific message."],
      ["Voice, photos and video", "Send a voice message, or a view-once photo that disappears after it is seen."],
      ["Discover people nearby", "Cards of active people close to you — like them, or send a message directly."],
      ["Games that break the ice", "Truth or Dare, Would You Rather, Never Have I Ever, and Two Truths and a Lie — inside the chat."],
      ["Stories", "Share a moment for 24 hours, and react or reply to other people’s stories."],
      ["Friends", "Add the people you feel comfortable with and see when they are online."],
    ],
    startKicker: "Start here", startTitle: "Start in your browser now — no download",
    startSub: "Hala works on the web just like the app: one account, with your chats synced between phone and browser.",
    step: "Step",
    steps: [
      ["Open chathala.com", "From any browser on your phone or computer — nothing to install."],
      ["Create your account", "With Google or Apple in under a minute, then add your age and country."],
      ["Discover and like", "Browse the cards, like whoever catches your eye, or message them directly."],
      ["Chat instantly", "Messages arrive in real time, and the same chats are in the mobile app whenever you install it."],
    ],
    webTitle: "Everything you need is on the web",
    webBody: "Discovery, chats with text, voice and photos, stories, friends, games and settings — with browser notifications for new messages.",
    ctaTitle: "Ready to say “Hala”?", ctaSub: "Start in the browser now, or download the app.", ctaStart: "Start free",
  },
} as const;

const FEATURE_ICONS = [
  { icon: Zap, color: "#E91E8C" }, { icon: Mic, color: "#8B5CF6" }, { icon: Compass, color: "#0EA5E9" },
  { icon: Gamepad2, color: "#F59E0B" }, { icon: CircleDashed, color: "#10B981" }, { icon: Users, color: "#EF4444" },
];
const STEP_ICONS = [Globe2, UserPlus, Compass, MessageCircle];

type P = { locale?: Locale };

function Arrow({ locale }: { locale: Locale }) {
  return locale === "ar" ? <ArrowLeft size={19} /> : <ArrowRight size={19} />;
}

function PrimaryCta({ big, locale }: { big?: boolean; locale: Locale }) {
  const t = T[locale];
  const cls = big ? "h-14 px-8 text-lg" : "h-[52px] px-7 text-base";
  return (
    <>
      <Link href="/register" className={`auth-out inline-flex items-center justify-center gap-2 rounded-full font-extrabold text-white h-gradient shadow-[0_12px_30px_-10px_var(--h-primary)] hover:brightness-105 transition ${cls}`}>
        {t.start} <Arrow locale={locale} />
      </Link>
      <Link href="/chats" className={`auth-in inline-flex items-center justify-center gap-2 rounded-full font-extrabold text-white h-gradient shadow-[0_12px_30px_-10px_var(--h-primary)] ${cls}`}>
        <MessageCircle size={19} /> {t.openChats}
      </Link>
    </>
  );
}

export function Hero({ locale = "ar" }: P) {
  const t = T[locale];
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 lg:pb-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_80%_10%,color-mix(in_srgb,var(--h-primary)_14%,transparent),transparent),radial-gradient(50%_45%_at_10%_60%,color-mix(in_srgb,var(--h-secondary)_12%,transparent),transparent)]" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.1fr_1fr] gap-14 lg:gap-8 items-center">
        <div className="text-center lg:text-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-h-primary/30 bg-h-primary/8 px-4 py-1.5 text-sm font-bold text-h-primary">
            <Sparkles size={15} /> {t.badge}
          </span>
          <h1 className="mt-6 text-[42px] leading-[1.2] sm:text-6xl sm:leading-[1.15] font-black tracking-tight text-h-text">
            {t.h1a}<br /><span className="h-gradient-text">{t.h1b}</span>
          </h1>
          <p className="mt-5 text-lg text-h-text2 leading-8 max-w-xl mx-auto lg:mx-0">{t.lead}</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
            <PrimaryCta big locale={locale} />
            <Link href="/login" className="auth-out inline-flex h-14 px-7 items-center rounded-full font-bold text-h-text bg-h-card border border-h-border hover:border-h-primary/50 transition">{t.haveAccount}</Link>
          </div>
          <ul className="mt-7 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-sm font-semibold text-h-text2">
            <li className="flex items-center gap-1.5"><BadgeCheck size={17} className="text-h-success" /> {t.ticks[0]}</li>
            <li className="flex items-center gap-1.5"><Globe2 size={17} className="text-h-success" /> {t.ticks[1]}</li>
            <li className="flex items-center gap-1.5"><Smartphone size={17} className="text-h-success" /> {t.ticks[2]}</li>
          </ul>
        </div>
        <ChatMockup locale={locale} />
      </div>
    </section>
  );
}

export function Stats({ locale = "ar" }: P) {
  const t = T[locale];
  return (
    <section aria-label={t.statsLabel} className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-3xl overflow-hidden border border-h-border bg-h-border">
        {t.stats.map(([v, l]) => (
          <div key={l} className="bg-h-card py-7 text-center">
            <p className="text-3xl sm:text-4xl font-black h-gradient-text" dir="ltr">{v}</p>
            <p className="mt-1 text-sm font-semibold text-h-text2">{l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Features({ locale = "ar" }: P) {
  const t = T[locale];
  return (
    <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
      <SectionHead kicker={t.featKicker} title={t.featTitle} sub={t.featSub} />
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {t.features.map(([title, d], i) => {
          const { icon: I, color } = FEATURE_ICONS[i];
          return (
            <article key={title} className="group rounded-3xl bg-h-card border border-h-border p-6 hover:border-h-primary/40 hover:-translate-y-0.5 transition">
              <span className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}><I size={24} /></span>
              <h3 className="mt-4 text-lg font-extrabold text-h-text">{title}</h3>
              <p className="mt-1.5 text-[15px] leading-7 text-h-text2">{d}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function StartHere({ locale = "ar" }: P) {
  const t = T[locale];
  return (
    <section id="start" className="bg-h-card border-y border-h-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <SectionHead kicker={t.startKicker} title={t.startTitle} sub={t.startSub} />
        <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {t.steps.map(([title, d], i) => {
            const I = STEP_ICONS[i];
            return (
              <li key={title} className="relative rounded-3xl bg-h-bg border border-h-border p-6">
                <span className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-2xl h-gradient text-white flex items-center justify-center shrink-0"><I size={21} /></span>
                  <span className="text-sm font-extrabold text-h-primary">{t.step} {i + 1}</span>
                </span>
                <h3 className="mt-4 text-lg font-extrabold text-h-text">{title}</h3>
                <p className="mt-1.5 text-[15px] leading-7 text-h-text2">{d}</p>
              </li>
            );
          })}
        </ol>
        <div className="mt-10 rounded-3xl border border-h-border bg-h-bg p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-6 justify-between text-center lg:text-start">
          <div>
            <p className="text-xl font-extrabold text-h-text">{t.webTitle}</p>
            <p className="mt-2 text-h-text2 leading-7">{t.webBody}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <PrimaryCta locale={locale} />
            <Link href="/login" className="auth-out inline-flex h-[52px] px-6 items-center rounded-full font-bold text-h-text bg-h-card border border-h-border hover:border-h-primary/50 transition">{t.haveAccount}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalCta({ locale = "ar" }: P) {
  const t = T[locale];
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
      <div className="rounded-[36px] h-gradient p-10 sm:p-14 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_80%,white,transparent_30%)]" />
        <h2 className="relative text-3xl sm:text-5xl font-black">{t.ctaTitle}</h2>
        <p className="relative mt-3 text-white/85 text-lg">{t.ctaSub}</p>
        <div className="relative mt-8 flex flex-col items-center gap-5">
          <Link href="/register" className="auth-out inline-flex h-14 px-9 items-center gap-2 rounded-full bg-white text-[#D81B60] font-extrabold text-lg hover:bg-white/95">{t.ctaStart} <Arrow locale={locale} /></Link>
          <Link href="/chats" className="auth-in inline-flex h-14 px-9 items-center gap-2 rounded-full bg-white text-[#D81B60] font-extrabold text-lg">{t.openChats}</Link>
          <StoreBadges className="justify-center" />
        </div>
      </div>
    </section>
  );
}

export function SectionHead({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <p className="text-sm font-extrabold text-h-primary">{kicker}</p>
      <h2 className="mt-2 text-3xl sm:text-4xl font-black text-h-text leading-tight">{title}</h2>
      {sub && <p className="mt-3 text-h-text2 text-lg leading-8">{sub}</p>}
    </div>
  );
}
