import type { Metadata } from "next";
import Icon from "@/components/Icon";
import NewsFilteredList from "@/components/NewsFilteredList";
import { getPublishedPosts } from "@/lib/notion";
import { getLocaleFromCookies, getDictionary, createTranslator } from "@/i18n/index";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);
  return {
    title: t("news.metaTitle"),
    description: t("news.metaDescription"),
  };
}

// ISR: 5分ごとに再生成
export const revalidate = 300;

const categoryColors: Record<string, string> = {
  "試合プレビュー": "bg-blue-100 text-blue-700",
  "チーム分析": "bg-purple-100 text-purple-700",
  "視聴ガイド": "bg-orange-100 text-orange-700",
  "ニュース": "bg-green-100 text-green-700",
  "コラム": "bg-yellow-100 text-yellow-700",
};

export default async function NewsPage() {
  const locale = await getLocaleFromCookies();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);

  const posts = await getPublishedPosts();
  const listPosts = posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    tags: p.tags,
    relatedTeams: p.relatedTeams,
    publishedAt: p.publishedAt,
    summary: p.summary,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Icon name="article" size={32} className="text-gray-700" />
        {t("news.pageTitle")}
      </h1>
      <p className="text-gray-500 mb-6">
        {t("news.pageDescription")}
      </p>

      <NewsFilteredList
        posts={listPosts}
        categoryColors={categoryColors}
        labels={{
          all: t("news.filterAll") || "すべて",
          readArticle: t("news.readArticle"),
          noArticles: t("news.noArticles"),
        }}
      />
    </div>
  );
}
