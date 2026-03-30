import { NextResponse } from "next/server";

const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";

const SITE_URL = "https://www.wc2026report.com";

// Vercel Cronから呼ばれるAPIルート
// 5分ごとに新しい公開記事をチェックし、LINEで友だち全員に配信
export async function GET(request: Request) {
  // Vercel Cronからのリクエストを検証
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // CRON_SECRETが未設定の場合はスキップ（開発環境用）
    if (process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!NOTION_API_KEY || !DATABASE_ID || !LINE_CHANNEL_ACCESS_TOKEN) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  try {
    // 直近15分以内に公開された記事を取得
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const notionRes = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: {
          and: [
            {
              property: "ステータス",
              select: { equals: "公開" },
            },
            {
              timestamp: "last_edited_time",
              last_edited_time: { after: fifteenMinutesAgo },
            },
          ],
        },
        sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
        page_size: 5,
      }),
      cache: "no-store",
    });

    if (!notionRes.ok) {
      const text = await notionRes.text();
      return NextResponse.json({ error: "Notion API error", detail: text }, { status: 500 });
    }

    const data = await notionRes.json();
    const pages = data.results || [];

    if (pages.length === 0) {
      return NextResponse.json({ message: "No new articles", sent: 0 });
    }

    let sentCount = 0;

    for (const page of pages) {
      const title = page.properties?.["タイトル"]?.title
        ?.map((t: { plain_text: string }) => t.plain_text)
        .join("") || "新しい記事";

      const slug = page.properties?.["スラッグ"]?.rich_text
        ?.map((t: { plain_text: string }) => t.plain_text)
        .join("") || "";

      const summary = page.properties?.["概要"]?.rich_text
        ?.map((t: { plain_text: string }) => t.plain_text)
        .join("") || "";

      const category = page.properties?.["カテゴリ"]?.select?.name || "ニュース";

      if (!slug) continue;

      const articleUrl = `${SITE_URL}/news/${slug}`;

      // LINE Messaging API でブロードキャスト送信
      const message = {
        type: "flex" as const,
        altText: `📰 ${title}`,
        contents: {
          type: "bubble",
          size: "kilo",
          header: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: `⚽ ${category}`,
                    size: "xs",
                    color: "#06C755",
                    weight: "bold",
                  },
                  {
                    type: "text",
                    text: "NEW",
                    size: "xxs",
                    color: "#FFFFFF",
                    weight: "bold",
                    align: "end",
                    backgroundColor: "#FF3B30",
                    cornerRadius: "sm",
                  },
                ],
                alignItems: "center",
              },
            ],
            backgroundColor: "#1a1a2e",
            paddingAll: "12px",
          },
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: title,
                weight: "bold",
                size: "sm",
                wrap: true,
                maxLines: 3,
              },
              ...(summary
                ? [
                    {
                      type: "text" as const,
                      text: summary.length > 80 ? summary.slice(0, 80) + "…" : summary,
                      size: "xs" as const,
                      color: "#888888",
                      wrap: true,
                      margin: "sm" as const,
                      maxLines: 3,
                    },
                  ]
                : []),
            ],
            paddingAll: "12px",
          },
          footer: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "button",
                action: {
                  type: "uri",
                  label: "記事を読む",
                  uri: articleUrl,
                },
                style: "primary",
                color: "#1a1a2e",
                height: "sm",
              },
            ],
            paddingAll: "12px",
          },
        },
      };

      const lineRes = await fetch("https://api.line.me/v2/bot/message/broadcast", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [message] }),
      });

      if (lineRes.ok) {
        sentCount++;
      } else {
        const lineError = await lineRes.text();
        console.error(`LINE broadcast failed for ${slug}:`, lineError);
      }
    }

    return NextResponse.json({
      message: `Sent ${sentCount} LINE notifications`,
      sent: sentCount,
      articles: pages.map((p: { id: string }) => p.id),
    });
  } catch (error) {
    console.error("LINE notify error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
