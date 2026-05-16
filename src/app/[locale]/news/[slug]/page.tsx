import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import SourceAttribution from "@/components/SourceAttribution";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { getPostBySlug, getAllSlugs, getPublishedPosts } from "@/lib/notion";
import { getLocale, getDictionary, createTranslator } from "@/i18n/index";
import { pageAlternates, absoluteLocaleUrl } from "@/lib/i18nLinks";

// ISR: 5分ごとに再生成
export const revalidate = 300;

// 静的生成は ja のみ。en/ko は ISR で初回アクセス時に生成される（翻訳がまだ無ければ
// generateMetadata 側で canonical を /ja に向けて重複インデックスを防ぐ）。
// これにより build 時の Notion API 呼び出し回数を 1/3 に抑える。
export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ locale: "ja", slug }));
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);

  const post = await getPostBySlug(slug, locale);
  if (!post) return { title: t("news.notFound") };

  // 翻訳が無く原文（ja）にフォールバックしている場合は canonical を /ja に向ける
  // → 同一原文が ja/en/ko 3 URL で重複インデックスされるのを防ぐ
  const isOriginalFallback = post.translationSource === "original" && locale !== "ja";
  const canonical = isOriginalFallback
    ? absoluteLocaleUrl("ja", `/news/${slug}`)
    : absoluteLocaleUrl(locale, `/news/${slug}`);

  return {
    title: post.title,
    description: post.summary || `${post.title} - W杯2026`,
    alternates: {
      canonical,
      languages: pageAlternates(locale, `/news/${slug}`).languages,
    },
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
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);

  const post = await getPostBySlug(slug, locale);

  if (!post) {
    notFound();
  }

  const articleUrl = absoluteLocaleUrl(locale, `/news/${post.slug}`);

  // 関連記事（同じチームタグを持つ他記事を最大3件）
  let relatedPosts: Array<{
    id: string;
    title: string;
    slug: string;
    category: string;
    publishedAt: string | null;
  }> = [];
  if (post.relatedTeams && post.relatedTeams.length > 0) {
    const allPosts = await getPublishedPosts(locale);
    relatedPosts = allPosts
      .filter(
        (p) =>
          p.slug !== post.slug &&
          (p.relatedTeams || []).some((c) => post.relatedTeams.includes(c))
      )
      .slice(0, 3)
      .map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        publishedAt: p.publishedAt,
      }));
  }

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
          prose-a:text-blue-600 prose-a:font-medium prose-a:underline prose-a:decoration-blue-300 prose-a:underline-offset-2 hover:prose-a:decoration-blue-600 hover:prose-a:text-blue-800
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

      {/* 関連記事 */}
      {relatedPosts.length > 0 && (
        <div className="mt-10 pt-6 border-t border-gray-200">
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-1.5">
            <Icon name="auto_stories" size={20} className="text-gray-700" />
            関連する記事
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedPosts.map((rp) => (
              <Link
                key={rp.id}
                href={`/news/${rp.slug}`}
                className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {rp.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {rp.category}
                    </span>
                  )}
                  {rp.publishedAt && (
                    <span className="text-xs text-gray-400">{rp.publishedAt}</span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-gray-900 leading-snug">{rp.title}</h3>
              </Link>
            ))}
          </div>
        </div>
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

// 絵文字ショートコード → Material Icons マッピング
const EMOJI_ICON_MAP: Record<string, string> = {
  ":soccer:": "sports_soccer",
  ":arrow_up:": "arrow_upward",
  ":arrow_right:": "arrow_forward",
  ":star:": "star",
  ":info:": "info",
  ":calendar:": "calendar_month",
  ":tv:": "live_tv",
  ":fire:": "local_fire_department",
  ":heart:": "favorite",
  ":menu:": "menu_book",
};

function replaceEmojiShortcodes(text: string): string {
  let s = text;
  for (const [code, icon] of Object.entries(EMOJI_ICON_MAP)) {
    const escaped = code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    s = s.replace(new RegExp(escaped, "g"),
      `<span class="material-symbols-outlined" style="vertical-align:middle;font-size:1.1em;line-height:1;">${icon}</span>`
    );
  }
  return s;
}

// インラインMarkdown（太字・リンク・画像等）を変換
function inlineMarkdown(text: string): string {
  let s = text;
  // 画像（リンクより先に処理）
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
    '<figure class="my-4"><img src="$2" alt="$1" class="w-full rounded-lg shadow-md bg-gray-100" style="aspect-ratio:16/9;object-fit:contain" loading="lazy" decoding="async" /><figcaption class="text-xs text-gray-400 text-center mt-1">$1</figcaption></figure>'
  );
  // リンク（#で始まる同ページ内アンカーは新規タブで開かない）
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, rawUrl) => {
    const processedLabel = replaceEmojiShortcodes(label);
    // Notion が相対パス `/foo` を `https://www.notion.so/foo` に自動変換してしまう問題への対策。
    // notion.so ドメイン直下のパスが 32桁hexのUUID（Notion ページID）でなければ、
    // 本来は自サイト内のパスである可能性が高いので prefix を剥がす。
    const url = rawUrl.replace(
      /^https?:\/\/(?:www\.)?notion\.so\/((?![0-9a-f]{8}-?[0-9a-f]{4}|[0-9a-f]{32})[^#?]+)/i,
      "/$1"
    );
    if (url.startsWith("#")) {
      return `<a href="${url}">${processedLabel}</a>`;
    }
    // 内部リンク（/で始まる）か外部リンクかで分岐
    const isInternal = url.startsWith("/");
    if (isInternal) {
      return `<a href="${url}" class="article-link article-link--internal"><span class="material-symbols-outlined" style="font-size:0.9em;vertical-align:middle;">article</span> ${processedLabel}</a>`;
    }
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="article-link article-link--external">${processedLabel} <span class="material-symbols-outlined" style="font-size:0.9em;vertical-align:middle;">open_in_new</span></a>`;
  });
  // 絵文字ショートコード → Material Icons
  s = replaceEmojiShortcodes(s);
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
      // 全項目が同ページ内アンカーリンクのみ → TOC カードグリッドとして描画
      const anchorOnlyRegex = /^\[([^\]]+)\]\(#([^)]+)\)$/;
      const allAnchors = items.every((item) => anchorOnlyRegex.test(item.trim()));
      if (allAnchors && items.length >= 2) {
        const cards = items.map((item) => {
          const m = item.trim().match(anchorOnlyRegex)!;
          const label = replaceEmojiShortcodes(m[1]);
          const href = `#${m[2]}`;
          return `<a href="${href}" class="not-prose group flex items-center gap-3 bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-400 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all no-underline">
            <span class="text-sm sm:text-base font-bold text-gray-800 group-hover:text-blue-700 flex-1">${label}</span>
            <span class="material-symbols-outlined text-blue-500 group-hover:translate-x-1 transition-transform" style="font-size:20px;">arrow_forward</span>
          </a>`;
        }).join("");
        output.push(`<nav class="not-prose my-6 p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
          <p class="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;">menu_book</span> 目次（タップで詳細へ）
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">${cards}</div>
        </nav>`);
        continue;
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
      // LINE風チャット吹き出し: 引用ブロック内で @[L:話者名] / @[R:話者名] パターンを検出。
      // 1引用ブロックに複数の @[L|R:〜] 行が混在する場合（Notionが連続する > 行を1ブロックにまとめる）、
      // 各 @ マーカーを起点に個別のチャット吹き出しとして描画する。
      const hasChatMarker = quoteLines.some((l) => /^@\[(L|R):/.test(l.trim()));
      if (hasChatMarker) {
        type Chat = { side: "left" | "right"; speaker: string; messages: string[] };
        const chats: Chat[] = [];
        let current: Chat | null = null;
        for (const ql of quoteLines) {
          const m = ql.match(/^@\[(L|R):([^\]]+)\]\s*(.*)$/);
          if (m) {
            if (current) chats.push(current);
            current = {
              side: m[1] === "L" ? "left" : "right",
              speaker: m[2].trim(),
              messages: m[3] ? [m[3]] : [],
            };
          } else if (current) {
            current.messages.push(ql);
          }
        }
        if (current) chats.push(current);

        for (const chat of chats) {
          const isLeft = chat.side === "left";
          const messages = chat.messages
            .filter((m) => m && m.trim() !== "")
            .map((m) => inlineMarkdown(m))
            .join("<br/>");
          const avatarChar = chat.speaker.charAt(0);
          const containerCls = isLeft
            ? "flex gap-2 items-start"
            : "flex gap-2 items-start flex-row-reverse";
          const avatarCls = isLeft
            ? "flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-xs font-bold text-white shadow-sm"
            : "flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-xs font-bold text-white shadow-sm";
          const bubbleCls = isLeft
            ? "bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-800 shadow-sm leading-relaxed"
            : "bg-green-100 border border-green-200 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-gray-800 shadow-sm leading-relaxed";
          const nameCls = isLeft
            ? "text-xs text-gray-500 mb-1 ml-1"
            : "text-xs text-gray-500 mb-1 mr-1 text-right";
          output.push(`<div class="not-prose my-2.5 ${containerCls}">
            <div class="${avatarCls}">${avatarChar}</div>
            <div class="flex-1 max-w-[78%] min-w-0">
              <p class="${nameCls}">${inlineMarkdown(chat.speaker)}</p>
              <div class="${bubbleCls}">${messages}</div>
            </div>
          </div>`);
        }
        continue;
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
