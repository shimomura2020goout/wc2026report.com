"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Team, regions } from "@/data/teams";
import Icon from "./Icon";

type ViewMode = "group" | "region" | "ranking";

const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

interface TeamsViewProps {
  teams: Team[];
}

export default function TeamsView({ teams }: TeamsViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("group");
  const [search, setSearch] = useState("");

  const filteredTeams = useMemo(() => {
    if (!search) return teams;
    const q = search.toLowerCase();
    return teams.filter(
      (t) => t.name.includes(search) || t.code.toLowerCase().includes(q) || t.regionLabel.includes(search)
    );
  }, [teams, search]);

  const groupedTeams = useMemo(() => {
    if (viewMode === "group") {
      return groups.map((g) => ({
        key: g,
        label: `グループ ${g}`,
        highlight: g === "F",
        teams: filteredTeams.filter((t) => t.group === g),
      }));
    }
    if (viewMode === "region") {
      return regions.map((r) => ({
        key: r.id,
        label: r.label,
        highlight: false,
        teams: filteredTeams.filter((t) => t.region === r.id).sort((a, b) => (a.fifaRanking || 999) - (b.fifaRanking || 999)),
      })).filter((g) => g.teams.length > 0);
    }
    // ranking
    return [{
      key: "all",
      label: "FIFAランキング順",
      highlight: false,
      teams: [...filteredTeams].filter((t) => !t.isPlaceholder).sort((a, b) => a.fifaRanking - b.fifaRanking),
    }];
  }, [filteredTeams, viewMode]);

  return (
    <div>
      {/* コントロール */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* 表示モード */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {([
            { id: "group" as ViewMode, label: "グループ別", icon: "shield" },
            { id: "region" as ViewMode, label: "大陸別", icon: "public" },
            { id: "ranking" as ViewMode, label: "ランキング", icon: "leaderboard" },
          ]).map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === mode.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon name={mode.icon} size={16} />
              {mode.label}
            </button>
          ))}
        </div>

        {/* 検索 */}
        <div className="relative flex-1 max-w-xs">
          <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="チーム名で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
          />
        </div>
      </div>

      {/* チーム一覧 */}
      {groupedTeams.map((section) => (
        <div key={section.key} className="mb-8">
          {groupedTeams.length > 1 && (
            <h2 className={`text-lg font-bold mb-3 flex items-center gap-2 ${
              section.highlight ? "text-red-700" : "text-gray-900"
            }`}>
              {section.highlight && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">日本所属</span>
              )}
              {section.label}
            </h2>
          )}

          {section.teams.length === 0 ? (
            <p className="text-sm text-gray-400 py-4">該当するチームがありません</p>
          ) : viewMode === "ranking" ? (
            /* ランキング表示 — テーブル形式 */
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600">
                    <th className="text-center px-3 py-3 font-semibold w-12">順位</th>
                    <th className="text-left px-4 py-3 font-semibold">チーム</th>
                    <th className="text-center px-3 py-3 font-semibold hidden sm:table-cell">グループ</th>
                    <th className="text-center px-3 py-3 font-semibold hidden sm:table-cell">大陸</th>
                    <th className="text-left px-3 py-3 font-semibold hidden md:table-cell">W杯最高成績</th>
                    <th className="text-center px-3 py-3 font-semibold">出場回数</th>
                  </tr>
                </thead>
                <tbody>
                  {section.teams.map((team) => (
                    <tr
                      key={team.code}
                      className={`border-t border-gray-50 ${team.name === "日本" ? "bg-red-50/50" : ""}`}
                    >
                      <td className="text-center px-3 py-3 font-bold text-gray-700">{team.fifaRanking}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{team.flag}</span>
                          <span className={`font-medium ${team.name === "日本" ? "text-red-700" : "text-gray-900"}`}>
                            {team.name}
                          </span>
                        </span>
                      </td>
                      <td className="text-center px-3 py-3 hidden sm:table-cell">
                        <Link href={`/groups#group-${team.group}`} className="text-amber-600 font-medium hover:underline">
                          {team.group}
                        </Link>
                      </td>
                      <td className="text-center px-3 py-3 text-gray-500 hidden sm:table-cell">{team.regionLabel}</td>
                      <td className="px-3 py-3 text-gray-600 text-xs hidden md:table-cell">{team.bestResult}</td>
                      <td className="text-center px-3 py-3 text-gray-600">{team.wcAppearances}回</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* グループ別・大陸別 — カード形式 */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {section.teams.map((team) => (
                <div
                  key={team.code}
                  className={`bg-white rounded-xl shadow-sm border p-4 transition hover:shadow-md ${
                    team.name === "日本" ? "border-red-300 ring-2 ring-red-200" :
                    team.isPlaceholder ? "border-dashed border-gray-200 bg-gray-50/50" :
                    "border-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{team.flag}</span>
                    <div>
                      <h3 className={`font-bold ${
                        team.name === "日本" ? "text-red-700" :
                        team.isPlaceholder ? "text-gray-400 italic" :
                        "text-gray-900"
                      }`}>
                        {team.name}
                      </h3>
                      {!team.isPlaceholder && (
                        <span className="text-xs text-gray-400">{team.code}</span>
                      )}
                    </div>
                  </div>

                  {!team.isPlaceholder && (
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">FIFAランキング</span>
                        <span className="font-bold text-gray-900 bg-amber-100 px-2 py-0.5 rounded">
                          {team.fifaRanking}位
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">W杯出場</span>
                        <span className="font-medium text-gray-700">{team.wcAppearances}回</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">最高成績</span>
                        <span className="font-medium text-gray-700 text-right">{team.bestResult}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">大陸</span>
                        <span className="text-gray-600">{team.regionLabel}</span>
                      </div>
                    </div>
                  )}

                  {team.isPlaceholder && (
                    <p className="text-xs text-gray-400 italic">プレーオフ未確定</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {filteredTeams.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Icon name="search_off" size={48} className="mx-auto mb-2 text-gray-300" />
          <p>該当するチームが見つかりません</p>
        </div>
      )}
    </div>
  );
}
