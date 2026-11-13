import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AppShell from "@/components/hala/AppShell";
import AdSenseScript from "@/components/shared/AdSenseScript";
import LocaleAttrs from "@/components/shared/LocaleAttrs";

// النسخة الإنجليزية من الصفحات العامة (/en…). التطبيق نفسه (التسجيل، المحادثات…) عربي فقط حتى الآن.
export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <AdSenseScript />
      <LocaleAttrs lang="en" dir="ltr" />
      <div lang="en" dir="ltr">
        <Header />
        {children}
        <Footer />
      </div>
    </AppShell>
  );
}
