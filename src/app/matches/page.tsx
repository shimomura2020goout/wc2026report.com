import type { Metadata } from "next";
import Link from "next/link";
import MatchCard from "@/components/MatchCard";
import PlayoffSection from "@/components/PlayoffSection";
import SourceAttribution from "@/components/SourceAttribution";
import Icon from "@/components/Icon";
import { SportsEventJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { japanMatches } from "@/data/matches";

export const metadata: Metadata = {
  title: "日本代表 2026年 試合日程｜W杯・親善試合・キリンカップ",
  description: "日本代表の2026年全試合日程。W杯グループリーグ（vsオランダ・vsチュニジア）、キリンチャレンジカップ、親善試合のキックオフ時間・会場・放映情報を一覧で確認。",
  alternates: { canonical: "https://www.wc2026report.com/matches" },
};

export default function MatchesPage() {
  const wcMatches = japanMatches.filter((m) => m.type === "worldcup_gl" || m.type === "worldcup_ko");
  const otherMatches = japanMatches.filter((m) => m.type !== "worldcup_gl" && m.type !== "worldcup_ko");

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "トップ", url: "https://www.wc2026report.com" },
        { name: "試合日程", url: "https://www.wc2026report.com/matches" },
      ]} />
      {wcMatches.map((m) => (
        <SportsEventJsonLd
          key={m.id}
          name={`${m.homeTeam} vs ${m.awayTeam}`}
          startDate={m.kickoff !== "未定" ? `${m.date}T${m.kickoff}:00+09:00` : m.date}
          location={m.venue}
          homeTeam={m.homeTeam}
          awayTeam={m.awayTeam}
          description={`${m.typeLabel} — ${m.venue}（${m.city}）`}
          url="https://www.wc2026report.com/matches"
        />
      ))}
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        日本代表 2026年 試合日程
      </h1>
      <p className="text-gray-500 mb-8">
        W杯本大会・親善試合・キリンチャレンジカップの全試合スケジュール
      </p>

      {/* W杯本大会 */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <span className="bg-amber-500 text-white text-xs px-3 py-1 rounded-full">W杯本大会</span>
          グループH
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          日本はオランダ、チュニジア、UEFA PO B勝者と同組。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {wcMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
        <div className="mt-3">
          <Link
            href="/results"
            className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800"
          >
            <Icon name="scoreboard" size={16} />
            試合結果・順位表を見る →
          </Link>
        </div>
      </section>

      {/* UEFA PO B */}
      <PlayoffSection />

      {/* その他の試合 */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">親善試合・キリンカップ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>

      {/* 注意書き */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <div className="flex items-start gap-2">
          <Icon name="info" size={18} className="text-blue-500 mt-0.5" />
          <div>
            <p className="font-medium mb-1">ご注意</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>キックオフ時間はすべて日本時間（JST）表記です</li>
              <li>「未定」の試合は詳細が発表され次第更新します</li>
              <li>放映情報は変更される場合があります</li>
            </ul>
          </div>
        </div>
      </div>

      <SourceAttribution
        sources={[
          { label: "FIFA公式 — FIFA World Cup 26", url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026" },
          { label: "JFA公式 — SAMURAI BLUE", url: "https://www.jfa.jp/samuraiblue/" },
          { label: "DAZN — 放映スケジュール", url: "https://www.dazn.com/ja-JP" },
        ]}
        updatedAt="2026年3月9日"
      />
    </div>
    </>
  );
}
