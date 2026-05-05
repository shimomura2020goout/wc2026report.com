import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ビルド時の静的ページ生成ワーカー数を抑制（Notion API レート制限対策）
  // デフォルト 3 だと 500+ ページ並列生成で Notion 429 を頻発する
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  // 各ページの prerender タイムアウトを延長
  // Notion 429 リトライバックオフ累積（最大10回, 60s上限）でも完走できる余裕を持たせる
  staticPageGenerationTimeout: 600,
};

export default nextConfig;
