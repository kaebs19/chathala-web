import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AppShell from "@/components/hala/AppShell";
import type { Metadata } from "next";
import { Features, FinalCta, Hero, StartHere, Stats } from "@/components/landing/HomeSections";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/links";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// بيانات منظّمة: المنظمة والموقع والتطبيق (iOS/Android/الويب) — بلا تقييمات مختلقة
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: "هلا",
      alternateName: ["ChatHala", "شات هلا", "Hala Chat"],
      url: SITE_URL,
      logo: `${SITE_URL}/images/logo.png`,
      sameAs: [APP_STORE_URL, GOOGLE_PLAY_URL],
      contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: "info@chathala.com", availableLanguage: ["Arabic", "English"] },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "هلا — شات ودردشة وتعارف عربي",
      alternateName: "ChatHala",
      inLanguage: "ar",
      publisher: { "@id": `${SITE_URL}/#org` },
    },
    {
      "@type": "SoftwareApplication",
      name: "هلا — ChatHala",
      applicationCategory: "SocialNetworkingApplication",
      operatingSystem: "iOS, Android, Web",
      url: SITE_URL,
      inLanguage: "ar",
      description: "تطبيق دردشة وتعارف عربي: اكتشف أشخاصاً قريبين منك وابدأ محادثة فورية بالنصّ والصوت والصور.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "SAR" },
      downloadUrl: [APP_STORE_URL, GOOGLE_PLAY_URL],
      publisher: { "@id": `${SITE_URL}/#org` },
    },
  ],
};

// الرئيسية للزائر: بهوية التطبيق (فاتح/داكن). لا صور مستخدمين حقيقيين هنا —
// المحادثة في الواجهة توضيحية (ChatMockup)، وكان «مستخدمون يتواصلون الآن» يعرض أسماء وصوراً حقيقية لكل زائر.
export default function Home() {
  return (
    <AppShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <Header />
      <main>
        <Hero />
        <Stats />
        <Features />
        <StartHere />
        <FinalCta />
      </main>
      <Footer />
    </AppShell>
  );
}
