"use client";

import { MatchVoteStats } from "@/lib/predictions";

interface PredictionChartProps {
  stats: MatchVoteStats;
  userPick?: "home" | "draw" | "away" | null;
  homeLabel: string;
  awayLabel: string;
}

export default function PredictionChart({ stats, userPick, homeLabel, awayLabel }: PredictionChartProps) {
  const total = stats.total || stats.home + stats.draw + stats.away;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const pctHome = pct(stats.home);
  const pctDraw = pct(stats.draw);
  const pctAway = pct(stats.away);

  const segBase = "h-full flex items-center justify-center text-xs font-bold text-white transition-all";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="font-medium">{total} 人が予想</span>
      </div>
      <div className="flex h-8 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
        {pctHome > 0 && (
          <div
            className={`${segBase} bg-red-500`}
            style={{ width: `${pctHome}%` }}
          >
            {pctHome >= 10 ? `${pctHome}%` : ""}
          </div>
        )}
        {pctDraw > 0 && (
          <div
            className={`${segBase} bg-gray-400`}
            style={{ width: `${pctDraw}%` }}
          >
            {pctDraw >= 10 ? `${pctDraw}%` : ""}
          </div>
        )}
        {pctAway > 0 && (
          <div
            className={`${segBase} bg-blue-500`}
            style={{ width: `${pctAway}%` }}
          >
            {pctAway >= 10 ? `${pctAway}%` : ""}
          </div>
        )}
        {total === 0 && (
          <div className="w-full flex items-center justify-center text-xs text-gray-400">
            まだ投票がありません
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className={`flex items-center gap-1 ${userPick === "home" ? "font-bold text-red-600" : "text-gray-500"}`}>
          <span className="inline-block w-2 h-2 bg-red-500 rounded-full" />
          {homeLabel} {userPick === "home" && "（あなた）"}
        </span>
        <span className={`flex items-center gap-1 ${userPick === "draw" ? "font-bold text-gray-700" : "text-gray-500"}`}>
          <span className="inline-block w-2 h-2 bg-gray-400 rounded-full" />
          引分 {userPick === "draw" && "（あなた）"}
        </span>
        <span className={`flex items-center gap-1 ${userPick === "away" ? "font-bold text-blue-600" : "text-gray-500"}`}>
          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" />
          {awayLabel} {userPick === "away" && "（あなた）"}
        </span>
      </div>
    </div>
  );
}
