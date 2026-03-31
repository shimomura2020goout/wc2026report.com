import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Vercel Cron の不正呼び出し防止
const CRON_SECRET = process.env.CRON_SECRET || "";

// Notion API
const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

// Claude API
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

// RSS フィードURL
const RSS_FEEDS = [
  {
    url: "https://news.google.com/rss/search?q=W杯2026+日本代表&hl=ja&gl=JP&ceid=JP:ja",
    source: "Google News",
  },
  {
    url: "https://news.google.com/rss/search?q=サッカー+ワールドカップ+2026&hl=ja&gl=JP&ceid=JP:ja",
    source: "Google News",
  },
];

// 対象キーワード（いずれかを含む記事のみ対象）
const KEYWORDS = [
  "W杯", "ワールドカップ", "日本代表", "サムライブルー", "森保",
  "DAZN", "FIFA", "グループH", "グループリーグ",
  "親善試合", "キリンチャレンジ", "キリンカップ",
];

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

// ─── RSS解析 ───
function parseRSSItems(xml: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1") || "";
    const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || "";
    const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "";
    const source = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1") || "";

    if (title && link) {
      items.push({ title, link, pubDate, source });
    }
  }

  return items;
}

// ─── キーワードフィルタ ───
function isRelevant(title: string): boolean {
  return KEYWORDS.some((kw) => title.includes(kw));
}

// ─── 24時間以内の記事かチェック ───
function isRecent(pubDate: string): boolean {
  if (!pubDate) return false;
  const pub = new Date(pubDate).getTime();
  const now = Date.now();
  const hours24 = 24 * 60 * 60 * 1000;
  return now - pub < hours24;
}

// ─── Notionに既存のスラッグを取得（重複防止） ───
async function getExistingSlugs(): Promise<Set<string>> {
  if (!NOTION_API_KEY || !DATABASE_ID) return new Set();

  const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filter: {
        timestamp: "created_time",
        created_time: {
          on_or_after: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      },
    }),
  });

  if (!res.ok) return new Set();

  const data = await res.json();
  const slugs = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const page of data.results) {
    const slug = page.properties?.["スラッグ"]?.rich_text?.[0]?.plain_text;
    if (slug) slugs.add(slug);
  }
  return slugs;
}

// ─── Claude APIで記事を要約・構造化 ───
async function summarizeWithClaude(
  articles: RSSItem[]
): Promise<
  {
    title: string;
    slug: string;
    summary: string;
    content: string;
    category: string;
    tags: string[];
    sourceUrl: string;
    sourceName: string;
  }[]
