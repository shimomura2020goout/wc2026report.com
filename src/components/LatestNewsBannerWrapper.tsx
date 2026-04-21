"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";

// 動的にサーバーコンポーネントをインポートすることはできないため、
// バナーの表示/非表示のみをクライアントで制御するラッパー
export default function LatestNewsBannerWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ニュースページ（/news, /news/xxx）では表示しない
  if (pathname.startsWith("/news")) return null;

  return (
    <Suspense
      fallback={
        <div
          aria-hidden
          className="h-10 bg-gradient-to-r from-blue-600 to-indigo-700"
        />
      }
    >
      {children}
    </Suspense>
  );
}
