import { NotionToMarkdown } from "notion-to-md";
import { Client } from "@notionhq/client";
import { unstable_cache } from "next/cache";

const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

// notion-to-md 用のクライアント（ページ本文取得）
const notionClient = new Client({ auth: NOTION_API_KEY });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const n2m = new NotionToMarkdown({ notionClient: notionClient as any });

// テーブルブロックのカスタムトランスフォーマー
// notion-to-md はテーブルを正しく変換しないことがあるため、手動で処理
n2m.setCustomTransformer("table", async (block) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableBlock = block as any;
  const hasColumnHeader = tableBlock?.table?.has_column_header ?? false;

  try {
    // テーブルの子ブロック（行）を取得
    const res = await notionClient.blocks.children.list({ block_id: block.id });
    const rows = res.results;

    if (rows.length === 0) return "";

    const mdRows: string[] = [];

    for (let ri = 0; ri < rows.length; ri++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row = rows[ri] as any;
      const cells = row?.table_row?.cells ?? [];
      const cellTexts = cells.map((cell: { plain_text: string }[]) =>
        cell.map((t) => t.plain_text).join("")
      );
      mdRows.push(`| ${cellTexts.join(" | ")} |`);

      // ヘッダー行の後にセパレーターを追加
      if (ri === 0 && hasColumnHeader) {
        mdRows.push(`| ${cellTexts.map(() => "---").join(" | ")} |`);
      }
    }

    // ヘッダーなしテーブルの場合も最初の行をヘッダーとして扱う
    if (!hasColumnHeader && rows.length > 1) {
      // セパレーターを1行目の後に挿入
      const firstRowCells = mdRows[0].split("|").filter(Boolean);
      mdRows.splice(1, 0, `| ${firstRowCells.map(() => "---").join(" | ")} |`);
    }

    return mdRows.join("\n");
  } catch {
    return "";
  }
});

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string;
  tags: string[];
  relatedTeams: string[];
  publishedAt: string | null;
  eyecatchUrl: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  summary: string | null;
}

export interface BlogPostWithContent extends BlogPost {
  content: string;
}

// Notion API を直接 fetch で呼ぶ（v5 SDK の型問題を回避）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function queryDatabase(body: Record<string, unknown>): Promise<any> {
  if (!NOTION_API_KEY || !DATABASE_ID) {
    return { results: [] };
  }

  const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    next: { revalidate: 300 }, // ISR: 5分キャッシュ
  });

  if (!res.ok) {
    throw new Error(`Notion API error: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractProperty(page: any, name: string, type: string): unknown {
  const prop = page.properties?.[name];
  if (!prop) return null;

  switch (type) {
    case "title": {
      return prop.title?.map((t: { plain_text: string }) => t.plain_text).join("") || "";
    }
    case "rich_text": {
      return prop.rich_text?.map((t: { plain_text: string }) => t.plain_text).join("") || "";
    }
    case "select": {
      return prop.select?.name || "";
    }
    case "multi_select": {
      return prop.multi_select?.map((s: { name: string }) => s.name) || [];
    }
    case "date": {
      return prop.date?.start || null;
    }
    case "url": {
      return prop.url || null;
    }
    default:
      return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pageToPost(page: any): BlogPost {
  return {
    id: page.id,
    title: extractProperty(page, "タイトル", "title") as string,
    slug: extractProperty(page, "スラッグ", "rich_text") as string,
    status: extractProperty(page, "ステータス", "select") as string,
    category: extractProperty(page, "カテゴリ", "select") as string,
    tags: extractProperty(page, "タグ", "multi_select") as string[],
    relatedTeams: (extractProperty(page, "関連チーム", "multi_select") as string[]) || [],
    publishedAt: extractProperty(page, "公開日", "date") as string | null,
    eyecatchUrl: extractProperty(page, "アイキャッチURL", "url") as string | null,
    sourceName: extractProperty(page, "出典名", "rich_text") as string | null,
    sourceUrl: extractProperty(page, "出典URL", "url") as string | null,
    summary: extractProperty(page, "概要", "rich_text") as string | null,
  };
}

// 公開記事一覧を取得（未キャッシュ）
async function _getPublishedPosts(): Promise<BlogPost[]> {
  const data = await queryDatabase({
    filter: {
      property: "ステータス",
      select: {
        equals: "公開",
      },
    },
    sorts: [
      {
        property: "公開日",
        direction: "descending",
      },
    ],
  });

  return data.results.map(pageToPost);
}

// 記事詳細（本文含む）を取得（未キャッシュ）
async function _getPostBySlug(slug: string): Promise<BlogPostWithContent | null> {
  const data = await queryDatabase({
    filter: {
      and: [
        {
          property: "スラッグ",
          rich_text: {
            equals: slug,
          },
        },
        {
          property: "ステータス",
          select: {
            equals: "公開",
          },
        },
      ],
    },
  });

  if (data.results.length === 0) return null;

  const page = data.results[0];
  const post = pageToPost(page);

  // ページの本文をMarkdownに変換
  const mdBlocks = await n2m.pageToMarkdown(page.id);
  const mdString = n2m.toMarkdownString(mdBlocks);

  return {
    ...post,
    content: mdString.parent,
  };
}

// ---------- キャッシュ層 ----------
// cookies() によりページが動的レンダリングになっても、データ層をここでキャッシュすることで
// Notion API への問い合わせは 5 分に 1 回に抑え、クリックから描画までの時間を大幅に短縮する。

const CACHE_TTL_SECONDS = 300;

export const getPublishedPosts = unstable_cache(
  _getPublishedPosts,
  ["notion:getPublishedPosts"],
  { revalidate: CACHE_TTL_SECONDS, tags: ["notion", "notion:list"] }
);

export async function getPostBySlug(slug: string): Promise<BlogPostWithContent | null> {
  const cached = unstable_cache(
    () => _getPostBySlug(slug),
    ["notion:getPostBySlug", slug],
    { revalidate: CACHE_TTL_SECONDS, tags: ["notion", `notion:post:${slug}`] }
  );
  return cached();
}

export const getAllSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const posts = await _getPublishedPosts();
    return posts.map((post) => post.slug).filter(Boolean);
  },
  ["notion:getAllSlugs"],
  { revalidate: CACHE_TTL_SECONDS, tags: ["notion", "notion:list"] }
);
