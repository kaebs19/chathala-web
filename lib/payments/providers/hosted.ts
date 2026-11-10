import { api } from "@/lib/api";
import type { PaymentProvider, Plan } from "../types";

/**
 * مزوّد بصفحة دفع مستضافة (Moyasar / Tap كلاهما يدعمها): الخادم ينشئ الدفعة ويعيد رابطها.
 * يبقى available=false حتى يُكتب مسار الخادم web-checkout والـ webhook ويُضبط حساب التاجر.
 */
function hosted(id: "moyasar" | "tap", label: string): PaymentProvider {
  return {
    id,
    label,
    available: false,
    async startCheckout(plan: Plan) {
      const r = await api<{ url?: string }>("/v2/mobile/subscription/web-checkout", { body: { planId: plan.id, provider: id } });
      const url = r.data?.url;
      if (r.success && url) return { status: "redirect", url };
      return { status: "error", message: r.message || "تعذّر بدء الدفع" };
    },
  };
}

export const moyasarProvider = hosted("moyasar", "Moyasar");
export const tapProvider = hosted("tap", "Tap");
