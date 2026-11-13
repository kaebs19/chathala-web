import Link from "next/link";
import ArticleCard from "@/components/blog/ArticleCard";
import { SectionHead } from "@/components/landing/HomeSections";
import { ARTICLES } from "@/content/blog";
import { lp, type Locale } from "@/lib/i18n";

// ثلاث مقالات على الرئيسية: واحدة من كل قسم رئيسي (أمان، محادثة، خصوصية)
const PICKS = ["online-dating-safety-basics", "how-to-start-a-conversation", "protect-your-privacy-in-chat-apps"];

const T = {
  ar: { kicker: "المقالات", title: "نصائح لتعارف آمن ومحادثة أحلى", sub: "أدلّة عملية يكتبها فريق هلا: كيف تبدأ، كيف تحمي نفسك، وكيف تُبقي السالفة ممتعة.", all: "كل المقالات" },
  en: { kicker: "Blog", title: "Tips for safer, better conversations", sub: "Practical guides from the Hala team: how to start, how to stay safe, and how to keep a chat enjoyable.", all: "All articles" },
} as const;

export default function LatestArticles({ locale = "ar" }: { locale?: Locale }) {
  const t = T[locale];
  const picks = PICKS.map((s) => ARTICLES.find((a) => a.slug === s)).filter((a) => !!a);
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
      <SectionHead kicker={t.kicker} title={t.title} sub={t.sub} />
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {picks.map((a) => <ArticleCard key={a.slug} article={a} locale={locale} />)}
      </div>
      <div className="mt-8 text-center">
        <Link href={lp(locale, "/blog")} className="inline-flex h-12 px-7 items-center rounded-full font-bold text-h-text bg-h-card border border-h-border hover:border-h-primary/50 transition">{t.all}</Link>
      </div>
    </section>
  );
}
