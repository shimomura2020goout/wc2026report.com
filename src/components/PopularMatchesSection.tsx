"use client";

import { useEffect, useMemo, useState } from "react";
import Icon from "./Icon";
import type { Match } from "@/data/matches";
import type { MatchVoteStats } from "@/lib/predictions";

interface PopularMatchesSectionProps {
  matches: Match[];
  statsMap: Record<string, MatchVoteStats>;
  fetched: boolean;
}

const MAX_ITEMS = 10;
const WEEKDAY = ["日", "月", "火", "水", "木", "金", "土"];
const STORAGE_KEY = "wcup:popular-section:expanded";

function formatKickoff(date: string, kickoff: string): string {
  const d = new Date(`${date}T00:00:00+09:00`);
  if (isNaN(d.getTime())) return `${date} ${kickoff}`;
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const w = WEEKDAY[d.getDay()];
  const time = kickoff === "未定" ? "" : ` ${kickoff}`;
  return `${m}/${day}(${w})${time}`;
}

function rankStyle(rank: number): string {
  if (rank === 1) return "bg-amber-400 text-white";
  if (rank === 2) return "bg-gray-300 text-white";
  if (rank === 3) return "bg-orange-400 text-white";
  return "bg-gray-100 text-gray-600";
}

function stageLabel(match: Match): string {
  if (match.knockoutRound) {
    const map: Record<string, string> = {
      R32: "ベスト32",
      R16: "ベスト16",
      QF: "準々決勝",
      SF: "準決勝",
      "3rd": "3位決定戦",
      Final: "決勝",
    };
    return map[match.knockoutRound] ?? match.knockoutRound;
  }
  if (match.group) return `グループ${match.group}`;
  return match.typeLabel;
}

function scrollToMatch(matchId: string) {
  const el = document.getElementById(`match-${matchId}`);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function PopularMatchesSection({
  matches,
  statsMap,
  fetched,
}: PopularMatchesSectionProps) {
  // SSR との不一致を避けるため初期は true、マウント後に localStorage から復元
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "0") setExpanded(false);
    } catch {
      // localStorage が使えない環境では既定の expanded のまま
    }
  }, []);

  const toggleExpanded = () => {
    setExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // 保存失敗は無視（プライベートモード等）
      }
      return next;
    });
  };

  const ranked = useMemo(() => {
    if (!fetched) return [];
    return matches
      .filter((m) => m.status === "scheduled" && !m.isPlaceholder)
      .map((m) => ({ match: m, total: statsMap[m.id]?.total ?? 0 }))
      .filter((x) => x.total > 0)
      .sort((a, b) => {
        if (b.total !== a.total) return b.total - a.total;
        const ad = `${a.match.date}T${a.match.kickoff}`;
        const bd = `${b.match.date}T${b.match.kickoff}`;
        return ad.localeCompare(bd);
      })
      .slice(0, MAX_ITEMS);
  }, [matches, statsMap, fetched]);

  if (!fetched || ranked.length === 0) return null;

  return (
    <section className="mb-6 bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 rounded-2xl p-4 sm:p-5 border border-orange-100">
      <button
        type="button"
        onClick={toggleExpanded}
        aria-expanded={expanded}
        aria-controls="popular-matches-list"
        className="w-full flex items-center gap-2 mb-3 text-left group"
      >
        <Icon name="local_fire_department" size={20} className="text-orange-500" />
        <h2 className="text-sm font-bold text-gray-900">
          投票が多い対戦カード TOP{ranked.length}
        </h2>
        <span className="text-[10px] text-gray-500 ml-auto mr-1">
          {expanded ? "未開催の試合" : `${ranked.length}件`}
        </span>
        <Icon
          name="expand_more"
          size={20}
          className={`text-gray-500 transition-transform ${
            expanded ? "rotate-180" : ""
          } group-hover:text-gray-700`}
        />
      </button>
      {expanded && (
        <ol id="popular-matches-list" className="space-y-1.5">
          {ranked.map(({ match, total }, idx) => {
            const rank = idx + 1;
            const stats = statsMap[match.id];
            const homeVotes = stats?.home ?? 0;
            const drawVotes = stats?.draw ?? 0;
            const awayVotes = stats?.away ?? 0;
            const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);
            const pctHome = pct(homeVotes);
            const pctDraw = pct(drawVotes);
            const pctAway = pct(awayVotes);
            const tooltipId = `popular-tip-${match.id}`;
            return (
              <li key={match.id} className="relative group/item">
                <button
                  type="button"
                  onClick={() => scrollToMatch(match.id)}
                  aria-describedby={tooltipId}
                  className="w-full text-left bg-white rounded-xl p-2.5 border border-orange-100 hover:border-orange-300 hover:shadow-sm transition-all flex items-center gap-3"
                >
                  <span
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${rankStyle(
                      rank
                    )}`}
                  >
                    {rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900 truncate">
                      <span className="truncate">{match.homeTeam}</span>
                      <span className="text-gray-400 font-normal">vs</span>
                      <span className="truncate">{match.awayTeam}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                      <span>{stageLabel(match)}</span>
                      <span>·</span>
                      <span>{formatKickoff(match.date, match.kickoff)}</span>
                    </div>
                    <div
                      className="mt-1.5 flex h-1.5 rounded-full overflow-hidden bg-gray-100"
                      aria-hidden="true"
                    >
                      {pctHome > 0 && (
                        <div className="bg-red-500" style={{ width: `${pctHome}%` }} />
                      )}
                      {pctDraw > 0 && (
                        <div className="bg-gray-400" style={{ width: `${pctDraw}%` }} />
                      )}
                      {pctAway > 0 && (
                        <div className="bg-blue-500" style={{ width: `${pctAway}%` }} />
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-base font-black text-gray-900 leading-none">
                      {total.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">人が予想</div>
                  </div>
                  <Icon
                    name="chevron_right"
                    size={18}
                    className="text-gray-300 shrink-0"
                  />
                </button>
                {/* PCホバー時の内訳ツールチップ（md以上＋ホバー対応端末のみ視認可） */}
                <div
                  id={tooltipId}
                  role="tooltip"
                  className="hidden md:block pointer-events-none absolute z-30 left-1/2 -translate-x-1/2 top-full mt-1 opacity-0 group-hover/item:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-gray-200">{match.homeTeam}</span>
                      <span className="font-bold tabular-nums">
                        {Math.round(pctHome)}%
                      </span>
                      <span className="text-gray-400">({homeVotes})</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-400" />
                      <span className="text-gray-200">引分</span>
                      <span className="font-bold tabular-nums">
                        {Math.round(pctDraw)}%
                      </span>
                      <span className="text-gray-400">({drawVotes})</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-gray-200">{match.awayTeam}</span>
                      <span className="font-bold tabular-nums">
                        {Math.round(pctAway)}%
                      </span>
                      <span className="text-gray-400">({awayVotes})</span>
                    </span>
                  </div>
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
