import Link from "next/link";
import { Dice5, Flame, Gamepad2, HelpCircle, MessageCircle, ShieldCheck, Sparkles, Trophy, Users } from "lucide-react";
import StoreBadges from "@/components/landing/StoreBadges";
import { lp, type Locale } from "@/lib/i18n";

// صفحة تعريفية بألعاب هلا (بلا لعب في المتصفح — قرار المالك ١٣ نوفمبر ٢٠٢٦).
// ⚠️ «هلا لودو» لم يصدر بعد في نسخة من المتجر: يُعرض «قريباً». أزل الشارة عند صدوره.
const GAME_STYLE = [
  { emoji: "🎯", color: "#E91E8C" }, { emoji: "🤔", color: "#8B5CF6" },
  { emoji: "🙅", color: "#0EA5E9" }, { emoji: "🕵️", color: "#F59E0B" },
];
const HOW_ICONS = [MessageCircle, Gamepad2, Sparkles];
const LUDO_ICONS = [Users, Trophy, Dice5];

const T = {
  ar: {
    kicker: "ألعاب هلا", h1a: "العب مع من تحادثه", h1b: "والسالفة تمشي لحالها",
    lead: "أربع ألعاب داخل المحادثة تكسر الجليد من أول رسالة: لا تنزيل إضافياً ولا خروج من الدردشة. تختار اللعبة، يقبل الطرف الآخر، وتبدأ الأسئلة.",
    start: "ابدأ مجاناً", chats: "افتح محادثاتك",
    gamesTitle: "ألعاب المحادثة الأربع", gamesSub: "كلها تُلعب بين شخصين داخل المحادثة نفسها، في التطبيق وعلى الويب.",
    example: "مثال",
    games: [
      { t: "حقيقة أم جرأة", d: "يختار كل لاعب في دوره: سؤال يجيب عنه بصدق، أو تحدٍّ خفيف ينفّذه. اللعبة تختار السؤال عشوائياً فلا يُحرَج أحد بصياغته.", ex: "حقيقة: ما أغرب عادة عندك لا يعرفها أحد؟" },
      { t: "هل تفضّل؟", d: "خياران لا ثالث لهما. يختار كلٌّ منكما سرّاً، ثم يُكشف الاختياران معاً — وتعرف هل تطابقتما أم يبدأ النقاش.", ex: "بحر وهدوء 🌊 أم جبل ومغامرة ⛰️؟" },
      { t: "لم أفعل قط", d: "عبارة تبدأ بـ«لم أفعل قط…» ويجيب كلٌّ منكما: فعلتُ أو لم أفعل. الإجابتان تظهران معاً، وخلف كل «فعلتُ» قصة تُحكى.", ex: "لم أفعل قط: سافرت وحدي إلى بلد لا أعرف لغته." },
      { t: "حقيقتان وكذبة", d: "تكتب ثلاث عبارات عن نفسك: اثنتان صحيحتان وواحدة مختلقة، ويحاول الطرف الآخر أن يكشف الكذبة. أسرع طريقة لتعرف شخصاً من حكاياته.", ex: "تسلّقت جبلاً · أجيد ثلاث لغات · لم أركب طائرة قط." },
    ],
    howTitle: "كيف تبدأ لعبة؟",
    how: [
      ["افتح أي محادثة", "من زرّ الإضافة (+) في شريط الكتابة اختر «ألعاب»."],
      ["اختر اللعبة والمستوى", "أرسل الدعوة، وتبدأ اللعبة حين يقبلها الطرف الآخر."],
      ["العب وتفاعل", "بطاقة اللعبة تتحدّث في مكانها، وتستطيع التفاعل مع كل إجابة والردّ عليها برسالة عادية."],
    ],
    safeTitle: "لعب محترم", safe: [
      "اللعبة دعوة: لا تبدأ إلا بقبول الطرف الآخر، ويستطيع أي منكما إنهاءها متى شاء.",
      "الأسئلة يراجعها فريق هلا، والمستوى «الجريء» رومانسي وشخصي بلا محتوى جنسي، وللبالغين فقط وبقبول الطرفين.",
      "ما تكتبه بنفسك في الألعاب يمرّ على فلاتر المحادثة نفسها، وتستطيع الإبلاغ عن أي سؤال أو لاعب.",
    ],
    ludoBadge: "قريباً في التطبيق", ludoTitle: "هلا لودو", ludoLead: "اللودو التي تعرفها، مع أصدقائك ومع لاعبين من هلا — مباريات مباشرة داخل التطبيق.",
    ludo: [
      ["لاعبان أو أربعة أو فرق", "العب ضدّ خصم واحد، أو أربعة لاعبين، أو فريقين — أو أنشئ غرفة خاصة لأصدقائك."],
      ["دوريات وترتيب أسبوعي", "دوريات برونزية وفضية وذهبية بعملات لعب داخل اللعبة، وقائمة ترتيب تتجدّد كل أسبوع."],
      ["ادعُ من المحادثة", "أرسل دعوة لودو لمن تحادثه وافتحا المباراة مباشرة."],
    ],
    ludoNote: "عملات اللعب للتسلية داخل اللعبة فقط، ولا تُستبدل بمال أو بأي شيء خارجها.",
    faqTitle: "أسئلة شائعة",
    faqs: [
      ["هل الألعاب مجانية؟", "نعم، ألعاب المحادثة الأربع مجانية لكل المستخدمين."],
      ["هل أحتاج تنزيل شيء لألعب؟", "لا. الألعاب جزء من المحادثة في تطبيق هلا على iPhone وAndroid، وتعمل أيضاً من المتصفح على chathala.com بالحساب نفسه."],
      ["هل أستطيع اللعب مع أي شخص؟", "مع أي شخص بينكما محادثة مقبولة. تبدأ اللعبة حين يقبل الدعوة."],
      ["هل أستطيع إضافة أسئلتي؟", "نعم، من «أسئلتي» داخل قائمة الألعاب تضيف أسئلتك الخاصة، وتمرّ على فلاتر المحتوى قبل استعمالها."],
    ],
    more: "أفكار أكثر في مقال", moreLink: "ألعاب محادثة تكسر الجليد",
    ctaTitle: "جرّب أول لعبة الآن", ctaSub: "افتح محادثة وأرسل دعوة «هل تفضّل؟» — تحتاج أقل من دقيقة.",
  },
  en: {
    kicker: "Hala Games", h1a: "Play with the person you’re chatting to", h1b: "and the conversation takes care of itself",
    lead: "Four games built into the chat that break the ice from the first message: nothing extra to install and no leaving the conversation. Pick a game, the other person accepts, and the questions begin.",
    start: "Start free", chats: "Open your chats",
    gamesTitle: "The four chat games", gamesSub: "All of them are played by two people inside the chat itself, in the app and on the web.",
    example: "Example",
    games: [
      { t: "Truth or Dare", d: "On your turn you choose: a question to answer honestly, or a light dare to carry out. The game picks the question at random, so nobody is put on the spot for wording it.", ex: "Truth: what is the strangest habit you have that nobody knows about?" },
      { t: "Would You Rather", d: "Two options and no third. Each of you chooses in secret, then both choices are revealed together — and you find out whether you matched or the debate begins.", ex: "Sea and calm 🌊 or mountains and adventure ⛰️?" },
      { t: "Never Have I Ever", d: "A statement starting with “Never have I ever…” and each of you answers: I have, or I haven’t. Both answers appear together, and behind every “I have” there is a story to tell.", ex: "Never have I ever travelled alone to a country whose language I don’t speak." },
      { t: "Two Truths and a Lie", d: "Write three statements about yourself: two true and one made up, and the other person tries to spot the lie. The quickest way to get to know someone through their stories.", ex: "I climbed a mountain · I speak three languages · I have never been on a plane." },
    ],
    howTitle: "How do you start a game?",
    how: [
      ["Open any chat", "Tap the add (+) button in the message bar and choose “Games”."],
      ["Pick the game and level", "Send the invite; the game starts when the other person accepts."],
      ["Play and react", "The game card updates in place, and you can react to each answer and reply with a normal message."],
    ],
    safeTitle: "Respectful play", safe: [
      "A game is an invitation: it only starts when the other person accepts, and either of you can end it at any time.",
      "Questions are reviewed by the Hala team. The “bold” level is romantic and personal with no sexual content, for adults only and with both players’ consent.",
      "Anything you write yourself in a game goes through the same chat filters, and you can report any question or player.",
    ],
    ludoBadge: "Coming soon to the app", ludoTitle: "Hala Ludo", ludoLead: "The Ludo you know, with your friends and with players from Hala — live matches inside the app.",
    ludo: [
      ["Two players, four, or teams", "Play one opponent, four players, or two teams — or create a private room for your friends."],
      ["Leagues and a weekly leaderboard", "Bronze, silver and gold leagues played with in-game coins, and a leaderboard that resets every week."],
      ["Invite from a chat", "Send a Ludo invite to the person you’re chatting with and open the match together."],
    ],
    ludoNote: "Play coins are for fun inside the game only and cannot be exchanged for money or anything outside it.",
    faqTitle: "Frequently asked questions",
    faqs: [
      ["Are the games free?", "Yes, all four chat games are free for every user."],
      ["Do I need to download anything to play?", "No. The games are part of the chat in the Hala app on iPhone and Android, and they also work in the browser at chathala.com with the same account."],
      ["Can I play with anyone?", "With anyone you have an accepted chat with. The game starts when they accept the invite."],
      ["Can I add my own questions?", "Yes. Under “My questions” in the games menu you can add your own, and they pass through the content filters before use."],
    ],
    more: "More ideas in the article", moreLink: "Chat Games That Break the Ice",
    ctaTitle: "Try your first game now", ctaSub: "Open a chat and send a “Would You Rather” invite — it takes less than a minute.",
  },
} as const;

