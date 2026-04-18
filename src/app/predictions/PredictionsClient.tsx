"use client";

import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/Icon";
import MatchPredictionCard from "@/components/MatchPredictionCard";
import type { Match } from "@/data/matches";
import type { MatchVoteStats, Pick } from "@/lib/predictions";
import { allTeams } from "@/data/teams";
import { usePreferences } from "@/context/PreferencesContext";

interface MyData {
  picks: Record<string, Pick>;
  stats: { correct: number; total: number; streak: number };
}

interface PredictionsClientProps {
  matches: Match[];
}

const BATCH_SIZE = 50;
const INITIAL_VISIBLE = 15;
const GROUP_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

type QuickFilter =
  | "all"
  | "japan"
  | "favorites"
  | "mypicks"
  | "ko"
  | `group-${string}`;

export default function PredictionsClient({ matches }: PredictionsClientProps) {
  const { prefs, hydrated } = usePreferences();
  const [me, setMe] = useState<MyData | null>(null);
  const [statsMap, setStatsMap] = useState<Record<string, MatchVoteStats>>({});
  const [fetched, setFetched] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<QuickFilter>("all");
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  useEffect(() => {
    fetch("/api/predictions/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setMe(data);
      })
      .catch(() => {});

    const allIds = matches.map((m) => m.id);
    const batches: string[][] = [];
    for (let i = 0; i < allIds.length; i += BATCH_SIZE) {
      batches.push(allIds.slice(i, i + BATCH_SIZE));
    }
    Promise.all(
      batches.map((ids) =>
        fetch(`/api/predictions/stats?matchIds=${ids.join(",")}`)
          .then((r) => r.json())
          .catch(() => ({ stats: {} }))
      )
    )
      .then((results) => {
        const merged: Record<string, MatchVoteStats> = {};
        for (const r of results) {
          if (r.stats) Object.assign(merged, r.stats);
        }
        setStatsMap(merged);
      })
      .finally(() => setFetched(true));
  }, [matches]);

  const hitRate =
    me && me.stats.total > 0 ? Math.round((me.stats.correct / me.stats.total) * 100) : null;

  const favoriteTeamNames = useMemo(() => {
    if (!hydrated) return [];
    return prefs.favoriteCountries
      .map((code) => allTeams.find((t) => t.code === code)?.name)
      .filter(Boolean) as string[];
  }, [prefs.favoriteCountries, hydrated]);

  const hasFavorites = favoriteTeamNames.length > 0;
  const hasMyPicks = me && Object.keys(me.picks).length > 0;

  // フィルター適用
  const filteredMatches = useMemo(() => {
    const q = search.trim();
    return matches.filter((m) => {
      // 検索 (チーム名・都市・会場)
      if (q) {
        const hay = `${m.homeTeam} ${m.awayTeam} ${m.city} ${m.venue}`;
        if (!hay.toLowerCase().includes(q.toLowerCase())) return false;
      }
      // フィルター
      if (filter === "japan") return m.isJapan;
      if (filter === "favorites") {
        return (
          favoriteTeamNames.includes(m.homeTeam) ||
          favoriteTeamNames.includes(m.awayTeam)
        );
      }
      if (filter === "mypicks") {
        return me?.picks[m.id] !== undefined;
      }
      if (filter === "ko") return m.type === "worldcup_ko";
      if (filter.startsWith("group-")) {
        const letter = filter.slice(6);
        return m.group === letter;
      }
      return true;
    });
  }, [matches, search, filter, favoriteTeamNames, me]);

  const visibleMatches = filteredMatches.slice(0, visibleCount);
  const hasMore = filteredMatches.length > visibleCount;

  // フィルター変更時は表示件数をリセット
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [search, filter]);

  const filterLabel = (() => {
    if (filter === "all") return "すべて";
    if (filter === "japan") return "日本戦";
    if (filter === "favorites") return "応援国";
    if (filter === "mypicks") return "予想済み";
    if (filter === "ko") return "決勝トーナメント";
    if (filter.startsWith("group-")) return `グループ${filter.slice(6)}`;
    return "";
  })();

  return (
    <>
      {me && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="insights" size={18} className="text-blue-600" />
            <h2 className="text-sm font-bold text-gray-900">あなたの予想成績</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3 text-center border border-blue-100">
              <div className="text-[10px] text-gray-500">投票数</div>
              <div className="text-xl font-black text-gray-900">
                {Object.keys(me.picks).length}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center border border-blue-100">
              <div className="text-[10px] text-gray-500">的中</div>
              <div className="text-xl font-black text-gray-900">{me.stats.correct}</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center border border-blue-100">
              <div className="text-[10px] text-gray-500">的中率</div>
              <div className="text-xl font-black text-gray-900">
                {hitRate !== null ? `${hitRate}%` : "-"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 検索 & フィルター (スティッキー) */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-sm border-y border-gray-100 -mx-4 px-4 py-3 mb-4 space-y-2">
        {/* 検索 */}
        <div className="relative">
          <Icon
            name="search"
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="チーム名・会場・都市で検索..."
            className="w-full text-sm bg-gray-50 border border-gray-200 rounded-full pl-9 pr-9 py-2 focus:outline-none focus:border-blue-400 focus:bg-white"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="クリア"
            >
              <Icon name="close" size={18} />
            </button>
          )}
        </div>

        {/* フィルターチップ */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide relative">
          <FilterChip
            label="すべて"
            icon="filter_list_off"
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          <FilterChip
            label="日本戦"
            icon="flag"
            active={filter === "japan"}
            onClick={() => setFilter("japan")}
          />
          {hasFavorites && (
            <FilterChip
              label="応援国"
              icon="favorite"
              active={filter === "favorites"}
              onClick={() => setFilter("favorites")}
            />
          )}
          {hasMyPicks && (
            <FilterChip
              label="予想済み"
              icon="how_to_vote"
              active={filter === "mypicks"}
              onClick={() => setFilter("mypicks")}
            />
          )}
          <FilterChip
            label="決勝T"
            icon="emoji_events"
            active={filter === "ko"}
            onClick={() => setFilter("ko")}
          />
          {/* グループドロップダウン */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowGroupMenu((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border whitespace-nowrap ${
                filter.startsWith("group-")
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              <Icon name="grid_view" size={14} />
              {filter.startsWith("group-") ? `グループ${filter.slice(6)}` : "グループ"}
              <Icon
                name="expand_more"
                size={14}
                className={`transition-transform ${showGroupMenu ? "rotate-180" : ""}`}
              />
            </button>
            {showGroupMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 p-2 grid grid-cols-4 gap-1 min-w-[180px]">
                {GROUP_LETTERS.map((g) => {
                  const key = `group-${g}` as QuickFilter;
                  const isActive = filter === key;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        setFilter(key);
                        setShowGroupMenu(false);
                      }}
                      className={`px-2 py-1.5 rounded text-sm font-bold ${
                        isActive
                          ? "bg-gray-900 text-white"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 結果サマリ */}
        {(search || filter !== "all") && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>
              <strong className="text-gray-700">{filteredMatches.length}</strong> 試合ヒット
              {filter !== "all" && <span className="ml-1">({filterLabel})</span>}
            </span>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
              className="ml-auto text-blue-600 hover:underline"
            >
              条件クリア
            </button>
          </div>
        )}
      </div>

      {/* 試合リスト */}
      <div className="space-y-5">
        {visibleMatches.map((m) => (
          <MatchPredictionCard
            key={m.id}
            match={m}
            initialStats={statsMap[m.id] ?? null}
            initialUserPick={me?.picks[m.id] ?? null}
            skipOwnFetch={fetched}
          />
        ))}
        {filteredMatches.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Icon name="search_off" size={40} className="mb-3" />
            <p className="text-sm">該当する試合がありません</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              条件をクリア
            </button>
          </div>
        )}
      </div>

      {/* もっと見る */}
      {hasMore && (
        <button
          type="button"
          onClick={() => setVisibleCount((c) => c + INITIAL_VISIBLE)}
          className="mt-4 w-full flex items-center justify-center gap-1 py-3 text-sm font-medium text-blue-600 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-colors"
        >
          <Icon name="expand_more" size={18} />
          もっと見る（残り {filteredMatches.length - visibleCount} 試合）
        </button>
      )}
    </>
  );
}

function FilterChip({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border whitespace-nowrap ${
        active
          ? "bg-gray-900 text-white border-gray-900"
          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
      }`}
    >
      <Icon name={icon} size={14} />
      {label}
    </button>
  );
}
