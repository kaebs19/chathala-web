# Brief for writing chathala.com blog articles

Site: chathala.com — "Hala" (هلا / ChatHala), an Arabic chat & friendship/dating app (iOS, Android, web). Adults only (18+).
Goal: genuinely useful, original articles for readers (and good enough for Google AdSense "valuable content" review).

## Files
For each article slug write TWO files in this directory:
- `<slug>.ar.ts` — Arabic (the primary version)
- `<slug>.en.ts` — English (a natural adaptation for English readers, NOT a word-for-word translation; same structure and advice)

Exact file shape (nothing else in the file):

```ts
import type { ArticleDoc } from "@/lib/blog";

const doc: ArticleDoc = {
  title: "…",
  description: "…",
  body: `
## First heading

Paragraph…
`,
};

export default doc;
```

- `title`: the title given in your assignment (you may polish slightly). Use double quotes; escape any inner `"` as `\"`.
- `description`: meta description, 120–160 characters, one sentence, no quotes inside.
- `body`: a template literal in a SMALL markdown subset — ONLY these are supported:
  - `## Heading` and `### Sub-heading` (no `#` H1 — the title is rendered separately)
  - plain paragraphs separated by a blank line
  - `- item` bullet lists, `1. item` numbered lists (one line per item)
  - `> text` callout (one line) for a key tip or warning
  - `**bold**` inline
  - `[link text](/path)` inline links (internal paths only)
  - NOTHING else: no tables, no images, no code, no HTML, no nested lists, no italics, no horizontal rules.
- NEVER use a backtick or `${` inside the body (it is a JS template literal). Avoid backslashes.

## Length & quality
- 750–1,000 words per language. 5–8 `##` sections. Start with a 2–3 sentence intro paragraph (no heading), end with a short closing section.
- Practical and specific: concrete examples, sample phrases, checklists. No filler, no keyword stuffing, no "in this article we will".
- Do NOT invent statistics, studies, quotes, laws, or organisation names. No numbers presented as research. General, truthful advice only.
- Arabic: clear modern standard Arabic, warm and direct, short sentences; sample chat lines may be light Gulf/white dialect. Address the reader in a way that works for both men and women (prefer neutral phrasing / masculine-generic the way Arabic sites do). Proper Arabic punctuation (، ؛ ؟).
- English: natural, plain, friendly. Sample chat lines in English.
- Tone respects Arab culture and families. No sexual content, nothing explicit, no pickup-artist manipulation tactics. Safety topics handled calmly, never victim-blaming.
- Not an advert: mention Hala at most 2 times per article, only where a real feature is relevant.

## True facts about Hala you may mention (do not claim anything else)
- 18+ only. Text, voice messages, photos and short videos (up to 15 seconds) in chat.
- A new conversation starts as a chat request the other person must accept.
- Disappearing ("view once") photos/videos exist; the app blocks screenshots of them on iPhone, but nobody can stop someone photographing a screen with another device.
- Block and Report are in the profile menu and inside the chat menu. Blocking keeps the chat read-only.
- Sharing outside-app handles/numbers (WhatsApp, Snapchat, Instagram, Telegram…) in chat is filtered, to protect users from scam accounts.
- Four in-chat games: Truth or Dare, Would You Rather, Never Have I Ever, Two Truths and a Lie.
- Stories that last 24 hours; friends list; discovery of people nearby (optional location, never an exact address).
- Privacy settings (e.g. hide last seen); you can hide your account temporarily or delete it.
- Works in the browser at chathala.com with the same account.
- Anyone (even without an account) can request removal of content at /report-content. Help: /support. Privacy policy: /privacy.
- Do NOT claim: end-to-end encryption, identity verification, 24/7 human moderation, AI matching, any statistics.

## Internal links
Include 2–3 internal links to other articles in the list below where genuinely relevant, plus optionally /support or /report-content.
- Arabic files link to `/blog/<slug>` (and `/support`, `/report-content`, `/privacy`)
- English files link to `/en/blog/<slug>` (and `/en/support`, `/report-content`, `/privacy/en`)

