"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import MatchCard from "@/components/MatchCard";
import { allTeams } from "@/data/teams";
import { allWorldCupMatches, formatMatchDate } from "@/data/matches";
import { usePreferences } from "@/context/PreferencesContext";
import PreferencesEditor from "./PreferencesEditor";

interface MyPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  relatedTeams: string[];
  publishedAt: string | null;
  summary: string | null;
}

interface PredictionMe {
  picks: Record<string, "home" | "draw" | "away">;
  stats: { correct: number; total: number; streak: number };
}

interface MyPageClientProps {
  posts: MyPost[];
  todayISO: string;
}

export default function MyPageClient({ posts, todayISO }: MyPageClientProps) {
  const { prefs, hydrated } = usePreferences();
  const [me, setMe] = useState<PredictionMe | null>(null);

  const favoriteCountries = prefs.favoriteCountries;

  useEffect(() => {
    if (!hydrated) return;
    fetch("/api/predictions/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setMe(data);
      })
      .catch(() => {
        // silently fail — predictions API may not be wired up yet
      });
  }, [hydrated]);

  const favoriteTeamNames = useMemo(() => {
    return favoriteCountries
      .map((code) => allTeams.find((t) => t.code === code)?.name)
      .filter(Boolean) as string[];
  }, [favoriteCountries]);

  const favoriteMatches = useMemo(() => {
    if (favoriteTeamNames.length === 0) return [];
    return allWorldCupMatches
      .filter(
        (m) =>
          favoriteTeamNames.includes(m.homeTeam) || favoriteTeamNames.includes(m.awayTeam)
      )
      .filter((m) => m.date >= todayISO)
      .slice(0, 5);
  }, [favoriteTeamNames, todayISO]);

  const favoritePosts = useMemo(() => {
    if (favoriteCountries.length === 0) return [];
    return posts
      .filter((p) => (p.relatedTeams || []).some((c) => favoriteCountries.includes(c)))
      .slice(0, 5);
  }, [posts, favoriteCountries]);

  if (!hydrated) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Icon name="hourglass_empty" size={32} className="mb-3" />
        <p className="text-sm">読み込み中...</p>
      </div>
    );
  }

  if (favoriteCountries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center">
        <Icon name="favorite_border" size={48} className="text-gray-300 mb-4" />
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          応援する国が設定されていません
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          応援する国を選ぶと、ここに試合・ニュース・予想履歴がまとめて表示されます。
        </p>
        <PreferencesEditor />
      </div>
    );
  }

  const hitRate =
    me && me.stats.total > 0
      ? Math.round((me.stats.correct / me.stats.total) * 100)
      : null;

  return (
    <>
      {/* 応援国サマリ */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-5 border border-red-100">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Icon name="favorite" size={18} className="text-red-500" />
                <span className="text-xs font-medium text-red-600">
                  あなたの応援国 ({favoriteCountries.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {favoriteCountries.map((code) => {
                  const team = allTeams.find((t) => t.code === code);
                  if (!team) return null;
                  return (
                    <span
                      key={code}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-red-200 text-xs font-medium text-gray-700"
                    >
                      <span>{team.flag}</span>
                      {team.name}
                    </span>
                  );
                })}
              </div>
            </div>
            <PreferencesEditor />
          </div>
        </div>
      </section>

      {/* 予想的中率 */}
      {me && (
        <section className="mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-1.5">
            <Icon name="insights" size={20} className="text-gray-700" />
            あなたの予想成績
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <div className="text-xs text-gray-500 mb-1">投票数</div>
              <div className="text-2xl font-black text-gray-900">
                {Object.keys(me.picks).length}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <div className="text-xs text-gray-500 mb-1">的中数</div>
              <div className="text-2xl font-black text-gray-900">{me.stats.correct}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <div className="text-xs text-gray-500 mb-1">的中率</div>
              <div className="text-2xl font-black text-gray-900">
                {hitRate !== null ? `${hitRate}%` : "-"}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 応援国の次の試合 */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-1.5">
          <Icon name="sports_soccer" size={20} className="text-gray-700" />
          応援国の次の試合
        </h2>
        {favoriteMatches.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-gray-400">
            該当する試合はまだ組まれていません
          </div>
        ) : (
          <div className="space-y-3">
            {favoriteMatches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </section>

      {/* 応援国関連ニュース */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
            <Icon name="article" size={20} className="text-gray-700" />
            応援国のニュース
          </h2>
          <Link
            href="/news"
            className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            すべて見る
            <Icon name="arrow_forward" size={14} />
          </Link>
        </div>
        {favoritePosts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-gray-400">
            関連記事はまだありません
          </div>
        ) : (
          <div className="space-y-3">
            {favoritePosts.map((p) => (
              <Link
                key={p.id}
                href={`/news/${p.slug}`}
                className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {p.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {p.category}
                    </span>
                  )}
                  {p.publishedAt && (
                    <span className="text-xs text-gray-400">{formatMatchDate(p.publishedAt)}</span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-gray-900 leading-snug">{p.title}</h3>
                {p.summary && (
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                    {p.summary}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
