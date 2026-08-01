import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero, { type FeaturedUser } from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import DownloadCTA from "@/components/landing/DownloadCTA";

// Fetched here rather than in the browser so the showcase ships in the HTML —
// swapping it in after mount shifted the whole vertically-centred hero (CLS).
async function getFeaturedUsers(): Promise<FeaturedUser[]> {
  // Server-side, so prefer the loopback address: the host cannot resolve its
  // own public domain, which makes a NEXT_PUBLIC_API_URL fetch fail silently.
  // Mirrors the rewrite target in next.config.ts.
  const base =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://matchhala.chathala.com/api";
  try {
    const res = await fetch(`${base}/users/featured`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      console.error(`[featured] ${base} returned HTTP ${res.status}`);
      return [];
    }
    const data = await res.json();
    if (!data.success || !data.data) {
      console.error("[featured] unexpected payload shape", data?.success);
      return [];
    }
    const list: FeaturedUser[] = Array.isArray(data.data)
      ? data.data
      : data.data.users || [];
    return list.slice(0, 12);
  } catch (err) {
    // Falls back to the placeholder avatars — but say so, rather than
    // letting the showcase quietly disappear the way it did before.
    console.error(`[featured] fetch failed for ${base}:`, err);
    return [];
  }
}

export default async function Home() {
  const users = await getFeaturedUsers();

  return (
    <>
      <Header />
      <main>
        <Hero users={users} />
        <Features />
        <HowItWorks />
        <DownloadCTA />
      </main>
      <Footer />
    </>
  );
}
