"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import MatchCard from "@/components/MatchCard";
import PredictionBadge from "@/components/PredictionBadge";
import NicknameEditor from "@/components/NicknameEditor";
import { allTeams } from "@/data/teams";
import { allWorldCupMatches, formatMatchDate } from "@/data/matches";
import { usePreferences } from "@/context/PreferencesContext";
import PreferencesEditor from "./PreferencesEditor";

const INITIAL_VISIBLE = 5;

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
  stats: {
    correct: number;
    total: number;
    streak: number;
    pickCount: number;
    visits: number;
  };
}

interface ProfileData {
  nickname: string | null;
  auto: boolean;
}

interface MyPageClientProps {
  posts: MyPost[];
  todayISO: string;
}

export default function MyPageClient({ posts, todayISO }: MyPageClientProps) {
  const { prefs, hydrated } = usePreferences();
  const [me, setMe] = useState<PredictionMe | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [matchesExpanded, setMatchesExpanded] = useState(false);
  const [postsExpanded, setPostsExpanded] = useState(false);

  const favoriteCountries = prefs.favoriteCountries;

  useEffect(() => {
    if (!hydrated) return;
    fetch("/api/predictions/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setMe(data);
      })
      .catch(() => {});
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setProfile({ nickname: data.nickname ?? null, auto: Boolean(data.auto) });
      })
      .catch(() => {});
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
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.kickoff.localeCompare(b.kickoff);
      });
  }, [favoriteTeamNames, todayISO]);

  const favoritePosts = useMemo(() => {
    if (favoriteCountries.length === 0) return [];
    return posts.filter((p) =>
      (p.relatedTeams || []).some((c) => favoriteCountries.includes(c))
    );
  }, [posts, favoriteCountries]);

  const visibleMatches = matchesExpanded
    ? favoriteMatches
    : favoriteMatches.slice(0, INITIAL_VISIBLE);
  const visiblePosts = postsExpanded
    ? favoritePosts
    : favoritePosts.slice(0, INITIAL_VISIBLE);

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
      {/* ニックネーム */}
      <section className="mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <NicknameEditor
            initialNickname={profile?.nickname ?? null}
            isAuto={profile?.auto ?? false}
            onSaved={(n) => setProfile({ nickname: n, auto: false })}
          />
        </div>
      </section>

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
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
              <Icon name="insights" size={20} className="text-gray-700" />
              あなたの予想成績
            </h2>
            <Link
              href="/rankings"
              className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              ランキングを見る
              <Icon name="arrow_forward" size={14} />
            </Link>
          </div>
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
          {profile?.auto && (
            <p className="mt-3 text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              <Icon name="info" size={14} className="inline mr-1 text-amber-600" />
              現在は自動割当ニックネーム（{profile.nickname}）です。マイページ上部から好きな名前に変更できます。
            </p>
          )}
        </section>
      )}

      {/* 応援国の次の試合 */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-1.5">
          <Icon name="sports_soccer" size={20} className="text-gray-700" />
          応援国の次の試合
          {favoriteMatches.length > 0 && (
            <span className="text-xs text-gray-400 font-normal">({favoriteMatches.length})</span>
          )}
        </h2>
        {favoriteMatches.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-gray-400">
            該当する試合はまだ組まれていません
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {visibleMatches.map((m) => {
                const pick = me?.picks[m.id];
                return (
                  <div key={m.id}>
                    <MatchCard match={m} />
                    {pick && (
                      <div className="mt-1.5 flex">
                        <PredictionBadge pick={pick} homeTeam={m.homeTeam} awayTeam={m.awayTeam} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {favoriteMatches.length > INITIAL_VISIBLE && (
              <button
                type="button"
                onClick={() => setMatchesExpanded((v) => !v)}
                className="mt-3 w-full flex items-center justify-center gap-1 py-2.5 text-sm font-medium text-blue-600 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-colors"
              >
                {matchesExpanded ? (
                  <>
                    <Icon name="expand_less" size={18} />
                    閉じる
                  </>
                ) : (
                  <>
                    <Icon name="expand_more" size={18} />
                    もっと見る（残り {favoriteMatches.length - INITIAL_VISIBLE} 試合）
                  </>
                )}
              </button>
            )}
          </>
        )}
      </section>

      {/* 応援国関連ニュース */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
            <Icon name="article" size={20} className="text-gray-700" />
            応援国のニュース
            {favoritePosts.length > 0 && (
              <span className="text-xs text-gray-400 font-normal">({favoritePosts.length})</span>
            )}
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
          <>
            <div className="space-y-3">
              {visiblePosts.map((p) => (
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
            {favoritePosts.length > INITIAL_VISIBLE && (
              <button
                type="button"
                onClick={() => setPostsExpanded((v) => !v)}
                className="mt-3 w-full flex items-center justify-center gap-1 py-2.5 text-sm font-medium text-blue-600 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-colors"
              >
                {postsExpanded ? (
                  <>
                    <Icon name="expand_less" size={18} />
                    閉じる
                  </>
                ) : (
                  <>
                    <Icon name="expand_more" size={18} />
                    もっと見る（残り {favoritePosts.length - INITIAL_VISIBLE} 件）
                  </>
                )}
              </button>
            )}
          </>
        )}
      </section>
    </>
  );
}
