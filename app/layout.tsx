import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import ToastContainer from "@/components/ui/Toast";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0D0010",
  width: "device-width",
  initialScale: 1,
  // no maximumScale — capping it blocks pinch-zoom for low-vision users
};

export const metadata: Metadata = {
  title: {
    default: "ChatHala - شات هلا | تواصل، اكتشف، تعارف",
    template: "%s | ChatHala شات هلا",
  },
  description:
    "ChatHala شات هلا — منصة تواصل اجتماعي عربية للتعارف والدردشة الآمنة. اكتشف أشخاص جدد قريبين منك، تحدث بخصوصية تامة، وابنِ علاقات حقيقية. حمّل التطبيق مجاناً!",
  keywords: [
    "تعارف",
    "دردشة",
    "شات",
    "تواصل",
    "ChatHala",
    "شات هلا",
    "تعارف عرب",
    "دردشة عربية",
    "تطبيق تعارف",
    "chat",
    "dating",
    "arab chat",
    "hala chat",
  ],
  authors: [{ name: "ChatHala" }],
  creator: "ChatHala",
  publisher: "ChatHala",
  applicationName: "ChatHala",
  metadataBase: new URL("https://chathala.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ChatHala - شات هلا | تواصل، اكتشف، تعارف",
    description:
      "منصة تواصل اجتماعي عربية للتعارف والدردشة. اكتشف أشخاص جدد وابنِ علاقات حقيقية.",
    url: "https://chathala.com",
    siteName: "ChatHala شات هلا",
    locale: "ar_SA",
    type: "website",
    images: [
      {
        url: "/images/logo.png",
        width: 512,
        height: 512,
        alt: "ChatHala شات هلا",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatHala - شات هلا | تواصل، اكتشف، تعارف",
    description:
      "منصة تواصل اجتماعي عربية للتعارف والدردشة الآمنة",
    images: ["/images/logo.png"],
  },
  robots: { index: true, follow: true },
  verification: {
    google: "LPWFrnw1jaCNtgrh4XFA6il7DkaYLAxZz2QQBmIq5sM",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ChatHala",
  },
  other: {
    "apple-itunes-app": "app-id=1369295351",
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
      dir="rtl"
      className={`h-full antialiased ${tajawal.variable}`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full flex flex-col">
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
