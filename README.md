# chathala-web

واجهة الويب لـ ChatHala — Next.js 16 (App Router) + React 19 + Tailwind 4 + Zustand.

## التشغيل محلياً

```bash
npm install
npm run dev
```

يحتاج ملف `.env.local` (غير مُتتبَّع في git):

```
NEXT_PUBLIC_API_URL=https://matchhala.khalafiati.io/api
NEXT_PUBLIC_SOCKET_URL=https://matchhala.khalafiati.io
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google oauth client id>
INTERNAL_API_URL=http://127.0.0.1:3000/api   # على السيرفر فقط
```

`INTERNAL_API_URL` مهم على السيرفر: الجلب من طرف السيرفر لا يستطيع استخدام
الدومين العام لأن السيرفر لا يصل إلى دومينه (يرجع `HTTP 000`). المتغيرات التي
تبدأ بـ `NEXT_PUBLIC_` تُدمج وقت البناء، لذا أي تغيير فيها يستلزم إعادة بناء.

## النشر

```bash
./deploy.sh
```

السكربت يفحص الأنواع ويبني محلياً، ثم يدفع، ثم يبني على السيرفر ويعيد التشغيل
ويتحقق من الصفحات.

### لماذا ريموتان

| الريموت | الوجهة | الدور |
|---|---|---|
| `origin` | GitHub (خاص) | الحفظ والتاريخ |
| `contabo` | `ssh://contabo/var/www/chathala-web` | النشر الفعلي |

السيرفر **لا يستطيع** السحب من GitHub — الريبو خاص وليس على السيرفر مفتاح نشر.
لذلك يُدفع إليه مباشرة عبر SSH، وهو ممكن لأن مستودعه مضبوط على:

```bash
git config receive.denyCurrentBranch updateInstead
```

`origin` على السيرفر ما زال يشير إلى GitHub لتوثيق المصدر فقط — لا تحاول
`git pull` هناك، ستفشل.

البناء لا بد أن يتم **على السيرفر**: `next/font` و`next/image` يولّدان أصولاً
وقت البناء، ومجلد `.next` غير مُتتبَّع.

## ملاحظات معمارية

- **الصور**: الـ API يخزّن ثلاث نسخ لكل رفع (`thumb` 150px، `medium` 370px،
  `original` 740px). استخدم `getImageUrl(path, variant)` واطلب المقاس المعروض
  فعلاً. `<img>` مقصود في مواضع صور المستخدمين — النسخ جاهزة WebP بالمقاس
  الصحيح، و`next/image` سيعيد ترميز 38 ألف صورة على السيرفر بلا مقابل يُذكر.
- **حالة الدخول**: سكربت داخل `<head>` يضبط `[data-auth]` على `<html>` قبل أول
  رسم، وCSS يبدّل بين `.auth-in` و`.auth-out`. البديل (قراءة كوكي على السيرفر)
  يلغي التصيير الساكن للصفحة التسويقية.
- **الأخطاء**: استخدم `logError`/`logWarn` من `lib/logger.ts` بدل `catch {}`
  الفارغة — واحدة منها أخفت انقطاعاً في الإنتاج لأيام.
