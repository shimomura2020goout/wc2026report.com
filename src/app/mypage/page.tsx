import type { Metadata } from "next";
import Icon from "@/components/Icon";
import { getPublishedPosts } from "@/lib/notion";
import MyPageClient from "./MyPageClient";

export const metadata: Metadata = {
  title: "マイページ",
  description: "応援する国の試合・ニュース・予想履歴をまとめて表示するマイページ",
  robots: { index: false, follow: true },
};

export const revalidate = 300;

export default async function MyPage() {
  const posts = await getPublishedPosts();
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
