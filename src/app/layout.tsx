import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "W杯2026 × toto｜FIFA ワールドカップ 2026 試合日程・toto予想・視聴ガイド",
    template: "%s｜W杯2026 × toto",
  },
  description:
    "FIFA ワールドカップ 2026（北中米大会）の全104試合の日程・放映情報・toto対象試合・購入ガイドを網羅。DAZNでの視聴方法も詳しく解説。",
  keywords: ["W杯 2026", "ワールドカップ 2026", "toto", "DAZN", "日本代表", "試合日程", "放映予定"],
  openGraph: {
    title: "W杯2026 × toto｜試合日程・toto予想・視聴ガイド",
    description: "FIFA ワールドカップ 2026 の試合情報とtoto予想を提供する総合情報サイト",
    locale: "ja_JP",
    type: "website",
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
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
