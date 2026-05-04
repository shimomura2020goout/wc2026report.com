import type { MetadataRoute } from "next";
import { allTeams } from "@/data/teams";
import { allWorldCupMatches } from "@/data/matches";
import { LOCALES, DEFAULT_LOCALE } from "@/i18n/index";
import { SITE_BASE_URL } from "@/lib/i18nLinks";

// 3言語対応の sitemap
// 各 URL に対して ja/en/ko の alternates.languages（hreflang）を出力する。
// /mypage, /rankings は noindex のため含めない。
// /toto, /calendar はナビ統合済みだが既存被リンク維持のため残す（priority低）。

interface PathDef {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}

function buildLanguagesMap(path: string): Record<string, string> {
  const cleanPath = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    languages[l] = `${SITE_BASE_URL}/${l}${cleanPath}`;
  }
  // x-default は英語版（英語SEOを優先）
  languages["x-default"] = `${SITE_BASE_URL}/en${cleanPath}`;
  return languages;
}

function expandLocales(defs: PathDef[]): MetadataRoute.Sitemap {
  const now = new Date();
  const out: MetadataRoute.Sitemap = [];
  for (const def of defs) {
    const languages = buildLanguagesMap(def.path);
    for (const locale of LOCALES) {
      out.push({
        url: languages[locale],
        lastModified: now,
        changeFrequency: def.changeFrequency,
        priority:
          locale === DEFAULT_LOCALE
            ? def.priority
            : Math.max(0.1, def.priority - 0.1),
        alternates: { languages },
      });
    }
  }
  return out;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths: PathDef[] = [
    { path: "/", priority: 1.0, changeFrequency: "daily" },
    { path: "/predictions", priority: 0.95, changeFrequency: "daily" },
    { path: "/matches", priority: 0.9, changeFrequency: "weekly" },
    { path: "/kickoff", priority: 0.85, changeFrequency: "weekly" },
    { path: "/japan-squad", priority: 0.95, changeFrequency: "daily" },
    { path: "/watch", priority: 0.9, changeFrequency: "weekly" },
    { path: "/news", priority: 0.85, changeFrequency: "daily" },
    { path: "/groups", priority: 0.8, changeFrequency: "weekly" },
    { path: "/teams", priority: 0.8, changeFrequency: "weekly" },
    { path: "/results", priority: 0.8, changeFrequency: "weekly" },
    { path: "/toto", priority: 0.7, changeFrequency: "weekly" },
    { path: "/calendar", priority: 0.7, changeFrequency: "weekly" },
    { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  ];

  // チーム詳細ページ
  const teamPaths: PathDef[] = allTeams
    .filter((t) => !t.isPlaceholder)
    .map((t) => ({
      path: `/teams/${t.code.toLowerCase()}`,
      priority: 0.7,
      changeFrequency: "weekly" as const,
    }));

  // 国別の試合日程ページ（SEO サテライト）
  const teamMatchesPaths: PathDef[] = allTeams
    .filter((t) => !t.isPlaceholder)
    .map((t) => ({
      path: `/matches/team/${t.code.toLowerCase()}`,
      priority: 0.75,
      changeFrequency: "weekly" as const,
    }));

  // 日別の試合一覧ページ（SEO サテライト）
  const uniqueMatchDates = Array.from(new Set(allWorldCupMatches.map((m) => m.date)));
  const dateMatchesPaths: PathDef[] = uniqueMatchDates.map((d) => ({
    path: `/matches/date/${d.replace(/-/g, "")}`,
    priority: 0.7,
    changeFrequency: "weekly" as const,
  }));

  // Notion から公開記事のスラッグ
  let articlePaths: PathDef[] = [];
  try {
    const { getAllSlugs } = await import("@/lib/notion");
    const slugs = await getAllSlugs();
    articlePaths = slugs.map((slug) => ({
      path: `/news/${slug}`,
      priority: 0.7,
      changeFrequency: "weekly" as const,
    }));
  } catch {
    // Notion API未設定時はスキップ
  }

  return [
    ...expandLocales(staticPaths),
    ...expandLocales(teamPaths),
    ...expandLocales(teamMatchesPaths),
    ...expandLocales(dateMatchesPaths),
    ...expandLocales(articlePaths),
  ];
}
