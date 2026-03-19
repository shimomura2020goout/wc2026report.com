import type { Metadata } from "next";
import Link from "next/link";
import MatchScheduleView from "@/components/MatchScheduleView";
import PlayoffSection from "@/components/PlayoffSection";
import SourceAttribution from "@/components/SourceAttribution";
import Icon from "@/components/Icon";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { japanMatches, allGroupStageMatches, allKnockoutMatches } from "@/data/matches";

export const metadata: Metadata = {
  title: "全104試合 試合日程｜W杯2026 グループステージ・ノックアウトステージ",
  description: "FIFA ワールドカップ 2026 全104試合の日程一覧。日本代表戦、グループステージ全72試合、ノックアウトステージ32試合のキックオフ時間（日本時間）・会場・放映情報を網羅。",
  alternates: { canonical: "https://www.wc2026report.com/matches" },
};

export default function MatchesPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "トップ", url: "https://www.wc2026report.com" },
        { name: "試合日程", url: "https://www.wc2026report.com/matches" },
      ]} />

      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          W杯 2026 全104試合 試合日程
        </h1>
        <p className="text-gray-500 mb-8">
          グループステージ72試合＋ノックアウトステージ32試合。キックオフ時間はすべて日本時間（JST）。
        </p>

        {/* メインスケジュールビュー */}
        <MatchScheduleView
          japanMatches={japanMatches}
          groupStageMatches={allGroupStageMatches}
          knockoutMatches={allKnockoutMatches}
        />

        {/* UEFA PO B */}
        <div className="mt-10">
          <PlayoffSection />
        </div>

        {/* 注意書き */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <Icon name="info" size={18} className="text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium mb-1">ご注意</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>キックオフ時間はすべて日本時間（JST）表記です</li>
                <li>プレーオフ未決定のチームはプレースホルダー表示です</li>
                <li>放映情報は変更される場合があります</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 関連リンク */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/groups"
            className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg"
          >
            <Icon name="shield" size={16} />
            グループ一覧を見る →
          </Link>
          <Link
            href="/results"
            className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg"
          >
            <Icon name="scoreboard" size={16} />
            試合結果・順位表 →
          </Link>
          <Link
            href="/toto"
            className="inline-flex items-center gap-1 text-sm text-purple-600 font-medium hover:text-purple-800 bg-purple-50 px-3 py-2 rounded-lg"
          >
            <Icon name="confirmation_number" size={16} />
            toto対象試合 →
          </Link>
        </div>

        <SourceAttribution
          sources={[
            { label: "FIFA公式 — FIFA World Cup 26", url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026" },
            { label: "JFA公式 — SAMURAI BLUE", url: "https://www.jfa.jp/samuraiblue/" },
            { label: "DAZN — 放映スケジュール", url: "https://www.dazn.com/ja-JP" },
          ]}
          updatedAt="2026年3月19日"
        />
      </div>
    </>
  );
}
