// عناوين الـ API ثابتة عمداً: متغيرات NEXT_PUBLIC_* في .env كانت تشير إلى
// matchhala.khalafiati.io الميت (لا DNS) — فانقطع السوكِت على الموقع بصمت.
// يمكن تجاوزها بـ NEXT_PUBLIC_HALA_API_ORIGIN للتطوير فقط.
export const API_ORIGIN =
  process.env.NEXT_PUBLIC_HALA_API_ORIGIN || "https://matchhala.chathala.com";

// الطلبات من المتصفح تذهب للـ API مباشرة (CORS يسمح بـ chathala.com) لا عبر وكيل Next:
// عبر الوكيل يرى الخادم كل الزوّار بعنوان 127.0.0.1، فيصير حدّ محاولات الدخول
// (20/15 دقيقة لكل IP) وحدّ الطلبات العام حدّاً واحداً لكل زوّار الموقع.
export const API_BASE = `${API_ORIGIN}/api`;
export const MOBILE = "/v2/mobile";
export const SOCKET_URL = API_ORIGIN;
