// ========================================
// IndexNow 手動通知スクリプト
//
// 使い方:
//   1) 公開済みの全記事URL（3言語分）を一括送信:
//      npm run indexnow:notify
//
//   2) 特定URLだけ送信（複数可、絶対URLを渡す）:
//      npm run indexnow:notify -- https://www.wc2026report.com/ja/news/foo \
//                                 https://www.wc2026report.com/en/news/foo
//
//   3) 特定スラッグだけ送信（3言語分が自動生成される）:
//      npm run indexnow:notify -- --slug=foo --slug=bar
//
// 必要な環境変数: INDEXNOW_KEY（.env.local 参照）
// ========================================

import * as dotenv from "dotenv";
import * as path from "path";

// dotenv/config だと .env のみ。本プロジェクトは .env.local を使うため明示ロード。
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

const SITE_BASE_URL = "https://www.wc2026report.com";
const LOCALES = ["ja", "ko", "en"] as const;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow";

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "";
const HOST = SITE_BASE_URL.replace(/^https?:\/\//, "");
const KEY_LOCATION = `${SITE_BASE_URL}/${INDEXNOW_KEY}.txt`;

async function fetchAllPublishedSlugs(): Promise<string[]> {
  const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
  const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";
  if (!NOTION_API_KEY || !DATABASE_ID) {
    throw new Error("NOTION_API_KEY / NOTION_DATABASE_ID が未設定です");
  }

  const slugs: string[] = [];
  let cursor: string | undefined;

  do {
    const body: Record<string, unknown> = {
      filter: {
        property: "ステータス",
        status: { equals: "公開" },
      },
      page_size: 100,
    };
    if (cursor) body.start_cursor = cursor;

    const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Notion API error: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as {
      results: Array<{ properties: Record<string, unknown> }>;
      next_cursor: string | null;
      has_more: boolean;
    };

    for (const page of data.results) {
      const slugProp = (page.properties as Record<string, { rich_text?: Array<{ plain_text?: string }> }>)[
        "スラッグ"
      ];
      const slug = slugProp?.rich_text?.[0]?.plain_text?.trim();
      if (slug) slugs.push(slug);
    }

    cursor = data.has_more && data.next_cursor ? data.next_cursor : undefined;
  } while (cursor);

  return slugs;
}

function expandSlugToUrls(slug: string): string[] {
  return LOCALES.map((l) => `${SITE_BASE_URL}/${l}/news/${slug}`);
}

async function submit(urls: string[]): Promise<void> {
  if (urls.length === 0) {
    console.log("送信対象URLなし。終了します。");
    return;
  }

  // IndexNow は 1 リクエストあたり最大 10,000 URL
  const CHUNK = 9000;
  let totalOk = 0;
  for (let i = 0; i < urls.length; i += CHUNK) {
    const chunk = urls.slice(i, i + CHUNK);
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: KEY_LOCATION,
        urlList: chunk,
      }),
    });
    const text = await res.text();
    if (res.status >= 200 && res.status < 300) {
      totalOk += chunk.length;
      console.log(`✅ [${i + 1}-${i + chunk.length}] 送信成功: HTTP ${res.status}`);
    } else {
      console.error(`❌ [${i + 1}-${i + chunk.length}] 送信失敗: HTTP ${res.status} ${text}`);
    }
  }
  console.log(`\n合計 ${totalOk}/${urls.length} URL を IndexNow に送信しました。`);
}

async function main() {
  if (!INDEXNOW_KEY) {
    console.error("❌ INDEXNOW_KEY が .env.local に未設定です");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const explicitUrls = args.filter((a) => /^https?:\/\//.test(a));
  const slugArgs = args
    .filter((a) => a.startsWith("--slug="))
    .map((a) => a.replace(/^--slug=/, "").trim())
    .filter(Boolean);

  let urls: string[] = [];

  if (explicitUrls.length > 0) {
    urls = explicitUrls;
    console.log(`明示URL ${urls.length} 件を送信します。`);
  } else if (slugArgs.length > 0) {
    urls = slugArgs.flatMap(expandSlugToUrls);
    console.log(`スラッグ ${slugArgs.length} 件 × ${LOCALES.length} 言語 = ${urls.length} URL を送信します。`);
  } else {
    console.log("Notionから公開済み全記事を取得しています...");
    const slugs = await fetchAllPublishedSlugs();
    urls = slugs.flatMap(expandSlugToUrls);
    console.log(`公開記事 ${slugs.length} 件 × ${LOCALES.length} 言語 = ${urls.length} URL を送信します。`);
  }

  urls = Array.from(new Set(urls));
  await submit(urls);
}

main().catch((err) => {
  console.error("❌ エラー:", err);
  process.exit(1);
});
