import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AppShell from "@/components/hala/AppShell";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <Header />
      <main className="pt-20 min-h-screen">{children}</main>
      <Footer />
    </AppShell>
  );
}
