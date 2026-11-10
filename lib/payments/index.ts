import { noneProvider } from "./providers/none";
import { moyasarProvider, tapProvider } from "./providers/hosted";
import type { PaymentProvider } from "./types";

export * from "./types";
export { PLANS, COMPARISON } from "./plans";

/** المزوّد الفعّال — يُبدَّل بمتغيّر بيئة وقت البناء: NEXT_PUBLIC_PAYMENT_PROVIDER=moyasar|tap */
export function getPaymentProvider(): PaymentProvider {
  switch (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER) {
    case "moyasar": return moyasarProvider;
    case "tap": return tapProvider;
    default: return noneProvider;
  }
}
