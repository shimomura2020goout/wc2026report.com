import { NextResponse } from "next/server";
import { getPublishedPosts } from "@/lib/notion";
import { LOCALES } from "@/i18n/constants";
import { SITE_BASE_URL } from "@/lib/i18nLinks";

const CRON_SECRET = process.env.CRON_SECRET || "";
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow";
const HOST = SITE_BASE_URL.replace(/^https?:\/\//, "");
const KEY_LOCATION = `${SITE_BASE_URL}/${INDEXNOW_KEY}.txt`;

// 直近 N 日以内に公開された記事を「更新あり」とみなす
const RECENT_DAYS = 7;

// 常に通知対象に含めたい主要静的ページ（更新頻度が高いもの）
const STATIC_PATHS = ["/", "/news", "/predictions", "/matches", "/japan-squad"];

function buildRecentArticleUrls(slugs: string[]): string[] {
  const urls: string[] = [];
  for (const slug of slugs) {
    for (const locale of LOCALES) {
      urls.push(`${SITE_BASE_URL}/${locale}/news/${slug}`);
    }
  }
  return urls;
}

function buildStaticUrls(): string[] {
  const urls: string[] = [];
  for (const path of STATIC_PATHS) {
    for (const locale of LOCALES) {
      const cleanPath = path === "/" ? "" : path;
      urls.push(`${SITE_BASE_URL}/${locale}${cleanPath}`);
    }
  }
  return urls;
}

async function submitToIndexNow(urls: string[]): Promise<{ status: number; body: string }> {
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls,
    }),
  });
  const body = await res.text();
  return { status: res.status, body };
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!INDEXNOW_KEY) {
    return NextResponse.json({ error: "INDEXNOW_KEY not configured" }, { status: 500 });
  }

  try {
    const posts = await getPublishedPosts("ja");
    const cutoff = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;
    const recentSlugs = posts
      .filter((p) => {
        if (!p.publishedAt) return false;
        const t = new Date(p.publishedAt).getTime();
        return Number.isFinite(t) && t >= cutoff;
      })
      .map((p) => p.slug)
      .filter(Boolean);

    const articleUrls = buildRecentArticleUrls(recentSlugs);
    const staticUrls = buildStaticUrls();
    const urls = Array.from(new Set([...staticUrls, ...articleUrls]));

    if (urls.length === 0) {
      return NextResponse.json({ ok: true, submitted: 0, message: "No URLs to submit" });
    }

    const result = await submitToIndexNow(urls);
    const ok = result.status >= 200 && result.status < 300;

    return NextResponse.json({
      ok,
      submitted: urls.length,
      recentArticles: recentSlugs.length,
      indexNowStatus: result.status,
      indexNowBody: result.body.slice(0, 500),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
