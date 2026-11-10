/**
 * طبقة الدفع على الويب — منفصلة عن الواجهة كي يُبدَّل المزوّد دون لمس الصفحات.
 *
 * التدفّق المقصود (حين يُربط مزوّد سعودي مثل Moyasar أو Tap):
 *   1. الواجهة: provider.startCheckout(plan) ← يطلب من خادمنا جلسة دفع
 *      (POST /api/v2/mobile/subscription/web-checkout { planId }) — لم يُكتب بعد.
 *   2. الخادم ينشئ الدفعة عند المزوّد بالمفتاح السري (لا مفاتيح سرية في المتصفح)
 *      ويعيد رابط صفحة الدفع أو بيانات النموذج المضمَّن.
 *   3. بعد الدفع: المزوّد يستدعي webhook عندنا ← الخادم يتحقق من التوقيع ويضبط
 *      isPremium/premiumPlan/premiumExpiresAt (الحقول نفسها التي يضبطها شراء iOS)،
 *      فيرى المشترك مزاياه على الويب والتطبيق معاً.
 *   4. الواجهة تعود إلى /premium?status=… وتسأل /subscription/status.
 */
export type PlanId = "weekly" | "monthly" | "quarterly";

export interface Plan {
  id: PlanId;
  name: string;
  /** السعر بالريال — null = لم يُحدَّد بعد فلا تُعرض الخطة */
  priceSAR: number | null;
  periodLabel: string;
  days: number;
  badge?: string;
  superLikesPerDay: number;
}

export type CheckoutResult =
  | { status: "redirect"; url: string }
  | { status: "unavailable"; message: string }
  | { status: "error"; message: string };

export interface PaymentProvider {
  id: "none" | "moyasar" | "tap";
  label: string;
  /** هل الدفع متاح فعلاً (حساب تاجر + مفاتيح + مسار الخادم) */
  available: boolean;
  startCheckout(plan: Plan): Promise<CheckoutResult>;
}