All article slugs (Arabic title | English title):
1. online-dating-safety-basics | أساسيات التعارف الآمن على الإنترنت | Online Dating Safety: The Basics
2. romance-scam-warning-signs | علامات النصب العاطفي وكيف تحمي نفسك | Romance Scams: Warning Signs and How to Protect Yourself
3. why-stay-in-app | لماذا لا تنتقل إلى واتساب أو سناب من أول محادثة؟ | Why You Shouldn't Move to WhatsApp or Snapchat Right Away
4. spot-fake-profiles | كيف تكشف الحساب الوهمي قبل أن تثق به | How to Spot a Fake Profile Before You Trust It
5. online-blackmail-what-to-do | الابتزاز الإلكتروني: ماذا تفعل إن هدّدك أحد؟ | Online Blackmail: What to Do If Someone Threatens You
6. first-meeting-safety | اللقاء الأول وجهاً لوجه: كيف تجعله آمناً | Meeting in Person for the First Time, Safely
7. how-to-start-a-conversation | كيف تبدأ محادثة مع شخص لا تعرفه | How to Start a Conversation with Someone New
8. first-message-examples | أول رسالة: أمثلة تنجح وأخرى تُتجاهَل | First Messages: Examples That Work and Ones That Get Ignored
9. keep-the-conversation-going | كيف تُبقي المحادثة ممتعة بعد «كيف حالك؟» | How to Keep a Conversation Going After "How Are You?"
10. questions-to-get-to-know-someone | 60 سؤالاً للتعارف تفتح أحاديث حقيقية | 60 Questions to Really Get to Know Someone
11. chat-games-to-break-the-ice | ألعاب محادثة تكسر الجليد | Chat Games That Break the Ice
12. voice-message-etiquette | آداب الرسائل الصوتية | Voice Message Etiquette
13. no-reply-and-rejection | لم يردّ عليك؟ كيف تتعامل مع الصمت والرفض | No Reply? Handling Silence and Rejection Gracefully
14. chat-mistakes-to-avoid | أخطاء شائعة تُنهي المحادثة قبل أن تبدأ | Common Mistakes That End a Chat Before It Starts
15. write-a-great-bio | كيف تكتب نبذة تعرّف بك فعلاً | How to Write a Bio That Actually Introduces You
16. choose-profile-photos | كيف تختار صور ملفك الشخصي | How to Choose Your Profile Photos
17. honest-profile-matters | لماذا الصدق في ملفك الشخصي يختصر عليك الطريق | Why an Honest Profile Saves You Time
18. when-to-block-and-report | متى تحظر ومتى تبلّغ؟ | When to Block and When to Report
19. protect-your-privacy-in-chat-apps | كيف تحمي خصوصيتك في تطبيقات الدردشة | Protecting Your Privacy in Chat Apps
20. what-not-to-share-online | معلومات لا تشاركها مع من تعرّفت عليه للتو | What Not to Share with Someone You Just Met Online
21. disappearing-photos-explained | الصور المؤقتة: ما الذي تحميه وما الذي لا تحميه | Disappearing Photos: What They Protect and What They Don't
22. online-friendships-that-last | كيف تبني صداقة عبر الإنترنت تدوم | Building Online Friendships That Last
23. shy-in-chat-tips | خجول في الدردشة؟ خطوات صغيرة تصنع فرقاً | Shy in Chats? Small Steps That Help
24. healthy-chat-habits | عادات صحية لاستخدام تطبيقات الدردشة | Healthy Habits for Using Chat Apps

## Rules for you
- Write ONLY your assigned files in this directory. Do not edit any other file, do not run git, npm or builds.
- When done, re-read each file once to check: valid TS shape, no backticks/`${` in body, only the allowed markdown, word count in range.
- Final reply: just the list of files written and their approximate word counts.
