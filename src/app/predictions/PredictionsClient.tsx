"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import MatchPredictionCard from "@/components/MatchPredictionCard";
import type { Match } from "@/data/matches";
import type { MatchVoteStats, Pick } from "@/lib/predictions";

interface MyData {
  picks: Record<string, Pick>;
  stats: { correct: number; total: number; streak: number };
}

interface PredictionsClientProps {
  matches: Match[];
}

const BATCH_SIZE = 50;

export default function PredictionsClient({ matches }: PredictionsClientProps) {
  const [me, setMe] = useState<MyData | null>(null);
  const [statsMap, setStatsMap] = useState<Record<string, MatchVoteStats>>({});
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    fetch("/api/predictions/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setMe(data);
      })
      .catch(() => {});

    // 全試合分のstatsを一括取得（Upstash API呼び出しを削減）
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

      <div className="space-y-5">
        {matches.map((m) => (
          <MatchPredictionCard
            key={m.id}
            match={m}
            initialStats={statsMap[m.id] ?? null}
            initialUserPick={me?.picks[m.id] ?? null}
            skipOwnFetch={fetched}
          />
        ))}
        {matches.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Icon name="event_busy" size={40} className="mb-3" />
            <p className="text-sm">予想可能な試合がありません</p>
          </div>
        )}
      </div>
    </>
  );
}
