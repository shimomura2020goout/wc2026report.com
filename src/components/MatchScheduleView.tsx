"use client";

import { useState, useMemo } from "react";
import { Match, type KnockoutRound } from "@/data/matches";
import MatchCard from "./MatchCard";
import MatchListItem from "./MatchListItem";
import Icon from "./Icon";

type TabId = "japan" | "group" | "knockout" | "all";

interface MatchScheduleViewProps {
  japanMatches: Match[];
  groupStageMatches: Match[];
  knockoutMatches: Match[];
}

const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const matchdays = [1, 2, 3];
const koRounds: { id: KnockoutRound; label: string }[] = [
  { id: "R32", label: "ラウンド32" },
  { id: "R16", label: "ラウンド16" },
  { id: "QF", label: "準々決勝" },
  { id: "SF", label: "準決勝" },
  { id: "3rd", label: "3位決定戦" },
  { id: "Final", label: "決勝" },
];

export default function MatchScheduleView({
  japanMatches,
  groupStageMatches,
  knockoutMatches,
}: MatchScheduleViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("japan");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedMatchday, setSelectedMatchday] = useState<number>(0);
  const [selectedRound, setSelectedRound] = useState<KnockoutRound | "all">("all");
  const [viewMode, setViewMode] = useState<"list" | "card">("list");

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "japan", label: "日本代表", count: japanMatches.length },
    { id: "group", label: "グループステージ", count: groupStageMatches.length },
    { id: "knockout", label: "ノックアウト", count: knockoutMatches.length },
    { id: "all", label: "全試合", count: groupStageMatches.length + knockoutMatches.length },
  ];

  // 日本代表タブでは W杯試合 と 親善試合/キリン を分離表示
  const japanWorldCupMatches = useMemo(
    () => japanMatches.filter((m) => m.type === "worldcup_gl" || m.type === "worldcup_ko"),
    [japanMatches]
  );
  const japanFriendlyMatches = useMemo(
    () => japanMatches.filter((m) => m.type === "friendly" || m.type === "kirin" || m.type === "kirin_cup"),
    [japanMatches]
  );

  const filteredMatches = useMemo(() => {
    switch (activeTab) {
      case "japan":
        return japanWorldCupMatches;
      case "group": {
        let matches = groupStageMatches;
        if (selectedGroup !== "all") {
          matches = matches.filter((m) => m.group === selectedGroup);
        }
        if (selectedMatchday > 0) {
          matches = matches.filter((m) => m.matchday === selectedMatchday);
        }
        return matches;
      }
      case "knockout": {
        if (selectedRound !== "all") {
          return knockoutMatches.filter((m) => m.knockoutRound === selectedRound);
        }
        return knockoutMatches;
      }
      case "all":
        return [...groupStageMatches, ...knockoutMatches];
      default:
        return [];
    }
  }, [activeTab, selectedGroup, selectedMatchday, selectedRound, japanWorldCupMatches, groupStageMatches, knockoutMatches]);

  return (
    <div>
      {/* タブ */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedGroup("all");
              setSelectedMatchday(0);
              setSelectedRound("all");
            }}
            className={`flex-1 min-w-fit px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            <span className={`ml-1 text-xs ${activeTab === tab.id ? "text-amber-600" : "text-gray-400"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* フィルター */}
      {activeTab === "group" && (
        <div className="flex flex-wrap gap-3 mb-4">
          {/* グループ選択 */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedGroup("all")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                selectedGroup === "all" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              全グループ
            </button>
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  selectedGroup === g
                    ? g === "F" ? "bg-red-500 text-white" : "bg-amber-500 text-white"
                    : g === "F" ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          {/* 節選択 */}
          <div className="flex gap-1 border-l border-gray-200 pl-3">
            <button
              onClick={() => setSelectedMatchday(0)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                selectedMatchday === 0 ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              全節
            </button>
            {matchdays.map((md) => (
              <button
                key={md}
                onClick={() => setSelectedMatchday(md)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  selectedMatchday === md ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                第{md}節
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "knockout" && (
        <div className="flex flex-wrap gap-1 mb-4">
          <button
            onClick={() => setSelectedRound("all")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition ${
              selectedRound === "all" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            全ラウンド
          </button>
          {koRounds.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRound(r.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                selectedRound === r.id ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      {/* 表示切替 & 件数 */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">
          {filteredMatches.length}試合
        </p>
        {activeTab !== "japan" && (
          <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
              title="リスト表示"
            >
              <Icon name="view_list" size={16} className={viewMode === "list" ? "text-gray-900" : "text-gray-400"} />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-1.5 rounded ${viewMode === "card" ? "bg-white shadow-sm" : ""}`}
              title="カード表示"
            >
              <Icon name="grid_view" size={16} className={viewMode === "card" ? "text-gray-900" : "text-gray-400"} />
            </button>
          </div>
        )}
      </div>

      {/* 試合一覧 */}
      {filteredMatches.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Icon name="event_busy" size={48} className="mx-auto mb-2 text-gray-300" />
          <p>該当する試合がありません</p>
        </div>
      ) : activeTab === "japan" || viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMatches.map((match) => (
            <MatchListItem
              key={match.id}
              match={match}
              showGroup={activeTab !== "knockout" && selectedGroup === "all"}
            />
          ))}
        </div>
      )}

      {/* 日本代表タブ: 親善試合・キリンチャレンジカップ（アコーディオン） */}
      {activeTab === "japan" && japanFriendlyMatches.length > 0 && (
        <details className="mt-6 group bg-gray-50 rounded-xl border border-gray-200">
          <summary className="flex items-center gap-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl">
            <Icon name="handshake" size={18} className="text-gray-500" />
            親善試合・キリンチャレンジカップ
            <span className="text-xs text-gray-400 ml-auto mr-2">({japanFriendlyMatches.length}試合)</span>
            <Icon name="expand_more" size={20} className="text-gray-400 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="px-4 pb-4 pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {japanFriendlyMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
