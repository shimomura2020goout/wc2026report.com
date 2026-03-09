import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import { getPublishedPosts } from "@/lib/notion";

export const metadata: Metadata = {
  title: "ニュース・コラム",
  description: "W杯2026に関する最新ニュース、試合プレビュー、チーム分析、toto攻略コラムを毎日更新。",
};

// ISR: 5分ごとに再生成
export const revalidate = 300;

const categoryColors: Record<string, string> = {
  "試合プレビュー": "bg-blue-100 text-blue-700",
  "チーム分析": "bg-purple-100 text-purple-700",
  "toto攻略": "bg-pink-100 text-pink-700",
  "視聴ガイド": "bg-orange-100 text-orange-700",
  "ニュース": "bg-green-100 text-green-700",
  "コラム": "bg-yellow-100 text-yellow-700",
};

export default async function NewsPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Icon name="article" size={32} className="text-gray-700" />
        ニュース・コラム
      </h1>
      <p className="text-gray-500 mb-8">
        W杯2026の最新情報、試合プレビュー、toto攻略を毎日更新
      </p>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Icon name="edit_note" size={48} className="mb-4" />
          <p>まだ記事がありません。公開をお待ちください。</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
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
                  記事を読む
                  <Icon name="arrow_forward" size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
