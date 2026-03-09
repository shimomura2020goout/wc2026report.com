import { NotionToMarkdown } from "notion-to-md";
import { Client } from "@notionhq/client";

const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

// notion-to-md 用のクライアント（ページ本文取得）
const notionClient = new Client({ auth: NOTION_API_KEY });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const n2m = new NotionToMarkdown({ notionClient: notionClient as any });

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string;
  tags: string[];
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
    publishedAt: extractProperty(page, "公開日", "date") as string | null,
    eyecatchUrl: extractProperty(page, "アイキャッチURL", "url") as string | null,
    sourceName: extractProperty(page, "出典名", "rich_text") as string | null,
    sourceUrl: extractProperty(page, "出典URL", "url") as string | null,
    summary: extractProperty(page, "概要", "rich_text") as string | null,
  };
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
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

export async function getPostBySlug(slug: string): Promise<BlogPostWithContent | null> {
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

export async function getAllSlugs(): Promise<string[]> {
  const posts = await getPublishedPosts();
  return posts.map((post) => post.slug).filter(Boolean);
}
