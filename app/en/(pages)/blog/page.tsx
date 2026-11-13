import type { Metadata } from "next";
import BlogIndexView from "@/components/blog/BlogIndexView";
import { pageMeta } from "@/lib/seo";
import { hreflang } from "@/lib/i18n";

export const metadata: Metadata = pageMeta({
  title: "Blog — Safer Chats, Better Conversations",
  description: "Practical guides from the Hala team on starting conversations, online safety, privacy and building respectful relationships in chat apps.",
  path: "/en/blog", languages: hreflang("/blog"), locale: "en",
});

export default function BlogPageEn() {
  return <BlogIndexView locale="en" />;
}
