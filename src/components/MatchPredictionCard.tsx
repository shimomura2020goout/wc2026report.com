"use client";

import { useEffect, useMemo, useState } from "react";
import Icon from "./Icon";
import MatchCard from "./MatchCard";
import PredictionChart from "./PredictionChart";
import type { Match } from "@/data/matches";
import type { MatchVoteStats, Pick } from "@/lib/predictions";

interface MatchPredictionCardProps {
  match: Match;
  initialStats?: MatchVoteStats | null;
  initialUserPick?: Pick | null;
}

function kickoffTimestamp(match: Match): number | null {
  if (match.kickoff === "未定") return null;
  const iso = `${match.date}T${match.kickoff}:00+09:00`;
  const t = new Date(iso).getTime();
  return isNaN(t) ? null : t;
}

const LOCK_LEAD_MS = 2 * 60 * 60 * 1000; // UI lock 2h before kickoff

export default function MatchPredictionCard({
  match,
  initialStats = null,
  initialUserPick = null,
}: MatchPredictionCardProps) {
  const [stats, setStats] = useState<MatchVoteStats | null>(initialStats);
  const [userPick, setUserPick] = useState<Pick | null>(initialUserPick);
  const [submitting, setSubmitting] = useState<Pick | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Upstash 未設定時のみ true。初回 stats 取得で configured:false が来ても
  // ボタンは出したままにし、POST 時に 503 が返ってから unavailable に切り替える。
  const [unavailable, setUnavailable] = useState<boolean>(false);

  const kickoff = useMemo(() => kickoffTimestamp(match), [match]);
  const now = Date.now();
  const uiLocked =
    match.status !== "scheduled" ||
    (kickoff !== null && kickoff - now < LOCK_LEAD_MS) ||
    match.isPlaceholder === true;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/predictions/stats?matchId=${encodeURIComponent(match.id)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.stats) setStats(data.stats);
        // configured:false でもボタンは出し続ける（POST 時の 503 で最終判定）
      })
      .catch(() => {
        /* noop */
      });

    fetch("/api/predictions/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const pick = data.picks?.[match.id];
        if (pick === "home" || pick === "draw" || pick === "away") {
          setUserPick(pick);
        }
      })
      .catch(() => {
        /* noop */
      });
    return () => {
      cancelled = true;
    };
  }, [match.id]);

  const submit = async (pick: Pick) => {
    if (uiLocked || submitting) return;
    setSubmitting(pick);
    setError(null);
    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: match.id, pick }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 503) setUnavailable(true);
        if (data.error === "already_voted") {
          setUserPick(pick);
        }
        setError(
          res.status === 503
            ? "予想投票は準備中です"
            : data.error === "locked"
            ? "投票は締切済みです"
            : data.error === "already_voted"
            ? "既に投票済みです"
            : "投票に失敗しました"
        );
        return;
      }
      setUserPick(pick);
      if (data.stats) setStats(data.stats);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSubmitting(null);
    }
  };

  const homeLabel = match.homeTeam;
  const awayLabel = match.awayTeam;

  return (
    <div>
      <MatchCard match={match} />
      {unavailable ? (
        <div className="mt-2 text-xs text-gray-400 text-center py-3 bg-gray-50 rounded-xl border border-gray-100">
          予想投票は準備中です
        </div>
      ) : userPick ? (
        <div className="mt-2 bg-white rounded-xl p-3 border border-gray-100">
          <PredictionChart
            stats={stats || { home: 0, draw: 0, away: 0, total: 0 }}
            userPick={userPick}
            homeLabel={homeLabel}
            awayLabel={awayLabel}
          />
        </div>
      ) : uiLocked ? (
        <div className="mt-2">
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <PredictionChart
              stats={stats || { home: 0, draw: 0, away: 0, total: 0 }}
              userPick={null}
              homeLabel={homeLabel}
              awayLabel={awayLabel}
            />
          </div>
          <p className="text-xs text-gray-400 text-center mt-1">投票は締切済み</p>
        </div>
      ) : (
        <div className="mt-2 bg-white rounded-xl p-3 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="how_to_vote" size={16} className="text-gray-500" />
            <span className="text-xs font-semibold text-gray-700">勝敗を予想</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => submit("home")}
              disabled={submitting !== null}
              className="flex flex-col items-center py-2 rounded-lg border-2 border-red-200 hover:border-red-400 hover:bg-red-50 text-sm disabled:opacity-50"
            >
              <span className="text-[11px] text-gray-500">{homeLabel}</span>
              <span className="font-bold text-red-600">勝</span>
            </button>
            <button
              type="button"
              onClick={() => submit("draw")}
              disabled={submitting !== null}
              className="flex flex-col items-center py-2 rounded-lg border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 text-sm disabled:opacity-50"
            >
              <span className="text-[11px] text-gray-500">引分</span>
              <span className="font-bold text-gray-700">=</span>
            </button>
            <button
              type="button"
              onClick={() => submit("away")}
              disabled={submitting !== null}
              className="flex flex-col items-center py-2 rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-sm disabled:opacity-50"
            >
              <span className="text-[11px] text-gray-500">{awayLabel}</span>
              <span className="font-bold text-blue-600">勝</span>
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}
