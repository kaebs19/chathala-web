import ArticleCard from "@/components/blog/ArticleCard";
import { ARTICLES } from "@/content/blog";
import { CATEGORIES, type CategoryKey } from "@/lib/blog";
import { SITE_URL } from "@/lib/seo";
import { lp, type Locale } from "@/lib/i18n";

const T = {
  ar: {
    kicker: "مقالات هلا", h1: "تعارف آمن ومحادثة أحلى",
    lead: "أدلّة عملية عن بدء المحادثة، حماية الخصوصية، كشف الحسابات الوهمية، وبناء علاقات محترمة على الإنترنت — يكتبها فريق هلا من خبرته في إدارة تطبيق دردشة عربي.",
    nav: "أقسام المقالات", count: (n: number) => `${n} مقالات`,
  },
  en: {
    kicker: "The Hala Blog", h1: "Safer chats, better conversations",
    lead: "Practical guides on starting a conversation, protecting your privacy, spotting fake accounts and building respectful relationships online — written by the Hala team from our experience running an Arabic chat app.",
    nav: "Article sections", count: (n: number) => `${n} articles`,
  },
} as const;

export default function BlogIndexView({ locale = "ar" }: { locale?: Locale }) {
  const t = T[locale];
  const cats = (Object.keys(CATEGORIES) as CategoryKey[]).map((key) => ({ key, items: ARTICLES.filter((a) => a.category === key) })).filter((c) => c.items.length);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: locale === "ar" ? "مقالات هلا" : "The Hala Blog",
    url: SITE_URL + lp(locale, "/blog"),
    inLanguage: locale,
    publisher: { "@id": `${SITE_URL}/#org` },
    blogPost: ARTICLES.map((a) => ({ "@type": "BlogPosting", headline: a[locale].title, url: SITE_URL + lp(locale, `/blog/${a.slug}`), datePublished: a.date })),
  };
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <header className="text-center max-w-3xl mx-auto">
        <p className="text-sm font-extrabold text-h-primary">{t.kicker}</p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-black leading-tight text-h-text">{t.h1}</h1>
        <p className="mt-4 text-lg leading-8 text-h-text2">{t.lead}</p>
      </header>

      <nav aria-label={t.nav} className="mt-8 flex flex-wrap justify-center gap-2">
        {cats.map(({ key }) => (
          <a key={key} href={`#${key}`} className="h-10 px-4 rounded-full flex items-center text-sm font-bold bg-h-card border border-h-border text-h-text2 hover:text-h-text hover:border-h-primary/50 transition">
            {CATEGORIES[key][locale]}
          </a>
        ))}
      </nav>

      {cats.map(({ key, items }) => (
        <section key={key} id={key} className="mt-14 scroll-mt-24">
          <div className="flex items-baseline justify-between gap-4 mb-5">
            <h2 className="text-2xl font-black text-h-text flex items-center gap-2.5">
              <span className="w-2.5 h-7 rounded-full" style={{ background: CATEGORIES[key].color }} />
              {CATEGORIES[key][locale]}
            </h2>
            <span className="text-sm font-bold text-h-text2">{t.count(items.length)}</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((a) => <ArticleCard key={a.slug} article={a} locale={locale} />)}
          </div>
        </section>
      ))}
    </div>
  );
}
