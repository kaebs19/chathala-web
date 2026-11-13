import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleView from "@/components/blog/ArticleView";
import { ARTICLES, getArticle } from "@/content/blog";
import { pageMeta } from "@/lib/seo";
import { hreflang } from "@/lib/i18n";

// المقالات ثابتة وقت البناء؛ أي slug آخر = 404
export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const doc = article.ar;
  return pageMeta({
    title: doc.title,
    description: doc.description,
    path: `/blog/${slug}`, languages: hreflang(`/blog/${slug}`), type: "article",
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  return <ArticleView article={article} locale="ar" />;
}
