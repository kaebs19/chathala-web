import Link from "next/link";
import Button from "@/components/ui/Button";
import { Smartphone, Globe, ArrowLeft } from "lucide-react";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/links";

export default function DownloadCTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-bg opacity-10" />
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-accent-pink/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-bg-card border border-border rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            جاهز تبدأ؟
          </h2>
          <p className="text-text-muted text-lg max-w-xl mx-auto mb-8">
            حمّل التطبيق الآن أو استخدم النسخة الويب — التسجيل مجاني تماماً!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            {/* App Store */}
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-bg-input border border-border rounded-xl px-6 py-3 hover:border-accent-pink/50 transition-all"
            >
              <Smartphone size={28} className="text-accent-pink" />
              <div className="text-right">
                <div className="text-xs text-text-muted">حمّل من</div>
                <div className="text-base font-bold">App Store</div>
              </div>
            </a>

            {/* Google Play */}
            <a
              href={GOOGLE_PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-bg-input border border-border rounded-xl px-6 py-3 hover:border-accent-pink/50 transition-all"
            >
              <Smartphone size={28} className="text-success" />
              <div className="text-right">
                <div className="text-xs text-text-muted">حمّل من</div>
                <div className="text-base font-bold">Google Play</div>
              </div>
            </a>

            {/* Web App */}
            <Link
              href="/register"
              className="flex items-center gap-3 bg-bg-input border border-border rounded-xl px-6 py-3 hover:border-accent-pink/50 transition-all"
            >
              <Globe size={28} className="text-accent-purple" />
              <div className="text-right">
                <div className="text-xs text-text-muted">استخدم</div>
                <div className="text-base font-bold">نسخة الويب</div>
              </div>
            </Link>
          </div>

          <Link href="/register">
            <Button size="lg">
              سجّل الآن مجاناً
              <ArrowLeft size={18} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
