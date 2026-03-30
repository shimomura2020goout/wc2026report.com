import Link from "next/link";
import Icon from "./Icon";
import { getPublishedPosts } from "@/lib/notion";

export default async function LatestNewsBanner() {
  let latestPost = null;

  try {
    const posts = await getPublishedPosts();
    if (posts.length > 0) {
      latestPost = posts[0];
    }
  } catch {
    // Notion API が利用できない場合はバナーを表示しない
    return null;
  }

  if (!latestPost || !latestPost.slug) return null;

  // 公開日が7日以上前の記事はNEWバッジを表示しない
  const isRecent = latestPost.publishedAt
    ? (Date.now() - new Date(latestPost.publishedAt).getTime()) < 7 * 24 * 60 * 60 * 1000
    : false;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <Link
          href={`/news/${latestPost.slug}`}
          className="flex items-center gap-2 py-2 text-sm hover:opacity-90 transition-opacity group"
        >
          {isRecent && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider shrink-0 animate-pulse">
              NEW
            </span>
          )}
          <Icon name="article" size={16} className="shrink-0 opacity-80" />
          <span className="truncate font-medium">{latestPost.title}</span>
          {latestPost.publishedAt && (
            <span className="text-xs opacity-60 shrink-0 hidden sm:inline">
              ({latestPost.publishedAt})
            </span>
          )}
          <Icon name="arrow_forward" size={14} className="shrink-0 opacity-60 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
