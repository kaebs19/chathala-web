import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import ArticleBody from "@/components/blog/ArticleBody";
import ArticleCard from "@/components/blog/ArticleCard";
import StoreBadges from "@/components/landing/StoreBadges";
import { relatedArticles, type Article } from "@/content/blog";
import { CATEGORIES, formatDate, readMinutes } from "@/lib/blog";
import { SITE_URL } from "@/lib/seo";
import { lp, type Locale } from "@/lib/i18n";

const T = {
  ar: {
    home: "الرئيسية", blog: "المقالات", crumbs: "مسار الصفحة", by: "فريق هلا", read: (n: number) => `${n} دقائق قراءة`,
    related: "مقالات ذات صلة", ctaTitle: "جرّب ما قرأته في محادثة حقيقية", ctaBody: "هلا تطبيق دردشة وتعارف عربي للبالغين (18+): ابدأ من المتصفح مباشرة أو حمّل التطبيق.",
    ctaStart: "ابدأ مجاناً", ctaChats: "افتح محادثاتك",
  },
  en: {
    home: "Home", blog: "Blog", crumbs: "Breadcrumb", by: "The Hala team", read: (n: number) => `${n} min read`,
    related: "Related articles", ctaTitle: "Try it in a real conversation", ctaBody: "Hala is an Arabic chat and friendship app for adults (18+): start right in your browser or download the app.",
    ctaStart: "Start free", ctaChats: "Open your chats",
  },
} as const;

export default function ArticleView({ article, locale }: { article: Article; locale: Locale }) {
  const t = T[locale];
  const doc = article[locale];
  const cat = CATEGORIES[article.category];
  const url = SITE_URL + lp(locale, `/blog/${article.slug}`);
  const Sep = locale === "ar" ? ChevronLeft : ChevronRight;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: doc.title,
        description: doc.description,
        inLanguage: locale,
        datePublished: article.date,
        dateModified: article.updated || article.date,
        articleSection: cat[locale],
        mainEntityOfPage: url,
        image: `${SITE_URL}/og.png`,
        author: { "@type": "Organization", name: locale === "ar" ? "فريق هلا" : "Hala Team", url: SITE_URL + lp(locale, "/about") },
        publisher: { "@type": "Organization", name: "ChatHala", logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.png` } },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.home, item: SITE_URL + lp(locale, "/") },
          { "@type": "ListItem", position: 2, name: t.blog, item: SITE_URL + lp(locale, "/blog") },
          { "@type": "ListItem", position: 3, name: doc.title, item: url },
        ],
      },
    ],
  };
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <article className="max-w-3xl mx-auto">
        <nav aria-label={t.crumbs} className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-h-text2">
          <Link href={lp(locale, "/")} className="hover:text-h-primary">{t.home}</Link>
          <Sep size={15} />
          <Link href={lp(locale, "/blog")} className="hover:text-h-primary">{t.blog}</Link>
          <Sep size={15} />
          <Link href={`${lp(locale, "/blog")}#${article.category}`} style={{ color: cat.color }}>{cat[locale]}</Link>
        </nav>

        <h1 className="mt-5 text-3xl sm:text-[42px] font-black leading-[1.45] sm:leading-[1.4] text-h-text">{doc.title}</h1>
        <p className="mt-4 text-lg leading-8 text-h-text2">{doc.description}</p>
        <p className="mt-5 pb-6 border-b border-h-border flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold text-h-text2">
          <span>{t.by}</span>
          <span className="flex items-center gap-1.5"><CalendarDays size={15} /> <time dateTime={article.date}>{formatDate(article.date, locale)}</time></span>
          <span className="flex items-center gap-1.5"><Clock size={15} /> {t.read(readMinutes(doc.body))}</span>
        </p>

        <div className="mt-8">
          <ArticleBody body={doc.body} />
        </div>

        <aside className="mt-12 rounded-3xl h-gradient p-7 sm:p-9 text-white text-center">
          <h2 className="text-2xl font-black">{t.ctaTitle}</h2>
          <p className="mt-2 text-white/85 leading-7">{t.ctaBody}</p>
          <div className="mt-6 flex flex-col items-center gap-4">
            <Link href="/register" className="auth-out inline-flex h-12 px-8 items-center rounded-full bg-white text-[#D81B60] font-extrabold">{t.ctaStart}</Link>
            <Link href="/chats" className="auth-in inline-flex h-12 px-8 items-center rounded-full bg-white text-[#D81B60] font-extrabold">{t.ctaChats}</Link>
            <StoreBadges className="justify-center" />
          </div>
        </aside>
      </article>

      <section className="mt-16">
        <h2 className="text-2xl font-black text-h-text mb-5">{t.related}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatedArticles(article.slug).map((a) => <ArticleCard key={a.slug} article={a} locale={locale} />)}
        </div>
      </section>
    </div>
  );
}
