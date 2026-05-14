import { NextResponse } from "next/server";

/**
 * 予約公開cron — 毎朝7:00 JST 実行
 *
 * 動作:
 *   Notion DB から以下を満たすページを取得し、ステータスを「公開」に切り替える。
 *     - ステータス = "下書き"
 *     - タグ に "予約公開" を含む
 *     - 公開日 が今日（JST）以前
 *
 * 利用方法（編集者向け）:
 *   1. Notionで記事を ステータス=下書き で作成
 *   2. タグ に "予約公開" を追加
 *   3. 公開日 に公開したい日付（未来日でOK）をセット
 *   4. 当該日付の朝7:00（JST）に自動で「公開」へ切り替わる
 */

const CRON_SECRET = process.env.CRON_SECRET || "";
const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

const SCHEDULED_TAG = "予約公開";

interface ScheduledPost {
  id: string;
  title: string;
  slug: string;
}

function todayJst(): string {
  // JSTの今日（YYYY-MM-DD）を ISO の日付部だけ返す
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

async function findScheduledPosts(): Promise<ScheduledPost[]> {
  if (!NOTION_API_KEY || !DATABASE_ID) return [];

  const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filter: {
        and: [
          { property: "ステータス", select: { equals: "下書き" } },
          { property: "タグ", multi_select: { contains: SCHEDULED_TAG } },
          { property: "公開日", date: { on_or_before: todayJst() } },
        ],
      },
      page_size: 50,
    }),
  });

  if (!res.ok) {
    console.error("[publish-scheduled] Notion query error:", res.status, await res.text());
    return [];
  }

  const data = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.results as any[]).map((p) => ({
    id: p.id,
    title: p.properties?.["タイトル"]?.title?.[0]?.plain_text ?? "(無題)",
    slug: p.properties?.["スラッグ"]?.rich_text?.[0]?.plain_text ?? "",
  }));
}

async function publishPost(pageId: string): Promise<boolean> {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        ステータス: { select: { name: "公開" } },
      },
    }),
  });

  if (!res.ok) {
    console.error("[publish-scheduled] Notion patch error:", res.status, await res.text());
    return false;
  }
  return true;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const scheduled = await findScheduledPosts();
    const published: { title: string; slug: string }[] = [];
    const failed: { title: string; slug: string }[] = [];

    for (const post of scheduled) {
      const ok = await publishPost(post.id);
      if (ok) {
        published.push({ title: post.title, slug: post.slug });
      } else {
        failed.push({ title: post.title, slug: post.slug });
      }
    }

    return NextResponse.json({
      message: `Published ${published.length} scheduled post(s)`,
      target: todayJst(),
      total: scheduled.length,
      published,
      failed,
    });
  } catch (error) {
    console.error("[publish-scheduled] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
