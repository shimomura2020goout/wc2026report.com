"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Icon from "./Icon";
import { usePreferences } from "@/context/PreferencesContext";
import { allTeams } from "@/data/teams";

interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  relatedTeams?: string[];
  publishedAt: string | null;
  summary: string | null;
}

interface NewsFilteredListProps {
  posts: Post[];
  categoryColors: Record<string, string>;
  labels: {
    all: string;
    readArticle: string;
    noArticles: string;
    searchPlaceholder: string;
    searchNoResults: string;
    searchClear: string;
  };
}

const FAVORITE_TAB_ID = "__favorite__";

export default function NewsFilteredList({ posts, categoryColors, labels }: NewsFilteredListProps) {
  const { prefs, hydrated } = usePreferences();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const favoriteCountries = prefs.favoriteCountries;
  const hasFavorites = hydrated && favoriteCountries.length > 0;

  const favoriteCountryNames = useMemo(() => {
    return favoriteCountries
      .map((code) => allTeams.find((t) => t.code === code)?.name)
      .filter(Boolean)
      .join("・");
  }, [favoriteCountries]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(posts.map((p) => p.category).filter(Boolean)));
    const order = Object.keys(categoryColors);
    return cats.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }, [posts, categoryColors]);

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const hasSearchQuery = normalizedQuery.length > 0;

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (activeTab === FAVORITE_TAB_ID) {
      result = result.filter((p) =>
        (p.relatedTeams || []).some((code) => favoriteCountries.includes(code))
      );
    } else if (activeTab) {
      result = result.filter((p) => p.category === activeTab);
    }
    if (hasSearchQuery) {
      result = result.filter((p) => {
        const title = p.title?.toLocaleLowerCase() ?? "";
        const summary = p.summary?.toLocaleLowerCase() ?? "";
        return title.includes(normalizedQuery) || summary.includes(normalizedQuery);
      });
    }
    return result;
  }, [posts, activeTab, favoriteCountries, hasSearchQuery, normalizedQuery]);

  return (
    <>
      {/* ── 検索 & カテゴリフィルタ（スティッキー） ── */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 -mx-4 px-4 py-3 space-y-3">
        {/* 検索バー */}
        <div className="relative">
          <Icon
            name="search"
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="search"
            inputMode="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={labels.searchPlaceholder}
            aria-label={labels.searchPlaceholder}
            className="w-full text-base sm:text-sm pl-9 pr-9 py-2 rounded-full border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
          />
          {hasSearchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label={labels.searchClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Icon name="close" size={16} />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {hasFavorites && (
            <button
              onClick={() =>
                setActiveTab(activeTab === FAVORITE_TAB_ID ? null : FAVORITE_TAB_ID)
              }
              className={`shrink-0 flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium transition-all border ${
                activeTab === FAVORITE_TAB_ID
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-red-50 text-red-600 border-red-200 hover:border-red-300"
              }`}
              title={`応援国: ${favoriteCountryNames}`}
            >
              <Icon name="favorite" size={14} />
              マイ応援国
            </button>
          )}
          <button
            onClick={() => setActiveTab(null)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all border ${
              activeTab === null
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {labels.all}
          </button>
          {categories.map((cat) => {
            const isActive = activeTab === cat;
            const colorClass = categoryColors[cat] || "bg-gray-100 text-gray-600";
            return (
              <button
                key={cat}
                onClick={() => setActiveTab(isActive ? null : cat)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all border ${
                  isActive
                    ? `${colorClass} border-current ring-1 ring-current/20`
                    : `${colorClass} border-transparent opacity-70 hover:opacity-100`
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 記事リスト ── */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Icon name={hasSearchQuery ? "search_off" : "edit_note"} size={48} className="mb-4" />
          <p>
            {hasSearchQuery
              ? labels.searchNoResults
              : activeTab === FAVORITE_TAB_ID
                ? "応援国に関連する記事はまだありません"
                : labels.noArticles}
          </p>
        </div>
      ) : (
        <div className="space-y-6 mt-6">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/news/${post.slug}`}
              className="block match-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:border-gray-200"
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {post.category && (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${categoryColors[post.category] || "bg-gray-100 text-gray-600"}`}>
                      {post.category}
                    </span>
                  )}
                  {post.publishedAt && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Icon name="schedule" size={14} />
                      {post.publishedAt}
                    </span>
                  )}
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-snug">
                  {post.title}
                </h2>

                {post.summary && (
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">
                    {post.summary}
                  </p>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-1 text-sm text-blue-600 font-medium">
                  {labels.readArticle}
                  <Icon name="arrow_forward" size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
