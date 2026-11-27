import type { Metadata, Viewport } from "next";
import "@fontsource/tajawal/300.css";
import "@fontsource/tajawal/400.css";
import "@fontsource/tajawal/500.css";
import "@fontsource/tajawal/700.css";
import "@fontsource/tajawal/800.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://fatoura.ma"),
  title: {
    default: "فاتورا — فاتورتك الرسمية في 30 ثانية",
    template: "%s · فاتورا",
  },
  description:
    "أداة فواتير عربية للرواد والمقاولين الذاتيين في المغرب: ترقيم تلقائي، فحص ICE وIF، مبلغ بالحروف، رابط مشاركة، وتصدير PDF. بياناتك تبقى في جهازك.",
  keywords: ["فاتورة", "مقاول ذاتي", "رواد", "المغرب", "facture", "auto-entrepreneur", "devis", "Maroc"],
  openGraph: {
    title: "فاتورا — فاتورتك الرسمية في 30 ثانية",
    description: "فواتير قانونية بالعربية والفرنسية، بدون تسجيل، وبياناتك تبقى عندك.",
    locale: "ar_MA",
    type: "website",
    siteName: "فاتورا",
  },
  twitter: {
    card: "summary_large_image",
    title: "فاتورا — فاتورتك الرسمية في 30 ثانية",
    description: "فواتير قانونية بالعربية والفرنسية، بدون تسجيل، وبياناتك تبقى عندك.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0B5D50",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-sans bg-paper text-ink">{children}</body>
    </html>
  );
}
