import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import SourceAttribution from "@/components/SourceAttribution";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { getPostBySlug, getAllSlugs } from "@/lib/notion";

// ISR: 5分ごとに再生成
export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "記事が見つかりません" };

  return {
    title: post.title,
    description: post.summary || `${post.title} - W杯2026×toto`,
  };
}

const categoryColors: Record<string, string> = {
  "試合プレビュー": "bg-blue-100 text-blue-700",
  "チーム分析": "bg-purple-100 text-purple-700",
  "toto攻略": "bg-pink-100 text-pink-700",
  "視聴ガイド": "bg-orange-100 text-orange-700",
  "ニュース": "bg-green-100 text-green-700",
  "コラム": "bg-yellow-100 text-yellow-700",
};

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const articleUrl = `https://www.wc2026report.com/news/${post.slug}`;

  return (
    <>
    <ArticleJsonLd
      title={post.title}
      description={post.summary || post.title}
      publishedAt={post.publishedAt || ""}
      url={articleUrl}
      category={post.category}
    />
    <BreadcrumbJsonLd items={[
      { name: "トップ", url: "https://www.wc2026report.com" },
      { name: "ニュース", url: "https://www.wc2026report.com/news" },
      { name: post.title, url: articleUrl },
    ]} />
    <article className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-gray-600">トップ</Link>
        <Icon name="chevron_right" size={16} />
        <Link href="/news" className="hover:text-gray-600">ニュース</Link>
        <Icon name="chevron_right" size={16} />
        <span className="text-gray-600 truncate">{post.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {post.category && (
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${categoryColors[post.category] || "bg-gray-100 text-gray-600"}`}>
              {post.category}
            </span>
          )}
          {post.publishedAt && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Icon name="schedule" size={14} />
              {post.publishedAt}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug mb-4">
          {post.title}
        </h1>

        {post.summary && (
          <p className="text-gray-500 leading-relaxed">
            {post.summary}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap mt-4">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      </header>

      {/* Content */}
      <div
        className="prose prose-gray max-w-none
          prose-headings:text-gray-900 prose-headings:font-bold
          prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2
          prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
          prose-p:text-gray-700 prose-p:leading-relaxed
          prose-li:text-gray-700
          prose-strong:text-gray-900
          prose-blockquote:border-l-4 prose-blockquote:border-purple-300 prose-blockquote:bg-purple-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
          prose-table:text-sm
          prose-th:bg-gray-50 prose-th:px-4 prose-th:py-2
          prose-td:px-4 prose-td:py-2
          prose-a:text-blue-600 prose-a:underline
          prose-hr:my-8
        "
        dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
      />

      {/* Source */}
      {post.sourceName && post.sourceUrl && (
        <SourceAttribution
          sources={[{ label: post.sourceName, url: post.sourceUrl }]}
          updatedAt={post.publishedAt || undefined}
        />
      )}

      {/* Back link */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <Link
          href="/news"
          className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800"
        >
          <Icon name="arrow_back" size={16} />
          ニュース一覧に戻る
        </Link>
      </div>
    </article>
    </>
  );
}

// シンプルなMarkdown→HTML変換
function markdownToHtml(markdown: string): string {
  let html = markdown;

  // 表のパース
  html = html.replace(/^\|(.+)\|$/gm, (match) => {
    const cells = match.split("|").filter(Boolean).map((c) => c.trim());
    return `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
  });
  html = html.replace(/(<tr>.*<\/tr>\n?)+/g, (match) => {
    const rows = match.trim().split("\n");
    if (rows.length >= 2) {
      // 2行目がセパレータ(---)かチェック
      const secondRow = rows[1];
      if (secondRow && /^<tr>(<td>-+<\/td>)+<\/tr>$/.test(secondRow)) {
        const header = rows[0].replace(/<td>/g, "<th>").replace(/<\/td>/g, "</th>");
        const body = rows.slice(2).join("\n");
        return `<table><thead>${header}</thead><tbody>${body}</tbody></table>`;
      }
    }
    return `<table><tbody>${match}</tbody></table>`;
  });

  // 見出し
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // 太字・イタリック
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // リスト
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  // 引用
  html = html.replace(/^> (.+)$/gm, "<blockquote><p>$1</p></blockquote>");

  // 水平線
  html = html.replace(/^---$/gm, "<hr />");

  // リンク
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // 段落
  html = html.replace(/^(?!<[a-z])((?!^\s*$).+)$/gm, "<p>$1</p>");

  // 空行の除去
  html = html.replace(/<p><\/p>/g, "");

  return html;
}
