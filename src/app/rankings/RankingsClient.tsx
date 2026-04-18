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

interface AroundResponse {
  configured: boolean;
  type: RankingType;
  myRank: number | null;
  myScore?: number;
  entries: RankingEntry[];
}

interface HitRateEntry {
  rank: number;
  nickname: string;
  correct: number;
  total: number;
  ratio: number;
  isSelf: boolean;
}

interface GlobalStats {
  totalUsers: number;
  totalPredictions: number;
  totalVisits: number;
}

const TAB_DEFS: Record<RankingType, { key: RankingType; label: string; icon: string; unit: string }> = {
  hits: { key: "hits", label: "予想的中", icon: "military_tech", unit: "的中" },
  predictions: { key: "predictions", label: "予想数", icon: "how_to_vote", unit: "予想" },
  visits: { key: "visits", label: "訪問数", icon: "visibility", unit: "回" },
};

const WC_OPENING_ISO = "2026-06-11";

function getTabOrder(): RankingType[] {
  const todayISO = new Date().toISOString().slice(0, 10);
  if (todayISO < WC_OPENING_ISO) {
    return ["predictions", "visits", "hits"];
  }
  return ["hits", "predictions", "visits"];
}

const RANK_MEDAL: Record<number, { color: string; ring: string }> = {
  1: { color: "bg-gradient-to-br from-yellow-300 to-amber-500 text-white shadow-md", ring: "ring-yellow-200" },
  2: { color: "bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-md", ring: "ring-gray-200" },
  3: { color: "bg-gradient-to-br from-amber-500 to-orange-700 text-white shadow-md", ring: "ring-amber-200" },
};

function formatNumber(n: number): string {
  return n.toLocaleString("ja-JP");
}

