"use client";

import Link from "next/link";
import Icon from "./Icon";
import { playoffFinalResults, intercontinentalResults } from "@/data/playoff";

export default function PlayoffSection() {
  return (
    <section className="mb-12">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-green-700 to-green-900 rounded-xl p-5 sm:p-6 text-white mb-6">
        <h2 className="text-lg sm:text-xl font-bold mb-2 flex items-center gap-2">
          <Icon name="check_circle" size={24} />
          W杯2026 プレーオフ全結果 — 全48チーム確定
        </h2>
        <p className="text-green-200 text-sm leading-relaxed">
          <strong className="text-white">2026年3月31日〜4月1日</strong>にプレーオフ決勝が行われ、最後の6枠が確定しました。
          <strong className="text-white">スウェーデン</strong>が日本のグループFに入りました。
        </p>
      </div>

      {/* UEFA プレーオフ結果 */}
      <div className="mb-6">
        <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Icon name="emoji_events" size={20} className="text-amber-500" />
          UEFA プレーオフ決勝結果
        </h3>
        <div className="space-y-3">
          {playoffFinalResults.map((result) => (
            <div
              key={result.path}
              className={`bg-white rounded-xl shadow-sm border p-4 ${
                result.group === "F" ? "border-red-300 ring-2 ring-red-200" : "border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase">Path {result.path}</span>
                <Link
                  href={`/groups#group-${result.group}`}
                  className={`text-xs px-2 py-0.5 rounded-full font-medium hover:opacity-80 transition-opacity ${
                    result.group === "F"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  → グループ{result.group}
                  {result.group === "F" && "（日本と同組）"}
                </Link>
              </div>
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className={`font-bold text-sm ${result.winner === result.home ? "text-green-700" : "text-gray-500"}`}>
                  {result.home}
                </span>
                <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded font-bold">
                  {result.score}
                </span>
                <span className={`font-bold text-sm ${result.winner === result.away ? "text-green-700" : "text-gray-500"}`}>
                  {result.away}
                </span>
              </div>
              {result.penaltyResult && (
                <p className="text-xs text-center text-amber-600 font-medium mb-1">
                  {result.penaltyResult}
                </p>
              )}
              <p className="text-xs text-gray-500 text-center">{result.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 大陸間プレーオフ結果 */}
      <div className="mb-6">
        <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Icon name="public" size={20} className="text-blue-500" />
          大陸間プレーオフ決勝結果
        </h3>
        <div className="space-y-3">
          {intercontinentalResults.map((result) => (
            <div key={result.path} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase">Path {result.path}</span>
                <Link
                  href={`/groups#group-${result.group}`}
                  className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium hover:opacity-80 transition-opacity"
                >
                  → グループ{result.group}
                </Link>
              </div>
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className={`font-bold text-sm ${result.winner === result.home ? "text-green-700" : "text-gray-500"}`}>
                  {result.home}
                </span>
                <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded">VS</span>
                <span className={`font-bold text-sm ${result.winner === result.away ? "text-green-700" : "text-gray-500"}`}>
                  {result.away}
                </span>
              </div>
              <p className="text-xs text-gray-500 text-center">{result.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 出典 */}
      <div className="mt-4 text-xs text-gray-400">
        <div className="flex items-center gap-1 mb-1">
          <Icon name="info" size={14} />
          出典
        </div>
        <a href="https://www.uefa.com/european-qualifiers/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">UEFA公式 — 欧州予選</a>
        {" / "}
        <a href="https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">FIFA公式</a>
        <span className="ml-2">最終更新: 2026年4月15日</span>
      </div>
    </section>
  );
}
