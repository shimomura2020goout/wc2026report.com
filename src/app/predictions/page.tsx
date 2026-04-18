import type { Metadata } from "next";
import Icon from "@/components/Icon";
import TotoGuideSection from "@/components/TotoGuideSection";
import { allWorldCupMatches } from "@/data/matches";
import PredictionsClient from "./PredictionsClient";

export const metadata: Metadata = {
  title: "勝敗予想 & totoゾーン",
  description:
    "W杯2026 全104試合の勝敗をワンタップで予想。みんなの予想と的中率、toto買い方ガイドまで網羅。",
};

export const revalidate = 300;

export default function PredictionsPage() {
  // 全104試合を対象（プレースホルダーのKO対戦は表示するが投票UIはロックされる）
  const matches = [...allWorldCupMatches].sort(
    (a, b) => a.date.localeCompare(b.date) || a.kickoff.localeCompare(b.kickoff)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Icon name="poll" size={32} className="text-gray-700" />
        勝敗予想 & totoゾーン
      </h1>
      <p className="text-gray-500 mb-6 text-sm">
        全{matches.length}試合の勝敗をタップで予想。的中率はマイページ、totoの買い方は下部で確認できます。
      </p>

      <PredictionsClient matches={matches} />

      {/* toto 買い方ガイド（旧 /toto ページを統合） */}
      <TotoGuideSection />
    </div>
  );
}
