import Link from "next/link";
import type { ReactNode } from "react";

// يرسم Markdown المصغّر لمقالات المدوّنة (انظر ArticleDoc في lib/blog.ts) بلا مكتبة:
// ## و### · فقرات · قوائم - و1. · > تنبيه · **غامق** · [نصّ](/رابط)

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyBase}-${i++}`;
    if (m[1] !== undefined) out.push(<strong key={key}>{m[1]}</strong>);
    else if (m[3].startsWith("/")) out.push(<Link key={key} href={m[3]}>{m[2]}</Link>);
    else out.push(<a key={key} href={m[3]} target="_blank" rel="noopener noreferrer nofollow">{m[2]}</a>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function slugifyHeading(text: string): string {
  return text.trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").toLowerCase();
}

export default function ArticleBody({ body }: { body: string }) {
  const lines = body.replace(/\r/g, "").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let k = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }
    const key = `b${k++}`;
    if (line.startsWith("### ")) { blocks.push(<h3 key={key}>{inline(line.slice(4), key)}</h3>); i++; continue; }
    if (line.startsWith("## ")) {
      const t = line.slice(3);
      blocks.push(<h2 key={key} id={slugifyHeading(t)}>{inline(t, key)}</h2>);
      i++; continue;
    }
    if (line.startsWith("> ")) {
      const parts: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) { parts.push(lines[i].trim().slice(2)); i++; }
      blocks.push(<aside key={key} className="article-callout">{inline(parts.join(" "), key)}</aside>);
      continue;
    }
    if (/^[-•]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-•]\s+/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^[-•]\s+/, "")); i++; }
      blocks.push(<ul key={key}>{items.map((t, n) => <li key={n}>{inline(t, `${key}-${n}`)}</li>)}</ul>);
      continue;
    }
    if (/^\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^\d+[.)]\s+/, "")); i++; }
      blocks.push(<ol key={key}>{items.map((t, n) => <li key={n}>{inline(t, `${key}-${n}`)}</li>)}</ol>);
      continue;
    }
    const para: string[] = [];
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t || t.startsWith("#") || t.startsWith("> ") || /^[-•]\s+/.test(t) || /^\d+[.)]\s+/.test(t)) break;
      para.push(t); i++;
    }
    blocks.push(<p key={key}>{inline(para.join(" "), key)}</p>);
  }
  return <div className="article-body">{blocks}</div>;
}
