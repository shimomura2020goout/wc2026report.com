import type { MetadataRoute } from "next";
import { allTeams } from "@/data/teams";
import { allWorldCupMatches } from "@/data/matches";

const BASE_URL = "https://www.wc2026report.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静的ページ
  // 注: /mypage と /rankings は noindex なので sitemap に含めない
  //     /toto と /calendar はナビ統合で /predictions /TOP に集約したが
  //     既存URL・被リンクは維持するため sitemap には残し、優先度を下げる
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/predictions`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/matches`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/kickoff`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/japan-squad`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/watch`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/groups`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/teams`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/results`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/toto`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/calendar`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Notion から公開記事のスラッグを取得
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const { getAllSlugs } = await import("@/lib/notion");
    const slugs = await getAllSlugs();
    articlePages = slugs.map((slug) => ({
      url: `${BASE_URL}/news/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Notion API未設定時はスキップ
  }

  // チーム詳細ページ
  const teamPages: MetadataRoute.Sitemap = allTeams
    .filter((t) => !t.isPlaceholder)
    .map((t) => ({
      url: `${BASE_URL}/teams/${t.code.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  // 国別の試合日程ページ（SEOサテライト）
  const teamMatchesPages: MetadataRoute.Sitemap = allTeams
    .filter((t) => !t.isPlaceholder)
    .map((t) => ({
      url: `${BASE_URL}/matches/team/${t.code.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));

  // 日別の試合一覧ページ（SEOサテライト）
  const uniqueMatchDates = Array.from(new Set(allWorldCupMatches.map((m) => m.date)));
  const dateMatchesPages: MetadataRoute.Sitemap = uniqueMatchDates.map((d) => ({
    url: `${BASE_URL}/matches/date/${d.replace(/-/g, "")}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...teamPages,
    ...teamMatchesPages,
    ...dateMatchesPages,
    ...articlePages,
  ];
}
