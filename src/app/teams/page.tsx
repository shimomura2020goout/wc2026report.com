import type { Metadata } from "next";
import TeamsView from "@/components/TeamsView";
import SourceAttribution from "@/components/SourceAttribution";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { allTeams } from "@/data/teams";

export const metadata: Metadata = {
  title: "参加48カ国 チーム一覧｜W杯2026 FIFAランキング・出場回数・最高成績",
  description: "FIFA ワールドカップ 2026 参加全48カ国のチーム情報。FIFAランキング、W杯出場回数、過去の最高成績をグループ別・大陸別・ランキング順で一覧表示。",
  alternates: { canonical: "https://www.wc2026report.com/teams" },
};

export default function TeamsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "トップ", url: "https://www.wc2026report.com" },
        { name: "チーム一覧", url: "https://www.wc2026report.com/teams" },
      ]} />

      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          参加48カ国 チーム一覧
        </h1>
        <p className="text-gray-500 mb-8">
          史上初の48カ国が参加するFIFA W杯 2026。FIFAランキング、W杯出場回数、過去の成績を確認。
        </p>

        <TeamsView teams={allTeams} />

        <SourceAttribution
          sources={[
            { label: "FIFA公式 — FIFA World Ranking", url: "https://www.fifa.com/fifa-world-ranking" },
            { label: "FIFA公式 — FIFA World Cup 26", url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026" },
          ]}
          updatedAt="2026年3月19日"
        />
      </div>
    </>
  );
}
