import { getPublishedPosts } from "@/lib/notion";
import { getLocale } from "@/i18n/index";
import LatestNewsBannerClient from "./LatestNewsBannerClient";

export interface NewsBannerItem {
  title: string;
  slug: string;
  publishedAt: string | null;
}

/**
 * ヘッダー上段ニュースバナーで「期限まで先頭固定する」記事の一覧。
 *
 * - 各エントリは指定の `pinUntil` (JST想定の ISO8601) を過ぎるまで、上段2件のうち先頭
 *   位置に**必ず**表示される。期限を過ぎたら自動的に通常の「直近5日以内2件」ロジックに戻る。
 * - 別セッションで記事更新を行う場合でも、この PINNED_NEWS_ITEMS の編集（または期限経過）
 *   までは表示順が変わらない設計。
 * - 仕様の詳細・運用フローは memory `feedback_pinned_header_news.md` を参照。
 */
const PINNED_NEWS_ITEMS: Array<{ slug: string; pinUntil: string }> = [
  // 2026-05-17 追加: toto発売開始の公式発表予測記事。
  // 本サイトの最有力日6/1(月) の翌日0時 JST までヘッダー最上段に固定し、
  // 「toto発売開始まで」のユーザー注意を集中させる目的。
  { slug: "wcup-toto-launch-prediction-may-june-2026", pinUntil: "2026-06-02T00:00:00+09:00" },
];

export default async function LatestNewsBanner() {
  let posts: NewsBannerItem[] = [];

  try {
    const locale = await getLocale();
    const allPosts = await getPublishedPosts(locale);
    const now = Date.now();
    const FIVE_DAYS = 5 * 24 * 60 * 60 * 1000;

    // 1) 直近5日以内の記事（通常表示候補）
    const recentPosts = allPosts.filter((p) => {
      if (!p.slug || !p.publishedAt) return false;
      return now - new Date(p.publishedAt).getTime() < FIVE_DAYS;
    });

    // 2) ピン留めスロット: 期限内のものだけ pinUntil 昇順（早い終了が先）で先頭に並べる
    const activePins = PINNED_NEWS_ITEMS.filter(
      (pin) => now < new Date(pin.pinUntil).getTime()
    );
    const pinSlots: NewsBannerItem[] = [];
    for (const pin of activePins) {
      const match = allPosts.find((p) => p.slug === pin.slug);
      if (match && match.slug && match.publishedAt) {
        pinSlots.push({ title: match.title, slug: match.slug, publishedAt: match.publishedAt });
      }
    }

    // 3) 重複排除（ピン記事は recentPosts 側から除外）し、上限2件
    const pinSlugs = new Set(pinSlots.map((p) => p.slug));
    const recentNonPinned = recentPosts
      .filter((p) => !pinSlugs.has(p.slug as string))
      .map((p) => ({
        title: p.title,
        slug: p.slug as string,
        publishedAt: p.publishedAt,
      }));

    posts = [...pinSlots, ...recentNonPinned].slice(0, 2);
  } catch {
    return null;
  }

  if (posts.length === 0) return null;

  return <LatestNewsBannerClient posts={posts} />;
}
