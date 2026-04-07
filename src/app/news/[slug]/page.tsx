import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import SourceAttribution from "@/components/SourceAttribution";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { getPostBySlug, getAllSlugs } from "@/lib/notion";
import { getLocaleFromCookies, getDictionary, createTranslator } from "@/i18n/index";

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
  const locale = await getLocaleFromCookies();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);

  const post = await getPostBySlug(slug);
  if (!post) return { title: t("news.notFound") };

  return {
    title: post.title,
    description: post.summary || `${post.title} - W杯2026`,
  };
}

const categoryColors: Record<string, string> = {
  "試合プレビュー": "bg-blue-100 text-blue-700",
  "チーム分析": "bg-purple-100 text-purple-700",
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
  const locale = await getLocaleFromCookies();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);

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
      { name: t("news.breadcrumbTop"), url: "https://www.wc2026report.com" },
      { name: t("news.breadcrumbNews"), url: "https://www.wc2026report.com/news" },
      { name: post.title, url: articleUrl },
    ]} />
    <article className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6 flex-nowrap overflow-hidden">
        <Link href="/" className="hover:text-gray-600 shrink-0 whitespace-nowrap">{t("news.breadcrumbTop")}</Link>
        <Icon name="chevron_right" size={14} className="shrink-0" />
        <Link href="/news" className="hover:text-gray-600 shrink-0 whitespace-nowrap">{t("news.breadcrumbNews")}</Link>
        <Icon name="chevron_right" size={14} className="shrink-0" />
        <span className="text-gray-600 truncate min-w-0">{post.title}</span>
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
          {t("news.backToNews")}
        </Link>
      </div>
    </article>
    </>
  );
}

// インラインMarkdown（太字・リンク・画像等）を変換
function inlineMarkdown(text: string): string {
  let s = text;
  // 画像（リンクより先に処理）
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
    '<figure class="my-4"><img src="$2" alt="$1" class="w-full rounded-lg shadow-md" loading="lazy" /><figcaption class="text-xs text-gray-400 text-center mt-1">$1</figcaption></figure>'
  );
  // リンク（#で始まる同ページ内アンカーは新規タブで開かない）
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) => {
    if (url.startsWith("#")) {
      return `<a href="${url}">${label}</a>`;
    }
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });
  // 太字 → イタリック
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
  return s;
}

// ブロック単位でMarkdown→HTML変換
function markdownToHtml(markdown: string): string {
  const lines = markdown.split("\n");
  const output: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 空行 → スキップ
    if (line.trim() === "") { i++; continue; }

    // 水平線
    if (/^---+$/.test(line.trim())) {
      output.push("<hr />");
      i++; continue;
    }

    // 見出し
    const headingMatch = line.match(/^(#{1,3}) (.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      output.push(`<h${level}>${inlineMarkdown(headingMatch[2])}</h${level}>`);
      i++; continue;
    }

    // テーブル（|で始まる行をまとめて処理）
    if (line.trim().startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      // パース — 先頭・末尾の空セルを除去
      const rows = tableLines.map((tl) => {
        // "|col1|col2|" → ["col1","col2"]
        const raw = tl.replace(/^\|/, "").replace(/\|$/, "");
        return raw.split("|").map((c) => c.trim());
      });
      if (rows.length >= 2) {
        // 2行目がセパレータかチェック（:---:, ---, :--- 等も許可）
        const isSep = rows[1].every((c) => /^:?-+:?$/.test(c));
        if (isSep) {
          const headerHtml = `<tr>${rows[0].map((c) => `<th>${inlineMarkdown(c)}</th>`).join("")}</tr>`;
          const bodyHtml = rows.slice(2).map((r) =>
            `<tr>${r.map((c) => `<td>${inlineMarkdown(c)}</td>`).join("")}</tr>`
          ).join("\n");
          output.push(`<div class="overflow-x-auto -mx-2 px-2 my-4"><table><thead>${headerHtml}</thead><tbody>${bodyHtml}</tbody></table></div>`);
        } else {
          // セパレータなし → 1行目をヘッダーとして扱う
          const headerHtml = `<tr>${rows[0].map((c) => `<th>${inlineMarkdown(c)}</th>`).join("")}</tr>`;
          const bodyHtml = rows.slice(1).map((r) =>
            `<tr>${r.map((c) => `<td>${inlineMarkdown(c)}</td>`).join("")}</tr>`
          ).join("\n");
          output.push(`<div class="overflow-x-auto -mx-2 px-2 my-4"><table><thead>${headerHtml}</thead><tbody>${bodyHtml}</tbody></table></div>`);
        }
      } else if (rows.length === 1) {
        // 1行だけのテーブル
        const bodyHtml = `<tr>${rows[0].map((c) => `<td>${inlineMarkdown(c)}</td>`).join("")}</tr>`;
        output.push(`<div class="overflow-x-auto -mx-2 px-2 my-4"><table><tbody>${bodyHtml}</tbody></table></div>`);
      }
      continue;
    }

    // リスト（-で始まる行をまとめて処理）
    if (line.match(/^- /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^- /)) {
        items.push(lines[i].replace(/^- /, ""));
        i++;
      }
      output.push(`<ul>${items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("\n")}</ul>`);
      continue;
    }

    // 引用（>で始まる行をまとめて処理）
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].replace(/^> /, ""));
        i++;
      }
      output.push(`<blockquote>${quoteLines.map((q) => `<p>${inlineMarkdown(q)}</p>`).join("\n")}</blockquote>`);
      continue;
    }

    // 通常テキスト → 段落
    output.push(`<p>${inlineMarkdown(line)}</p>`);
    i++;
  }

  return output.join("\n");
}
