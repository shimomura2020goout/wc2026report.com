import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { WebsiteJsonLd } from "@/components/JsonLd";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} antialiased min-h-screen flex flex-col`}>
        <WebsiteJsonLd />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
