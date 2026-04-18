"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

type RankingType = "hits" | "predictions" | "visits";

interface RankingEntry {
  rank: number;
  nickname: string;
  score: number;
  isSelf: boolean;
}

interface RankingResponse {
  configured: boolean;
  type?: RankingType;
  entries: RankingEntry[];
}

const TABS: { key: RankingType; label: string; icon: string; unit: string }[] = [
  { key: "hits", label: "予想的中", icon: "military_tech", unit: "的中" },
  { key: "predictions", label: "予想数", icon: "how_to_vote", unit: "予想" },
  { key: "visits", label: "訪問数", icon: "visibility", unit: "回" },
];

const RANK_MEDAL: Record<number, { color: string; icon: string }> = {
  1: { color: "bg-yellow-400 text-yellow-900", icon: "emoji_events" },
  2: { color: "bg-gray-300 text-gray-700", icon: "emoji_events" },
  3: { color: "bg-amber-600 text-amber-50", icon: "emoji_events" },
};

export default function RankingsClient() {
  const [active, setActive] = useState<RankingType>("hits");
  const [data, setData] = useState<Record<RankingType, RankingResponse | null>>({
    hits: null,
    predictions: null,
    visits: null,
  });
  const [loading, setLoading] = useState<Record<RankingType, boolean>>({
    hits: false,
    predictions: false,
    visits: false,
  });

  useEffect(() => {
    if (data[active] !== null) return;
    setLoading((s) => ({ ...s, [active]: true }));
    fetch(`/api/rankings?type=${active}&limit=20`)
      .then((r) => r.json())
      .then((json: RankingResponse) => {
        setData((s) => ({ ...s, [active]: json }));
      })
      .catch(() => {
        setData((s) => ({ ...s, [active]: { configured: true, entries: [] } }));
      })
      .finally(() => {
        setLoading((s) => ({ ...s, [active]: false }));
      });
  }, [active, data]);

  const current = data[active];
  const isLoading = loading[active];
  const activeTab = TABS.find((t) => t.key === active)!;

  return (
    <>
      {/* タブ */}
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-medium text-sm transition-colors border ${
                isActive
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              <Icon name={tab.icon} size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ランキング表示 */}
      {isLoading && !current ? (
        <div className="text-center py-16 text-gray-400">
          <Icon name="hourglass_empty" size={32} className="mb-3" />
          <p className="text-sm">読み込み中...</p>
        </div>
      ) : current && current.configured === false ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center text-sm text-amber-800">
          ランキングは準備中です
        </div>
      ) : current && current.entries.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-sm text-gray-400">
          <Icon name="workspace_premium" size={40} className="mb-3 text-gray-300" />
          <p>
            まだ{activeTab.label}ランキングに登録されているユーザがいません。
            <br />
            <Link href="/mypage" className="text-blue-600 hover:underline">
              マイページでニックネームを設定
            </Link>{" "}
            して1位を目指しましょう！
          </p>
        </div>
      ) : current ? (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {current.entries.map((e) => {
            const medal = RANK_MEDAL[e.rank];
            return (
              <div
                key={`${e.rank}-${e.nickname}`}
                className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-b-0 ${
                  e.isSelf ? "bg-blue-50" : ""
                }`}
              >
                <div className="w-9 shrink-0 flex items-center justify-center">
                  {medal ? (
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${medal.color}`}
                    >
                      {e.rank}
                    </span>
                  ) : (
                    <span className="text-sm font-mono text-gray-400">{e.rank}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-gray-900 truncate">{e.nickname}</span>
                    {e.isSelf && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-600 text-white font-medium">
                        あなた
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-gray-900">{e.score}</span>
                  <span className="text-xs text-gray-400 ml-1">{activeTab.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
        <p className="font-semibold text-gray-700 mb-1 flex items-center gap-1">
          <Icon name="info" size={14} className="text-gray-500" />
          ランキングについて
        </p>
        <ul className="space-y-0.5 pl-4 list-disc">
          <li>ニックネーム設定後に予想・訪問したものから集計されます</li>
          <li>
            予想数は投票した試合数、予想的中は試合結果確定後の集計（最大1時間遅延）
          </li>
          <li>訪問数は同一ブラウザ6時間以内の連続アクセスは1回としてカウント</li>
        </ul>
      </div>
    </>
  );
}
