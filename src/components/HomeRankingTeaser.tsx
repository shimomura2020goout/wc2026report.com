"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";

interface GlobalStats {
  totalUsers: number;
  totalPredictions: number;
  totalVisits: number;
}

interface TopEntry {
  rank: number;
  nickname: string;
  score: number;
}

const RANK_COLORS: Record<number, string> = {
  1: "bg-gradient-to-br from-yellow-300 to-amber-500 text-white shadow-md",
  2: "bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-md",
  3: "bg-gradient-to-br from-amber-500 to-orange-700 text-white shadow-md",
};

export default function HomeRankingTeaser() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [top, setTop] = useState<TopEntry[]>([]);

  useEffect(() => {
    fetch("/api/rankings/global")
      .then((r) => r.json())
      .then((d) => {
        if (d.configured && d.stats) setStats(d.stats);
      })
      .catch(() => {});
    fetch("/api/rankings?type=predictions&limit=3")
      .then((r) => r.json())
      .then((d) => {
        if (d.configured && Array.isArray(d.entries)) setTop(d.entries);
      })
      .catch(() => {});
  }, []);

  const statCards = [
    { label: "参加ユーザ", value: stats?.totalUsers, unit: "人", icon: "groups", color: "from-violet-500 to-purple-600" },
    { label: "累計予想", value: stats?.totalPredictions, unit: "件", icon: "how_to_vote", color: "from-pink-500 to-rose-600" },
    { label: "累計訪問", value: stats?.totalVisits, unit: "回", icon: "visibility", color: "from-cyan-500 to-blue-600" },
  ];

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
        {statCards.map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} text-white rounded-2xl p-3 sm:p-4 shadow-md`}>
            <div className="flex items-center gap-1 mb-1 opacity-90">
              <Icon name={s.icon} size={16} />
              <span className="text-[10px] sm:text-xs font-medium">{s.label}</span>
            </div>
            <div className="text-xl sm:text-3xl font-black leading-none">
              {s.value != null ? s.value.toLocaleString("ja-JP") : "-"}
              <span className="text-xs sm:text-sm font-medium opacity-80 ml-1">{s.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {top.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-4">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600 flex items-center gap-1.5">
            <Icon name="how_to_vote" size={14} className="text-pink-600" />
            予想数ランキング TOP 3
          </div>
          {top.map((e) => (
            <div key={`home-rank-${e.rank}`} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-b-0">
              <div className="w-9 shrink-0 flex items-center justify-center">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${RANK_COLORS[e.rank] ?? "bg-gray-200 text-gray-600"}`}>
                  {e.rank}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-gray-900 truncate">{e.nickname}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-gray-900">{e.score}</span>
                <span className="text-xs text-gray-400 ml-1">予想</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400 mb-4">
          <Icon name="workspace_premium" size={32} className="mb-2 text-gray-300" />
          <p>
            まだランキングに登録されているユーザはいません。
            <br className="hidden sm:block" />
            あなたが1位を目指してみませんか？
          </p>
        </div>
      )}

      <div className="text-center">
        <Link
          href="/rankings"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          すべてのランキングを見る
          <Icon name="arrow_forward" size={16} />
        </Link>
      </div>
    </div>
  );
}
