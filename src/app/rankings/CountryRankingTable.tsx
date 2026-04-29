"use client";

import Link from "next/link";
import Icon from "@/components/Icon";
import type { Team } from "@/data/teams";

const RANK_MEDAL: Record<number, string> = {
  1: "bg-gradient-to-br from-yellow-300 to-amber-500 text-white shadow-md",
  2: "bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-md",
  3: "bg-gradient-to-br from-amber-500 to-orange-700 text-white shadow-md",
};

interface Props {
  teams: Team[];
}

export default function CountryRankingTable({ teams }: Props) {
  const sorted = [...teams]
    .filter((t) => !t.isPlaceholder && t.fifaRanking > 0)
    .sort((a, b) => a.fifaRanking - b.fifaRanking);

  return (
    <section>
      {/* 詳細導線 */}
      <div className="mb-3 flex items-center justify-between text-sm">
        <p className="text-gray-500 flex items-center gap-1">
          <Icon name="public" size={16} className="text-gray-400" />
          FIFAランキング順 ({sorted.length}カ国)
        </p>
        <Link
          href="/teams"
          className="inline-flex items-center gap-0.5 text-blue-600 hover:underline font-medium"
        >
          詳細・グループ別
          <Icon name="chevron_right" size={16} />
        </Link>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs">
              <th className="text-center px-2 sm:px-3 py-3 font-semibold w-12">順位</th>
              <th className="text-left px-3 py-3 font-semibold">国</th>
              <th className="text-right px-3 py-3 font-semibold">FIFAポイント</th>
              <th className="text-center px-3 py-3 font-semibold hidden sm:table-cell">大陸</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((team) => {
              const diff = team.fifaPoints - team.fifaPrevPoints;
              const diffStr =
                diff > 0
                  ? `+${diff.toFixed(2)}`
                  : diff < 0
                    ? diff.toFixed(2)
                    : "±0";
              const diffColor =
                diff > 0
                  ? "text-green-600"
                  : diff < 0
                    ? "text-red-500"
                    : "text-gray-400";
              const isJapan = team.code === "JPN";
              const medal = RANK_MEDAL[team.fifaRanking];

              return (
                <tr
                  key={team.code}
                  className={`border-t border-gray-50 hover:bg-gray-50 transition-colors ${
                    isJapan ? "bg-red-50/50" : ""
                  }`}
                >
                  <td className="text-center px-2 sm:px-3 py-3">
                    {medal ? (
                      <span
                        className={`inline-flex w-8 h-8 rounded-full items-center justify-center font-black text-sm ${medal}`}
                      >
                        {team.fifaRanking}
                      </span>
                    ) : (
                      <span className="font-mono text-gray-500 font-semibold">
                        {team.fifaRanking}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/teams/${team.code.toLowerCase()}`}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <span className="text-xl leading-none">{team.flag}</span>
                      <span
                        className={`truncate ${isJapan ? "text-red-700 font-bold" : "text-gray-900 font-medium"}`}
                      >
                        {team.name}
                      </span>
                    </Link>
                  </td>
                  <td className="text-right px-3 py-3 whitespace-nowrap">
                    <span className="font-bold text-gray-800">
                      {team.fifaPoints.toFixed(2)}
                    </span>
                    <span className={`block text-[10px] ${diffColor}`}>{diffStr}</span>
                  </td>
                  <td className="text-center px-3 py-3 text-xs text-gray-500 hidden sm:table-cell whitespace-nowrap">
                    {team.regionLabel}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 注記 */}
      <p className="mt-3 text-xs text-gray-400 leading-relaxed">
        ※ FIFAランキングは2026年4月1日付。プレーオフ未確定枠は除いています。
      </p>
    </section>
  );
}
