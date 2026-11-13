import type { Metadata } from "next";
import BlogIndexView from "@/components/blog/BlogIndexView";
import { pageMeta } from "@/lib/seo";
import { hreflang } from "@/lib/i18n";

export const metadata: Metadata = pageMeta({
  title: "المقالات — تعارف آمن ومحادثة أحلى",
  description: "مقالات فريق هلا: كيف تبدأ محادثة، كيف تحمي خصوصيتك وتكشف الحسابات الوهمية، وكيف تبني علاقات محترمة في تطبيقات الدردشة.",
  path: "/blog", languages: hreflang("/blog"),
});

export default function BlogPage() {
  return <BlogIndexView locale="ar" />;
}
