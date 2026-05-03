import { getPublishedPosts } from "@/lib/notion";
import { getLocale } from "@/i18n/index";
import LatestNewsBannerClient from "./LatestNewsBannerClient";

export interface NewsBannerItem {
  title: string;
  slug: string;
  publishedAt: string | null;
}

export default async function LatestNewsBanner() {
  let posts: NewsBannerItem[] = [];

  try {
    const locale = await getLocale();
    const allPosts = await getPublishedPosts(locale);
    const now = Date.now();
    const FIVE_DAYS = 5 * 24 * 60 * 60 * 1000;

    // 直近5日以内の記事を最大2件
    posts = allPosts
      .filter((p) => {
        if (!p.slug || !p.publishedAt) return false;
        return now - new Date(p.publishedAt).getTime() < FIVE_DAYS;
      })
      .slice(0, 2)
      .map((p) => ({
        title: p.title,
        slug: p.slug,
        publishedAt: p.publishedAt,
      }));
  } catch {
    return null;
  }

  if (posts.length === 0) return null;

  return <LatestNewsBannerClient posts={posts} />;
}
