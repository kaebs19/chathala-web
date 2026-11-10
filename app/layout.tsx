import type { Metadata, Viewport } from "next";
import { Tajawal, Cairo } from "next/font/google";
import ToastContainer from "@/components/ui/Toast";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

// خط التطبيق (Cairo كما في iOS) — للصفحات داخل .hala
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

export const viewport: Viewport = {
  // لون شريط المتصفح يتبع الوضع (فاتح/داكن) كما في التطبيق
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F6F8" },
    { media: "(prefers-color-scheme: dark)", color: "#0D0010" },
  ],
  width: "device-width",
  initialScale: 1,
  // viewport-fit=cover: بدونه تبقى env(safe-area-inset-*) صفراً في iPhone (شريط التبويب تحت المؤشر السفلي)
  viewportFit: "cover",
  // no maximumScale — capping it blocks pinch-zoom for low-vision users
};

const DESCRIPTION =
  "هلا (ChatHala) تطبيق دردشة وتعارف عربي: اكتشف أشخاصاً قريبين منك، وابدأ محادثة فورية بالنصّ والصوت والصور، بخصوصية وأمان — مجاناً من الجوال أو المتصفح.";

export const metadata: Metadata = {
  metadataBase: new URL("https://chathala.com"),
  title: {
    default: "هلا — شات ودردشة وتعارف عربي | ChatHala",
    template: "%s | هلا — ChatHala",
  },
  description: DESCRIPTION,
  keywords: [
    "شات", "شات هلا", "هلا", "دردشة", "دردشة عربية", "تعارف", "تطبيق تعارف", "شات عربي",
    "دردشة سعودية", "شات بنات وشباب", "تعارف عرب", "غرف دردشة", "ChatHala", "Hala chat", "arab chat",
  ],
  authors: [{ name: "ChatHala" }],
  creator: "ChatHala",
  publisher: "ChatHala",
  applicationName: "هلا",
  category: "social networking",
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    title: "هلا — شات ودردشة وتعارف عربي",
    description: DESCRIPTION,
    url: "/",
    siteName: "هلا — ChatHala",
    locale: "ar_SA",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "هلا — دردشة وتعارف عربي" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "هلا — شات ودردشة وتعارف عربي",
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  verification: {
    google: "LPWFrnw1jaCNtgrh4XFA6il7DkaYLAxZz2QQBmIq5sM",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "هلا",
  },
  other: {
    "apple-itunes-app": "app-id=1369295351",
    "facebook-domain-verification": "j886ynnavctlytjrb562xetgro1tqa",
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      suppressHydrationWarning
      dir="rtl"
      className={`h-full antialiased ${tajawal.variable} ${cairo.variable}`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        {/*
          Marks signed-in state on <html> before first paint, so the header and
          hero can render the right call-to-action immediately. Reading it in a
          Server Component instead would mean cookies() — which opts the whole
          marketing page out of static rendering.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{document.documentElement.dataset.auth=localStorage.getItem('token')?'in':'out'}catch(e){document.documentElement.dataset.auth='out'}" +
              // وضع التطبيق (فاتح/داكن/النظام) قبل أول رسم — لا وميض
              ";try{var t=localStorage.getItem('hala-theme')||'system';if(t==='system')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
