// ========================================
// Notion クライアント共通
// scripts/seedTeams.ts / syncTeams.ts で共有
// ========================================

import { Client } from "@notionhq/client";
import * as dotenv from "dotenv";
import path from "node:path";

// .env.local を読み込む
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

export function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`環境変数 ${key} が設定されていません。.env.local を確認してください。`);
  }
  return value;
}

export function createClient(): Client {
  return new Client({ auth: getEnv("NOTION_API_KEY") });
}

// Notion API を直接叩くヘルパー（SDK v5 の型問題を回避）
export async function queryDataSource(
  dataSourceId: string,
  body: Record<string, unknown> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  const apiKey = getEnv("NOTION_API_KEY");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: any[] = [];
  let hasMore = true;
  let startCursor: string | undefined;

  while (hasMore) {
    const res = await fetch(
      `https://api.notion.com/v1/data_sources/${dataSourceId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Notion-Version": "2025-09-03",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...body,
          page_size: 100,
          start_cursor: startCursor,
        }),
      }
    );

    if (!res.ok) {
      // 旧エンドポイントにフォールバック（データベースID指定）
      const fallback = await fetch(
        `https://api.notion.com/v1/databases/${dataSourceId}/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...body,
            page_size: 100,
            start_cursor: startCursor,
          }),
        }
      );
      if (!fallback.ok) {
        throw new Error(`Notion API error: ${fallback.status} ${await fallback.text()}`);
      }
      const data = await fallback.json();
      results.push(...data.results);
      hasMore = data.has_more;
      startCursor = data.next_cursor;
      continue;
    }

    const data = await res.json();
    results.push(...data.results);
    hasMore = data.has_more;
    startCursor = data.next_cursor;
  }

  return results;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getProp(page: any, name: string, type: string): unknown {
  const prop = page.properties?.[name];
  if (!prop) return null;
  switch (type) {
    case "title":
      return prop.title?.map((t: { plain_text: string }) => t.plain_text).join("") || "";
    case "rich_text":
      return prop.rich_text?.map((t: { plain_text: string }) => t.plain_text).join("") || "";
    case "select":
      return prop.select?.name || "";
    case "number":
      return prop.number ?? 0;
    case "checkbox":
      return prop.checkbox ?? false;
    case "date":
      return prop.date?.start || null;
    case "relation":
      return prop.relation?.map((r: { id: string }) => r.id) || [];
    default:
      return null;
  }
}

export function truncate2000(s: string): string {
  // Notion の rich_text は 1 オブジェクト 2000 文字制限
  return s.length > 2000 ? s.slice(0, 1997) + "..." : s;
}

export function richText(content: string) {
  return { rich_text: [{ text: { content: truncate2000(content) } }] };
}

export function title(content: string) {
  return { title: [{ text: { content: truncate2000(content) } }] };
}
