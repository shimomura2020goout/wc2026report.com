"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Icon from "./Icon";

interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
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
  };
}

export default function NewsFilteredList({ posts, categoryColors, labels }: NewsFilteredListProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // 投稿から存在するカテゴリ一覧を動的に取得
  const categories = useMemo(() => {
    const cats = Array.from(new Set(posts.map((p) => p.category).filter(Boolean)));
    // categoryColors に定義された順序を維持
    const order = Object.keys(categoryColors);
    return cats.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }, [posts, categoryColors]);

  const filteredPosts = useMemo(() => {
    if (!activeCategory) return posts;
    return posts.filter((p) => p.category === activeCategory);
  }, [posts, activeCategory]);

  return (
    <>
      {/* ── カテゴリフィルタバー（スティッキー） ── */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 -mx-4 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all border ${
              activeCategory === null
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {labels.all}
          </button>
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const colorClass = categoryColors[cat] || "bg-gray-100 text-gray-600";
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(isActive ? null : cat)}
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
          <Icon name="edit_note" size={48} className="mb-4" />
          <p>{labels.noArticles}</p>
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
