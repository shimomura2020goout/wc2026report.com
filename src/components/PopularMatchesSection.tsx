"use client";

import { useMemo } from "react";
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
      <div className="flex items-center gap-2 mb-3">
        <Icon name="local_fire_department" size={20} className="text-orange-500" />
        <h2 className="text-sm font-bold text-gray-900">
          投票が多い対戦カード TOP{ranked.length}
        </h2>
        <span className="text-[10px] text-gray-500 ml-auto">未開催の試合</span>
      </div>
      <ol className="space-y-1.5">
        {ranked.map(({ match, total }, idx) => {
          const rank = idx + 1;
          const stats = statsMap[match.id];
          const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);
          const pctHome = pct(stats?.home ?? 0);
          const pctDraw = pct(stats?.draw ?? 0);
          const pctAway = pct(stats?.away ?? 0);
          return (
            <li key={match.id}>
              <button
                type="button"
                onClick={() => scrollToMatch(match.id)}
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
            </li>
          );
        })}
      </ol>
    </section>
  );
}
