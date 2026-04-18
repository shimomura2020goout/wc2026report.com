"use client";

import Icon from "./Icon";
import type { Pick } from "@/lib/predictions";

interface PredictionBadgeProps {
  pick: Pick;
  homeTeam: string;
  awayTeam: string;
}

export default function PredictionBadge({ pick, homeTeam, awayTeam }: PredictionBadgeProps) {
  const label =
    pick === "home"
      ? `${homeTeam} 勝利と予想`
      : pick === "away"
      ? `${awayTeam} 勝利と予想`
      : "引き分けと予想";
  const color =
    pick === "home"
      ? "bg-red-100 text-red-700 border-red-200"
      : pick === "away"
      ? "bg-blue-100 text-blue-700 border-blue-200"
      : "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <div
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${color}`}
    >
      <Icon name="how_to_vote" size={14} />
      {label}
    </div>
  );
}