export default function RankingsClient() {
  const tabOrder = getTabOrder();
  const tabs = tabOrder.map((k) => TAB_DEFS[k]);
  const [active, setActive] = useState<RankingType>(tabOrder[0]);

  const [topData, setTopData] = useState<Record<RankingType, RankingResponse | null>>({
    hits: null,
    predictions: null,
    visits: null,
  });
  const [aroundData, setAroundData] = useState<Record<RankingType, AroundResponse | null>>({
    hits: null,
    predictions: null,
    visits: null,
  });
  const [loading, setLoading] = useState<Record<RankingType, boolean>>({
    hits: false,
    predictions: false,
    visits: false,
  });

  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [hitRate, setHitRate] = useState<HitRateEntry[] | null>(null);

  // 全体統計
  useEffect(() => {
    fetch("/api/rankings/global")
      .then((r) => r.json())
      .then((data) => {
        if (data.configured && data.stats) setGlobalStats(data.stats);
      })
      .catch(() => {});
    fetch("/api/rankings?type=hitrate&limit=10")
      .then((r) => r.json())
      .then((data) => {
        if (data.configured && Array.isArray(data.entries)) setHitRate(data.entries);
      })
      .catch(() => {});
  }, []);

  // アクティブなタブの Top と Around をロード
  useEffect(() => {
    if (topData[active] !== null) return;
    setLoading((s) => ({ ...s, [active]: true }));

    Promise.all([
      fetch(`/api/rankings?type=${active}&limit=20`).then((r) => r.json()),
      fetch(`/api/rankings?section=around&type=${active}&window=5`).then((r) => r.json()),
    ])
      .then(([top, around]) => {
        setTopData((s) => ({ ...s, [active]: top }));
        setAroundData((s) => ({ ...s, [active]: around }));
      })
      .catch(() => {
        setTopData((s) => ({ ...s, [active]: { configured: true, entries: [] } }));
      })
      .finally(() => {
        setLoading((s) => ({ ...s, [active]: false }));
      });
  }, [active, topData]);

  const currentTop = topData[active];
  const currentAround = aroundData[active];
  const isLoading = loading[active];
  const activeTab = TAB_DEFS[active];

  // Top 20 を 3位までと4位以降で分離
  const topEntries = currentTop?.entries ?? [];
  const podium = topEntries.slice(0, 3);
  const restEntries = topEntries.slice(3);

  // 自分の順位がTop20外にある場合のみAround表示
  const shouldShowAround =
    currentAround?.myRank != null && currentAround.myRank > 20;

  return (
    <>
      {/* 全体統計ヘッダー */}
      <section className="mb-8">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[
            {
              label: "参加ユーザ",
              value: globalStats?.totalUsers ?? 0,
              unit: "人",
              icon: "groups",
              color: "from-violet-500 to-purple-600",
            },
            {
              label: "累計予想",
              value: globalStats?.totalPredictions ?? 0,
              unit: "件",
              icon: "how_to_vote",
              color: "from-pink-500 to-rose-600",
            },
            {
              label: "累計訪問",
              value: globalStats?.totalVisits ?? 0,
              unit: "回",
              icon: "visibility",
              color: "from-cyan-500 to-blue-600",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`bg-gradient-to-br ${stat.color} text-white rounded-2xl p-3 sm:p-4 shadow-md`}
            >
              <div className="flex items-center gap-1 mb-1 opacity-90">
                <Icon name={stat.icon} size={16} />
                <span className="text-[10px] sm:text-xs font-medium">{stat.label}</span>
              </div>
              <div className="text-xl sm:text-3xl font-black leading-none">
                {globalStats ? formatNumber(stat.value) : "-"}
                <span className="text-xs sm:text-sm font-medium opacity-80 ml-1">
                  {stat.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* タブ */}
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
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
      {isLoading && !currentTop ? (
        <div className="text-center py-16 text-gray-400">
          <Icon name="hourglass_empty" size={32} className="mb-3" />
          <p className="text-sm">読み込み中...</p>
        </div>
      ) : currentTop && currentTop.configured === false ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center text-sm text-amber-800">
          ランキングは準備中です
        </div>
      ) : topEntries.length === 0 ? (
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
      ) : (
        <>
          {/* トップ3 ポディウム */}
          {podium.length > 0 && (
            <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
              {/* 2位 */}
              <div className="flex flex-col items-center pt-4 sm:pt-6 order-1">
                {podium[1] ? (
                  <PodiumCard entry={podium[1]} medalKey={2} unit={activeTab.unit} />
                ) : (
                  <EmptyPodiumCard rank={2} />
                )}
              </div>
              {/* 1位 */}
              <div className="flex flex-col items-center order-2">
                {podium[0] ? (
                  <PodiumCard entry={podium[0]} medalKey={1} unit={activeTab.unit} taller />
                ) : (
                  <EmptyPodiumCard rank={1} taller />
                )}
              </div>
              {/* 3位 */}
              <div className="flex flex-col items-center pt-4 sm:pt-6 order-3">
                {podium[2] ? (
                  <PodiumCard entry={podium[2]} medalKey={3} unit={activeTab.unit} />
                ) : (
                  <EmptyPodiumCard rank={3} />
                )}
              </div>
            </div>
          )}

          {/* 4位以降のリスト */}
          {restEntries.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {restEntries.map((e) => (
                <RankingRow key={`${e.rank}-${e.nickname}`} entry={e} unit={activeTab.unit} />
              ))}
            </div>
          )}
        </>
      )}

      {/* あなたの順位 ±5 */}
      {shouldShowAround && currentAround && currentAround.entries.length > 0 && (
        <section className="mt-8">
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-1.5">
            <Icon name="person_pin" size={20} className="text-blue-600" />
            あなたの順位
            <span className="ml-auto text-sm text-gray-500">
              {currentAround.myRank}位 / {activeTab.label}
            </span>
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {currentAround.entries.map((e) => (
              <RankingRow key={`around-${e.rank}-${e.nickname}`} entry={e} unit={activeTab.unit} />
            ))}
          </div>
        </section>
      )}

      {/* 予想職人 (的中率) */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
            <Icon name="psychology" size={20} className="text-purple-600" />
            予想職人
            <span className="text-xs text-gray-400 font-normal ml-1">
              的中率ランキング（5予想以上）
            </span>
          </h2>
        </div>
        {hitRate === null ? (
          <div className="bg-white border border-gray-100 rounded-xl p-6 text-center text-xs text-gray-400">
            読み込み中...
          </div>
        ) : hitRate.length === 0 ? (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center text-xs text-purple-700">
            <Icon name="insights" size={28} className="mb-2 text-purple-400" />
            <p>
              W杯開催後、5予想以上&試合結果確定済みのユーザが出たら
              <br />
              ここに「予想の達人」が表示されます
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {hitRate.map((e) => (
              <div
                key={`hr-${e.rank}-${e.nickname}`}
                className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-b-0 ${
                  e.isSelf ? "bg-blue-50" : ""
                }`}
              >
                <div className="w-9 shrink-0 flex items-center justify-center">
                  {RANK_MEDAL[e.rank] ? (
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${RANK_MEDAL[e.rank].color}`}
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
                  <div className="text-[11px] text-gray-500">
                    {e.correct} 的中 / {e.total} 予想
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-purple-700">{e.ratio}</span>
                  <span className="text-xs text-purple-400 ml-0.5">%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 補足 */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
        <p className="font-semibold text-gray-700 mb-1 flex items-center gap-1">
          <Icon name="info" size={14} className="text-gray-500" />
          ランキングについて
        </p>
        <ul className="space-y-0.5 pl-4 list-disc">
          <li>ニックネーム設定後に予想・訪問したものから集計されます</li>
          <li>予想数は投票した試合数、予想的中は試合結果確定後の集計（最大1時間遅延）</li>
          <li>訪問数は同一ブラウザ6時間以内の連続アクセスは1回としてカウント</li>
          <li>予想職人（的中率）は5予想以上の中から算出されます</li>
        </ul>
      </div>
    </>
  );
}

function RankingRow({ entry, unit }: { entry: RankingEntry; unit: string }) {
  const medal = RANK_MEDAL[entry.rank];
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-b-0 ${
        entry.isSelf ? "bg-blue-50" : ""
      }`}
    >
      <div className="w-9 shrink-0 flex items-center justify-center">
        {medal ? (
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${medal.color}`}
          >
            {entry.rank}
          </span>
        ) : (
          <span className="text-sm font-mono text-gray-400">{entry.rank}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-gray-900 truncate">{entry.nickname}</span>
          {entry.isSelf && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-600 text-white font-medium">
              あなた
            </span>
          )}
        </div>
      </div>
      <div className="text-right">
        <span className="text-lg font-black text-gray-900">{entry.score}</span>
        <span className="text-xs text-gray-400 ml-1">{unit}</span>
      </div>
    </div>
  );
}

function PodiumCard({
  entry,
  medalKey,
  unit,
  taller = false,
}: {
  entry: RankingEntry;
  medalKey: 1 | 2 | 3;
  unit: string;
  taller?: boolean;
}) {
  const medal = RANK_MEDAL[medalKey];
  const iconName = medalKey === 1 ? "emoji_events" : "workspace_premium";
  return (
    <div
      className={`w-full flex flex-col items-center bg-white border border-gray-100 rounded-2xl p-3 sm:p-4 shadow-sm relative ring-4 ${medal.ring} ${
        entry.isSelf ? "outline outline-2 outline-blue-500" : ""
      }`}
    >
      <span
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${medal.color} absolute -top-5`}
      >
        <Icon name={iconName} size={medalKey === 1 ? 24 : 20} />
      </span>
      <div className={`pt-5 sm:pt-6 ${taller ? "pb-2" : ""} w-full text-center`}>
        <div className="text-[10px] sm:text-xs font-bold text-gray-400 mb-0.5">
          {medalKey === 1 ? "優勝" : medalKey === 2 ? "2位" : "3位"}
        </div>
        <div className="text-xs sm:text-sm font-bold text-gray-900 truncate px-1">
          {entry.nickname}
        </div>
        {entry.isSelf && (
          <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded-full bg-blue-600 text-white font-medium">
            あなた
          </span>
        )}
        <div className={`mt-1 ${taller ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"} font-black text-gray-900`}>
          {entry.score}
          <span className="text-[10px] sm:text-xs text-gray-400 ml-1 font-medium">{unit}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyPodiumCard({ rank, taller = false }: { rank: 1 | 2 | 3; taller?: boolean }) {
  return (
    <div
      className={`w-full flex flex-col items-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-3 sm:p-4 ${
        taller ? "py-8" : "py-6"
      } relative`}
    >
      <div className="text-center">
        <div className="text-xs font-bold text-gray-300 mb-1">
          {rank === 1 ? "優勝" : rank === 2 ? "2位" : "3位"}
        </div>
        <div className="text-xs text-gray-400">？？？</div>
      </div>
    </div>
  );
}
