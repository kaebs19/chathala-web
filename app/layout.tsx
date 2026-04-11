import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ChatHala - تواصل، اكتشف، تعارف",
    template: "%s | ChatHala",
  },
  description:
    "منصة تواصل اجتماعي عربية للتعارف والدردشة. اكتشف أشخاص جدد، تحدث بخصوصية تامة، وابنِ علاقات حقيقية.",
  keywords: [
    "تعارف",
    "دردشة",
    "شات",
    "تواصل",
    "ChatHala",
    "شات هلا",
    "تعارف عرب",
  ],
  openGraph: {
    title: "ChatHala - تواصل، اكتشف، تعارف",
    description:
      "منصة تواصل اجتماعي عربية للتعارف والدردشة. اكتشف أشخاص جدد وابنِ علاقات حقيقية.",
    url: "https://chathala.com",
    siteName: "ChatHala",
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatHala - تواصل، اكتشف، تعارف",
    description: "منصة تواصل اجتماعي عربية للتعارف والدردشة",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
