import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AppShell from "@/components/hala/AppShell";
import AdSenseScript from "@/components/shared/AdSenseScript";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <AdSenseScript />
      <Header />
      <main className="pt-20 min-h-screen">{children}</main>
      <Footer />
    </AppShell>
  );
}
