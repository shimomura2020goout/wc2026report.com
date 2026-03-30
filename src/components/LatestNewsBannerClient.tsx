"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Icon from "./Icon";
import type { NewsBannerItem } from "./LatestNewsBanner";

export default function LatestNewsBannerClient({ posts }: { posts: NewsBannerItem[] }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const now = Date.now();

  return (
    <div
      className={`transition-all duration-300 z-40 ${
        isScrolled
          ? "sticky top-16 bg-[#1a1a2e]/90 backdrop-blur-sm border-b border-white/5"
          : "bg-gradient-to-r from-blue-600 to-indigo-700"
      } text-white`}
    >
      <div className="max-w-7xl mx-auto px-4">
        {posts.map((post, i) => {
          const isRecent = post.publishedAt
            ? now - new Date(post.publishedAt).getTime() < 3 * 24 * 60 * 60 * 1000
            : false;

          return (
            <Link
              key={post.slug}
              href={`/news/${post.slug}`}
              className={`flex items-center gap-2 text-sm hover:opacity-80 transition-opacity group ${
                isScrolled ? "py-1.5 opacity-90" : "py-2"
              } ${i > 0 ? "border-t border-white/10" : ""}`}
            >
              {isRecent && (
                <span className={`text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider shrink-0 ${
                  isScrolled ? "bg-red-500/70" : "bg-red-500 animate-pulse"
                }`}>
                  NEW
                </span>
              )}
              <Icon name="article" size={15} className="shrink-0 opacity-70" />
              <span className={`truncate ${isScrolled ? "text-xs" : "text-sm font-medium"}`}>
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
