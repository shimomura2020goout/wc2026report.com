import type { Metadata } from "next";
import Icon from "@/components/Icon";
import { getPublishedPosts } from "@/lib/notion";
import MyPageClient from "./MyPageClient";
import { getLocale, getDictionary, createTranslator } from "@/i18n/index";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);
  return {
    title: t("mypage.metaTitle"),
    description: t("mypage.metaDescription"),
    robots: { index: false, follow: true },
  };
}

export const revalidate = 300;

export default async function MyPage() {
  const locale = await getLocale();
  const posts = await getPublishedPosts(locale);
  const listPosts = posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    relatedTeams: p.relatedTeams,
    publishedAt: p.publishedAt,
    summary: p.summary,
  }));

  const todayISO = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Icon name="account_circle" size={32} className="text-gray-700" />
        マイページ
      </h1>
      <p className="text-gray-500 mb-6 text-sm">
        応援国の試合・ニュース・予想履歴をまとめて表示します。
      </p>

      <MyPageClient posts={listPosts} todayISO={todayISO} />
    </div>
  );
}
