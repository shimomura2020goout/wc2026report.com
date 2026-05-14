"use client";

import Link from "next/link";
import Icon from "./Icon";
import type { NewsBannerItem } from "./LatestNewsBanner";

export default function LatestNewsBannerClient({ posts }: { posts: NewsBannerItem[] }) {
  const now = Date.now();

  return (
    <div className="z-40 text-white bg-gradient-to-r from-blue-600 to-indigo-700">
      <div className="max-w-7xl mx-auto px-4">
        {posts.map((post, i) => {
          const isRecent = post.publishedAt
            ? now - new Date(post.publishedAt).getTime() < 3 * 24 * 60 * 60 * 1000
            : false;

          return (
            <Link
              key={post.slug}
              href={`/news/${post.slug}`}
              className={`flex items-center gap-2 text-sm py-2 hover:opacity-80 transition-opacity group ${
                i > 0 ? "border-t border-white/10" : ""
              }`}
            >
              {isRecent && (
                <span className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider shrink-0 bg-red-500 animate-pulse">
                  NEW
                </span>
              )}
              <Icon name="article" size={15} className="shrink-0 opacity-70" />
              <span className="truncate text-sm font-medium">
                {post.title}
              </span>
              {post.publishedAt && (
                <span className="text-[11px] opacity-50 shrink-0 hidden sm:inline">
                  ({post.publishedAt})
                </span>
              )}
              <Icon
                name="chevron_right"
                size={14}
                className="shrink-0 opacity-50 group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
