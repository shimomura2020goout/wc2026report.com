import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LatestNewsBanner from "@/components/LatestNewsBanner";
import LatestNewsBannerWrapper from "@/components/LatestNewsBannerWrapper";
import InstallPrompt from "@/components/InstallPrompt";
import LocaleProvider from "@/components/LocaleProvider";
import { WebsiteJsonLd } from "@/components/JsonLd";
import DonationBanner from "@/components/DonationBanner";
import { getLocaleFromCookies, getDictionary } from "@/i18n/index";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const BASE_URL = "https://www.wc2026report.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "W杯2026｜FIFA ワールドカップ 2026 試合日程・視聴ガイド",
    template: "%s｜W杯2026",
  },
  description:
    "FIFA ワールドカップ 2026（北中米大会）の全104試合の日程・放映情報を網羅。DAZNでの視聴方法も詳しく解説。",
  keywords: [
    "W杯 2026", "ワールドカップ 2026", "FIFA ワールドカップ",
    "W杯 2026 日程", "ワールドカップ スケジュール", "W杯 日本時間",
    "DAZN", "DAZN W杯", "日本代表", "試合日程", "放映予定", "W杯 どこで見れる",
    "W杯 グループ", "日本 オランダ", "W杯 日程 カレンダー", "W杯 放送予定",
  ],
  openGraph: {
    title: "W杯2026｜試合日程・視聴ガイド",
    description: "FIFA ワールドカップ 2026 の全104試合の日程・DAZN視聴ガイドを網羅する総合情報サイト",
    locale: "ja_JP",
    type: "website",
    siteName: "W杯2026",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "W杯2026｜試合日程・視聴ガイド",
    description: "FIFA ワールドカップ 2026 の全104試合の日程・DAZN視聴ガイドを網羅",
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
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a1a2e" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5181012952627650"
          crossOrigin="anonymous"
        />
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
          <LatestNewsBannerWrapper>
            <LatestNewsBanner />
          </LatestNewsBannerWrapper>
          <main className="flex-1">{children}</main>
          <DonationBanner />
          <Footer />
          <InstallPrompt />
        </LocaleProvider>
      </body>
    </html>
  );
}