> {
  if (!ANTHROPIC_API_KEY) return [];

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const articlesText = articles
    .map(
      (a, i) =>
        `[記事${i + 1}]\nタイトル: ${a.title}\nURL: ${a.link}\n出典: ${a.source}\n公開日: ${a.pubDate}`
    )
    .join("\n\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `あなたはサッカーW杯2026の情報サイト「W杯2026」のライターです。
以下のニュース記事リストから、W杯2026や日本代表に関連性の高い記事を選び（最大3件）、
それぞれについてブログ記事の下書きを作成してください。

関連性が低い記事（他競技のW杯、女子サッカー等）は除外してください。
該当記事がなければ空配列を返してください。

以下のJSON配列形式で返してください（JSONのみ、他のテキストは不要）:
[
  {
    "title": "記事タイトル（30文字以内、魅力的に）",
    "slug": "url-safe-slug-in-english",
    "summary": "SEO用の記事概要（100-120文字）",
    "content": "記事本文（Markdown形式、200-400文字程度。見出し・箇条書きを活用。情報源に基づき事実のみ記載。推測や独自見解は含めない）",
    "category": "ニュース",
    "tags": ["日本代表", "W杯"]のように適切なタグを選択。選択肢: 日本代表, W杯, DAZN, グループH, オランダ, チュニジア, 注目選手, 戦術分析",
    "sourceUrl": "元記事のURL",
    "sourceName": "元記事の出典名"
  }
]

記事リスト:
${articlesText}`,
      },
    ],
  });

  try {
    const text = response.content[0].type === "text" ? response.content[0].text : "";
    // JSONブロックを抽出
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]);
  } catch {
    console.error("Claude response parse error");
    return [];
  }
}

// ─── Notionに下書き投稿 ───
async function createNotionDraft(article: {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  sourceUrl: string;
  sourceName: string;
}): Promise<string | null> {
  if (!NOTION_API_KEY || !DATABASE_ID) return null;

  const today = new Date().toISOString().split("T")[0];

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: DATABASE_ID },
      properties: {
        "タイトル": {
          title: [{ text: { content: article.title } }],
        },
        "スラッグ": {
          rich_text: [{ text: { content: article.slug } }],
        },
        "ステータス": {
          select: { name: "下書き" },
        },
        "カテゴリ": {
          select: { name: article.category },
        },
        "タグ": {
          multi_select: article.tags.map((t) => ({ name: t })),
        },
        "公開日": {
          date: { start: today },
        },
        "概要": {
          rich_text: [{ text: { content: article.summary } }],
        },
        "出典名": {
          rich_text: [{ text: { content: article.sourceName } }],
        },
        "出典URL": {
          url: article.sourceUrl,
        },
      },
    }),
  });

  if (!res.ok) {
    console.error("Notion create error:", await res.text());
    return null;
  }

  const page = await res.json();

  // ページ本文（content blocks）を追加
  if (article.content) {
    await addContentToPage(page.id, article.content);
  }

  return page.id;
}

// ─── Notionページに本文ブロックを追加 ───
async function addContentToPage(pageId: string, markdown: string): Promise<void> {
  // Markdownをシンプルなパラグラフブロックに変換
  const lines = markdown.split("\n").filter((l) => l.trim());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocks: any[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      blocks.push({
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [{ type: "text", text: { content: line.replace("## ", "") } }],
        },
      });
    } else if (line.startsWith("### ")) {
      blocks.push({
        object: "block",
        type: "heading_3",
        heading_3: {
          rich_text: [{ type: "text", text: { content: line.replace("### ", "") } }],
        },
      });
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{ type: "text", text: { content: line.replace(/^[-*] /, "") } }],
        },
      });
    } else if (line.startsWith("---")) {
      blocks.push({
        object: "block",
        type: "divider",
        divider: {},
      });
    } else {
      blocks.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: line } }],
        },
      });
    }
  }

  if (blocks.length === 0) return;

  // Notion APIは1回のリクエストで最大100ブロック
  const chunkSize = 100;
  for (let i = 0; i < blocks.length; i += chunkSize) {
    await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ children: blocks.slice(i, i + chunkSize) }),
    });
  }
}

// ─── メインハンドラ ───
export async function GET(request: Request) {
  // Cron認証チェック
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. RSS取得
    const allItems: RSSItem[] = [];
    for (const feed of RSS_FEEDS) {
      try {
        const res = await fetch(feed.url);
        if (res.ok) {
          const xml = await res.text();
          const items = parseRSSItems(xml);
          allItems.push(...items);
        }
      } catch (e) {
        console.error(`RSS fetch error (${feed.source}):`, e);
      }
    }

    // 2. フィルタ: キーワードマッチ + 24時間以内
    const relevant = allItems
      .filter((item) => isRelevant(item.title) && isRecent(item.pubDate));

    // 重複除去（タイトルベース）
    const seen = new Set<string>();
    const unique = relevant.filter((item) => {
      if (seen.has(item.title)) return false;
      seen.add(item.title);
      return true;
    });

    if (unique.length === 0) {
      return NextResponse.json({
        message: "No relevant articles found",
        totalFetched: allItems.length,
        filtered: 0,
      });
    }

    // 3. 既存スラッグ取得（重複投稿防止）
    const existingSlugs = await getExistingSlugs();

    // 4. Claude APIで要約・構造化（上位10件まで送信）
    const topArticles = unique.slice(0, 10);
    const drafts = await summarizeWithClaude(topArticles);

    // 5. 重複チェックしてNotionに下書き投稿
    const created: string[] = [];
    for (const draft of drafts) {
      if (existingSlugs.has(draft.slug)) {
        continue;
      }
      const pageId = await createNotionDraft(draft);
      if (pageId) {
        created.push(draft.title);
      }
    }

    return NextResponse.json({
      message: `Created ${created.length} draft(s)`,
      totalFetched: allItems.length,
      relevant: unique.length,
      created,
    });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
