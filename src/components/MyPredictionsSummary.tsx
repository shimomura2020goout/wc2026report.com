"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";

interface MyData {
  picks: Record<string, "home" | "draw" | "away">;
  stats: { correct: number; total: number; streak: number };
}

interface MyPredictionsSummaryProps {
  /** Match IDs in the currently visible section (to compute scope). */
  matchIds: string[];
}

export default function MyPredictionsSummary({ matchIds }: MyPredictionsSummaryProps) {
  const [me, setMe] = useState<MyData | null>(null);

  useEffect(() => {
    fetch("/api/predictions/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setMe(data);
      })
      .catch(() => {
        /* noop */
      });
  }, []);

  if (!me) return null;

  const pickedInScope = matchIds.filter((id) => me.picks[id]).length;
  if (pickedInScope === 0) return null;

  const hitRate =
    me.stats.total > 0 ? Math.round((me.stats.correct / me.stats.total) * 100) : null;

  return (
    <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Icon name="insights" size={22} className="text-blue-600" />
          <div>
            <div className="text-xs text-gray-500">
              この画面の試合に {pickedInScope} 件の予想
            </div>
            <div className="text-sm font-bold text-gray-900">
              全体: {me.stats.correct}/{me.stats.total} 的中
              {hitRate !== null && (
                <span className="ml-2 text-blue-600">({hitRate}%)</span>
              )}
            </div>
          </div>
        </div>
        <Link
          href="/predictions"
          className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          予想ページへ
          <Icon name="arrow_forward" size={14} />
        </Link>
      </div>
    </div>
  );
}
