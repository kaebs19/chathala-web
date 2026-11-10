import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AppShell from "@/components/hala/AppShell";
import { Features, FinalCta, Hero, StartHere, Stats } from "@/components/landing/HomeSections";

// الرئيسية للزائر: بهوية التطبيق (فاتح/داكن). لا صور مستخدمين حقيقيين هنا —
// المحادثة في الواجهة توضيحية (ChatMockup)، وكان «مستخدمون يتواصلون الآن» يعرض أسماء وصوراً حقيقية لكل زائر.
export default function Home() {
  return (
    <AppShell>
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