function Cta({ light, start, chats }: { light?: boolean; start: string; chats: string }) {
  const cls = light ? "bg-white text-[#D81B60]" : "text-white h-gradient shadow-[0_12px_30px_-10px_var(--h-primary)]";
  return (
    <>
      <Link href="/register" className={`auth-out inline-flex h-[52px] px-8 items-center rounded-full font-extrabold ${cls}`}>{start}</Link>
      <Link href="/chats" className={`auth-in inline-flex h-[52px] px-8 items-center gap-2 rounded-full font-extrabold ${cls}`}><MessageCircle size={19} /> {chats}</Link>
    </>
  );
}

export default function GamesView({ locale = "ar" }: { locale?: Locale }) {
  const t = T[locale];
  const faqLd = {
    "@context": "https://schema.org", "@type": "FAQPage", inLanguage: locale,
    mainEntity: t.faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <header className="text-center max-w-3xl mx-auto">
        <p className="inline-flex items-center gap-2 rounded-full border border-h-primary/30 bg-h-primary/8 px-4 py-1.5 text-sm font-bold text-h-primary"><Gamepad2 size={16} /> {t.kicker}</p>
        <h1 className="mt-5 text-4xl sm:text-5xl font-black leading-[1.35] sm:leading-[1.3] text-h-text">{t.h1a}<br /><span className="h-gradient-text">{t.h1b}</span></h1>
        <p className="mt-5 text-lg leading-8 text-h-text2">{t.lead}</p>
        <div className="mt-7 flex justify-center"><Cta start={t.start} chats={t.chats} /></div>
      </header>

      <section className="mt-20">
        <h2 className="text-3xl font-black text-center text-h-text">{t.gamesTitle}</h2>
        <p className="mt-3 text-center text-lg text-h-text2">{t.gamesSub}</p>
        <div className="mt-10 grid md:grid-cols-2 gap-4">
          {t.games.map((g, i) => {
            const { emoji, color } = GAME_STYLE[i];
            return (
              <article key={g.t} className="rounded-3xl bg-h-card border border-h-border p-6 sm:p-7">
                <div className="flex items-center gap-3.5">
                  <span aria-hidden className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)` }}>{emoji}</span>
                  <h3 className="text-xl font-black text-h-text">{g.t}</h3>
                </div>
                <p className="mt-4 text-[15px] leading-8 text-h-text2">{g.d}</p>
                <p className="mt-4 rounded-2xl bg-h-input px-4 py-3 text-[15px] leading-7 text-h-text">
                  <b className="text-xs font-extrabold block mb-0.5" style={{ color }}>{t.example}</b>{g.ex}
                </p>
              </article>
            );
          })}
        </div>
        <p className="mt-6 text-center text-h-text2 font-semibold">
          {t.more} <Link href={lp(locale, "/blog/chat-games-to-break-the-ice")} className="text-h-primary font-bold underline underline-offset-4">{t.moreLink}</Link>
        </p>
      </section>

      <section className="mt-20 grid lg:grid-cols-2 gap-4">
        <div className="rounded-3xl bg-h-card border border-h-border p-6 sm:p-8">
          <h2 className="text-2xl font-black text-h-text flex items-center gap-2.5"><Flame size={24} className="text-h-primary" /> {t.howTitle}</h2>
          <ol className="mt-6 space-y-5">
            {t.how.map(([title, d], i) => {
              const I = HOW_ICONS[i];
              return (
                <li key={title} className="flex gap-4">
                  <span className="w-11 h-11 rounded-2xl h-gradient text-white flex items-center justify-center shrink-0"><I size={20} /></span>
                  <span><b className="block font-extrabold text-h-text">{i + 1}. {title}</b><span className="text-[15px] leading-7 text-h-text2">{d}</span></span>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="rounded-3xl bg-h-card border border-h-border p-6 sm:p-8">
          <h2 className="text-2xl font-black text-h-text flex items-center gap-2.5"><ShieldCheck size={24} className="text-h-success" /> {t.safeTitle}</h2>
          <ul className="mt-6 space-y-4">
            {t.safe.map((s) => (
              <li key={s} className="flex gap-3 text-[15px] leading-7 text-h-text2"><ShieldCheck size={18} className="text-h-success shrink-0 mt-1" /> {s}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-20 rounded-[32px] border border-h-border bg-h-card p-6 sm:p-10 relative overflow-hidden">
        <div aria-hidden className="absolute -top-16 -end-10 text-[180px] opacity-10 select-none">🎲</div>
        <span className="inline-flex rounded-full bg-[#F59E0B]/15 text-[#D97706] px-3.5 py-1 text-sm font-extrabold">{t.ludoBadge}</span>
        <h2 className="mt-4 text-3xl font-black text-h-text">{t.ludoTitle}</h2>
        <p className="mt-2 text-lg leading-8 text-h-text2 max-w-2xl">{t.ludoLead}</p>
        <div className="mt-8 grid md:grid-cols-3 gap-4 relative">
          {t.ludo.map(([title, d], i) => {
            const I = LUDO_ICONS[i];
            return (
              <div key={title} className="rounded-2xl bg-h-bg border border-h-border p-5">
                <I size={26} className="text-[#F59E0B]" />
                <h3 className="mt-3 font-extrabold text-h-text">{title}</h3>
                <p className="mt-1.5 text-[15px] leading-7 text-h-text2">{d}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-5 text-sm text-h-text2">{t.ludoNote}</p>
      </section>

      <section className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-black text-h-text flex items-center gap-2.5"><HelpCircle size={24} className="text-h-primary" /> {t.faqTitle}</h2>
        <div className="mt-6 space-y-3">
          {t.faqs.map(([q, a]) => (
            <details key={q} className="group rounded-2xl bg-h-card border border-h-border">
              <summary className="cursor-pointer p-5 font-bold text-h-text">{q}</summary>
              <p className="px-5 pb-5 text-[15px] leading-7 text-h-text2">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-20 rounded-[36px] h-gradient p-10 sm:p-14 text-center text-white">
        <h2 className="text-3xl sm:text-4xl font-black">{t.ctaTitle}</h2>
        <p className="mt-3 text-white/85 text-lg">{t.ctaSub}</p>
        <div className="mt-7 flex flex-col items-center gap-5"><Cta light start={t.start} chats={t.chats} /><StoreBadges className="justify-center" /></div>
      </section>
    </div>
  );
}
