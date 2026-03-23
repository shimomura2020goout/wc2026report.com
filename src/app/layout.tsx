import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LocaleProvider from "@/components/LocaleProvider";
import { WebsiteJsonLd } from "@/components/JsonLd";
import { getLocaleFromCookies, getDictionary } from "@/i18n/index";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const BASE_URL = "https://www.wc2026report.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "W杯2026 × toto｜FIFA ワールドカップ 2026 試合日程・toto予想・視聴ガイド",
    template: "%s｜W杯2026 × toto",
  },
  description:
    "FIFA ワールドカップ 2026（北中米大会）の全104試合の日程・放映情報・toto対象試合・購入ガイドを網羅。DAZNでの視聴方法も詳しく解説。",
  keywords: [
    "W杯 2026", "ワールドカップ 2026", "FIFA ワールドカップ", "toto", "toto 予想",
    "DAZN", "DAZN W杯", "日本代表", "試合日程", "放映予定", "W杯 どこで見れる",
    "toto 買い方", "W杯 グループ", "日本 オランダ", "W杯 2026 日程",
  ],
  openGraph: {
    title: "W杯2026 × toto｜試合日程・toto予想・視聴ガイド",
    description: "FIFA ワールドカップ 2026 の全104試合の日程・toto予想・DAZN視聴ガイドを網羅する総合情報サイト",
    locale: "ja_JP",
    type: "website",
    siteName: "W杯2026 × toto",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "W杯2026 × toto｜試合日程・toto予想・視聴ガイド",
    description: "FIFA ワールドカップ 2026 の全104試合の日程・toto予想・DAZN視聴ガイドを網羅",
  },
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Google Search Console の確認コードを後で設定
    // google: "xxxxxx",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocaleFromCookies();
  const dictionary = await getDictionary(locale);

  return (
    <html lang={locale}>
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KGW7JQX5');`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} antialiased min-h-screen flex flex-col`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KGW7JQX5"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <WebsiteJsonLd />
        <LocaleProvider locale={locale} dictionary={dictionary}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
