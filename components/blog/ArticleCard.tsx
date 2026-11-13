import Link from "next/link";
import { Clock } from "lucide-react";
import { CATEGORIES, readMinutes } from "@/lib/blog";
import type { Article } from "@/content/blog";
import { lp, type Locale } from "@/lib/i18n";

export default function ArticleCard({ article, locale, heading = "h3" }: { article: Article; locale: Locale; heading?: "h2" | "h3" }) {
  const doc = article[locale];
  const cat = CATEGORIES[article.category];
  const H = heading;
  const mins = readMinutes(doc.body);
  return (
    <article className="group relative flex flex-col rounded-3xl bg-h-card border border-h-border p-6 hover:border-h-primary/40 hover:-translate-y-0.5 transition">
      <span className="self-start rounded-full px-3 py-1 text-xs font-extrabold" style={{ background: `color-mix(in srgb, ${cat.color} 13%, transparent)`, color: cat.color }}>
        {cat[locale]}
      </span>
      <H className="mt-4 text-lg font-extrabold leading-8 text-h-text">
        <Link href={lp(locale, `/blog/${article.slug}`)} className="after:absolute after:inset-0 group-hover:text-h-primary transition-colors">
          {doc.title}
        </Link>
      </H>
      <p className="mt-2 text-[15px] leading-7 text-h-text2 line-clamp-3">{doc.description}</p>
      <p className="mt-auto pt-4 flex items-center gap-1.5 text-xs font-bold text-h-text2">
        <Clock size={14} /> {locale === "ar" ? `${mins} دقائق قراءة` : `${mins} min read`}
      </p>
    </article>
  );
}
