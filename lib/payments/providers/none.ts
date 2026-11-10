import type { PaymentProvider } from "../types";

/** الافتراضي اليوم: لا مزوّد مربوط. */
export const noneProvider: PaymentProvider = {
  id: "none",
  label: "قريباً",
  available: false,
  async startCheckout() {
    return { status: "unavailable", message: "الاشتراك من الموقع قريباً. يمكنك الاشتراك الآن من تطبيق هلا، ومزاياك تظهر هنا تلقائياً." };
  },
};
