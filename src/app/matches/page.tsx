import type { Metadata } from "next";
import MatchCard from "@/components/MatchCard";
import SourceAttribution from "@/components/SourceAttribution";
import Icon from "@/components/Icon";
import { japanMatches } from "@/data/matches";

export const metadata: Metadata = {
  title: "日本代表 試合日程",
  description: "日本代表の2026年全試合日程。W杯グループリーグ、キリンチャレンジカップ、親善試合の日程・キックオフ時間・放映情報を一覧で確認。",
};

export default function MatchesPage() {
  const wcMatches = japanMatches.filter((m) => m.type === "worldcup_gl" || m.type === "worldcup_ko");
  const otherMatches = japanMatches.filter((m) => m.type !== "worldcup_gl" && m.type !== "worldcup_ko");

  return (
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
          日本はグループHに所属。オランダ、チュニジア、UEFA PO B勝者と対戦。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {wcMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>

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
  );
}
