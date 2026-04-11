import Link from "next/link";
import Logo from "@/components/shared/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-accent-pink/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-accent-purple/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md mx-auto px-4 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Logo size="lg" />
          </Link>
        </div>

        {children}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-text-muted">
          <Link href="/privacy" className="hover:text-accent-pink">
            سياسة الخصوصية
          </Link>
          <span className="mx-2">·</span>
          <Link href="/terms" className="hover:text-accent-pink">
            شروط الاستخدام
          </Link>
        </div>
      </div>
    </div>
  );
}
