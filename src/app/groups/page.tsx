import type { Metadata } from "next";
import Icon from "@/components/Icon";
import SourceAttribution from "@/components/SourceAttribution";
import { worldCupGroups } from "@/data/matches";

export const metadata: Metadata = {
  title: "W杯 2026 グループステージ一覧｜全12グループ・48カ国の組み合わせ",
  description: "FIFA ワールドカップ 2026 全12グループの組み合わせ一覧。日本はグループH（オランダ・チュニジア・UEFA PO B）。48カ国の振り分け、開催都市、大会レギュレーションを解説。",
  alternates: { canonical: "https://www.wc2026report.com/groups" },
};

export default function GroupsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        グループステージ 全12グループ
      </h1>
      <p className="text-gray-500 mb-8">
        史上初の48カ国参加。12グループに分かれ、各グループ上位2チーム（計24チーム）+3位のうち8チームがノックアウトステージ進出。
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {worldCupGroups.map((group) => (
          <div
            key={group.name}
            id={`group-${group.name}`}
            className={`bg-white rounded-xl shadow-sm border p-5 ${group.name === "H" ? "border-red-300 ring-2 ring-red-200" : "border-gray-100"}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Icon name="shield" size={20} className="text-gray-400" />
                グループ {group.name}
              </h2>
              {group.name === "H" && (
                <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold">
                  日本所属
                </span>
              )}
            </div>

            <div className="space-y-2 mb-4">
              {group.teams.map((team, i) => (
                <div
                  key={team}
                  className={`flex items-center gap-3 py-2 px-3 rounded-lg ${
                    team === "日本" ? "bg-red-50 border border-red-200" : "bg-gray-50"
                  }`}
                >
                  <span className="text-sm text-gray-400 font-mono w-4">{i + 1}</span>
                  <span className={`font-medium ${team === "日本" ? "text-red-700" : "text-gray-800"}`}>
                    {team}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-500 border-t border-gray-100 pt-3">
              <Icon name="location_on" size={16} className="text-gray-400" />
              開催地: {group.venue}
            </div>
          </div>
        ))}
      </div>

      {/* レギュレーション説明 */}
      <div className="mt-12 bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h3 className="font-bold text-amber-900 text-lg mb-3 flex items-center gap-2">
          <Icon name="rule" size={22} className="text-amber-700" />
          大会レギュレーション
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-800">
          <div>
            <h4 className="font-semibold mb-1">グループステージ</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>48カ国が12グループに振り分け</li>
              <li>各グループ4チームの総当たり（各チーム3試合）</li>
              <li>グループ1位・2位が自動的にノックアウトステージへ</li>
              <li>3位のうち成績上位8チームも進出</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-1">ノックアウトステージ</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>32チームによるトーナメント</li>
              <li>ラウンド32 → ラウンド16 → 準々決勝 → 準決勝 → 決勝</li>
              <li>決勝は2026年7月19日（メットライフ・スタジアム）</li>
            </ul>
          </div>
        </div>
      </div>

      <SourceAttribution
        sources={[
          { label: "FIFA公式 — FIFA World Cup 26 組み合わせ", url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026" },
          { label: "FIFA公式 — 大会レギュレーション", url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026/articles/fifa-world-cup-26-all-you-need-to-know" },
        ]}
        updatedAt="2026年3月9日"
      />
    </div>
  );
}
