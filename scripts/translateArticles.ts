/**
 * Notion 記事の本文・タイトル・概要を Claude API で翻訳して、
 * 翻訳結果を Notion 上に書き戻すバッチスクリプト。
 *
 * Notion DB に追加が必要なプロパティ（手動で先に追加してください）:
 *   - 「タイトル_en」 (rich_text)
 *   - 「タイトル_ko」 (rich_text)
 *   - 「概要_en」     (rich_text)
 *   - 「概要_ko」     (rich_text)
 *   - 「翻訳ステータス_en」 (select: 未翻訳 / 自動翻訳 / 手動上書き)
 *   - 「翻訳ステータス_ko」 (select: 未翻訳 / 自動翻訳 / 手動上書き)
 *   - 「翻訳元ハッシュ_en」 (rich_text) — ja 本文の SHA-256 を保存。差分検知用。
 *   - 「翻訳元ハッシュ_ko」 (rich_text)
 *
 * 本文の翻訳は親ページ直下の子ページとして格納する:
 *   - 「__translation_en」
 *   - 「__translation_ko」
 *
 * 動作ルール:
 *  - 「翻訳ステータス_xx」が「手動上書き」の記事は絶対に触らない（人間優先）。
 *  - ja 本文ハッシュが「翻訳元ハッシュ_xx」と一致すれば翻訳をスキップ（idempotent）。
 *  - 既存の子ページは中身を全削除→ 新しいブロックを append（NotionFlow の replace_content
 *    は使わず、子ページ単位で再構築するためテーブル等の破壊リスクを最小化）。
 *
 * 使い方:
 *   npm run translate:articles
 *   npm run translate:articles -- --dry-run
 *   npm run translate:articles -- --slug=foo --locale=en
 *   npm run translate:articles -- --concurrency=2
 */

import "dotenv/config";
import crypto from "node:crypto";
import { Client } from "@notionhq/client";
import Anthropic from "@anthropic-ai/sdk";
import { NotionToMarkdown } from "notion-to-md";

type Locale = "en" | "ko";
const TARGETS: Locale[] = ["en", "ko"];
const TRANSLATION_MODEL = "claude-sonnet-4-6";
const NOTION_VERSION = "2022-06-28";

const NOTION_API_KEY = process.env.NOTION_API_KEY!;
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

interface CliOpts {
  slug: string | null;
  locale: Locale | null;
  dryRun: boolean;
  concurrency: number;
}

function parseArgs(argv: string[]): CliOpts {
  const opts: CliOpts = { slug: null, locale: null, dryRun: false, concurrency: 3 };
  for (const arg of argv.slice(2)) {
    if (arg === "--dry-run") opts.dryRun = true;
    else if (arg.startsWith("--slug=")) opts.slug = arg.split("=")[1];
    else if (arg.startsWith("--locale=")) {
      const v = arg.split("=")[1];
      if (v === "en" || v === "ko") opts.locale = v;
    } else if (arg.startsWith("--concurrency=")) {
      const n = Number(arg.split("=")[1]);
      if (Number.isFinite(n) && n > 0) opts.concurrency = n;
    }
  }
  return opts;
}

const notion = new Client({ auth: NOTION_API_KEY });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const n2m = new NotionToMarkdown({ notionClient: notion as any });

const SYSTEM_PROMPT_BODY = `You are a professional translator for a FIFA World Cup 2026 fan site (Japanese → target language).

Strict rules for ARTICLE BODY translation:
- Translate the meaning faithfully and naturally for native speakers of the target language.
- PRESERVE markdown structure EXACTLY:
  * Headings (## / ###) keep their level
  * Tables: keep the same number of columns/rows; translate cell text only
  * Lists: keep -/* markers
  * Links: translate the link text but keep URLs unchanged
  * Image alt text: translate; image URLs unchanged
  * Code blocks: do not translate
  * Blockquotes: keep the > marker
- NEVER change numerical rankings, statistics, dates, scores, jersey numbers, or proper nouns spellings.
- For Japanese player/team names, use FIFA / official romanized form (e.g. 上田綺世 → Ayase Ueda; 日本 → Japan).
- Brand names ("DAZN", "toto", "WC 2026") stay verbatim.
- Output ONLY the translated markdown. No commentary, no fences.`;

const SYSTEM_PROMPT_META = `You are translating short metadata strings for a FIFA World Cup 2026 fan site (Japanese → target language).

Rules:
- Translate naturally and concisely.
- Keep proper nouns in their official form (FIFA romanization for player names).
- NEVER change numbers (rankings, dates, scores).
- Output ONLY a JSON object with the same keys as the input.`;

function sha256(s: string): string {
  return crypto.createHash("sha256").update(s).digest("hex");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function richText(value: string | null | undefined): any[] {
  if (!value) return [];
  // Notion rich_text プロパティの 1 ブロック上限 2000 文字に丸める
  return [{ type: "text", text: { content: value.slice(0, 2000) } }];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function readPlainTextProp(prop: any, type: "title" | "rich_text"): string {
  const arr = (prop && prop[type]) as { plain_text: string }[] | undefined;
  if (!arr) return "";
  return arr.map((t) => t.plain_text).join("");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function readSelect(prop: any): string {
  return prop?.select?.name ?? "";
}

interface PostMeta {
  pageId: string;
  slug: string;
  title: string;
  summary: string;
  status: string;
}

async function fetchPublishedPosts(): Promise<PostMeta[]> {
  const out: PostMeta[] = [];
  let cursor: string | undefined;
  do {
    const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: { property: "ステータス", select: { equals: "公開" } },
        start_cursor: cursor,
      }),
    });
    if (!res.ok) throw new Error(`Notion query failed: ${res.status} ${await res.text()}`);
    const data = (await res.json()) as { results: unknown[]; has_more: boolean; next_cursor?: string };
    for (const page of data.results) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = page as any;
      out.push({
        pageId: p.id,
        slug: readPlainTextProp(p.properties?.["スラッグ"], "rich_text"),
        title: readPlainTextProp(p.properties?.["タイトル"], "title"),
        summary: readPlainTextProp(p.properties?.["概要"], "rich_text"),
        status: readSelect(p.properties?.["ステータス"]),
      });
    }
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return out;
}

async function fetchPagePropertyDetails(pageId: string) {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": NOTION_VERSION,
    },
  });
  if (!res.ok) throw new Error(`Notion page fetch failed: ${res.status}`);
  return res.json();
}

async function findChildPageIdByName(parentPageId: string, name: string): Promise<string | null> {
  const res = await notion.blocks.children.list({ block_id: parentPageId, page_size: 100 });
  for (const block of res.results) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const b = block as any;
    if (b.type === "child_page" && b.child_page?.title === name) {
      return b.id as string;
    }
  }
  return null;
}

async function createChildPage(parentPageId: string, name: string): Promise<string> {
  const res = await notion.pages.create({
    parent: { page_id: parentPageId },
    properties: { title: { title: [{ type: "text", text: { content: name } }] } },
  });
  return res.id;
}

async function deleteAllChildren(blockId: string) {
  // 子ブロック全削除（ブロック自体は残す）
  const res = await notion.blocks.children.list({ block_id: blockId, page_size: 100 });
  for (const block of res.results) {
    try {
      await notion.blocks.delete({ block_id: block.id });
    } catch {
      // 既に消えていれば無視
    }
  }
  // ページネーション分も削除
  if (res.has_more) await deleteAllChildren(blockId);
}

// 改良版 Markdown→Notion ブロック変換
// 簡易実装: heading / paragraph / list / table をサポート
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function markdownToBlocks(md: string): any[] {
  const lines = md.split("\n");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocks: any[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    // heading
    const h = line.match(/^(#{1,3}) (.+)$/);
    if (h) {
      const level = h[1].length;
      const type = level === 1 ? "heading_1" : level === 2 ? "heading_2" : "heading_3";
      blocks.push({
        object: "block",
        type,
        [type]: { rich_text: richText(h[2]) },
      });
      i++; continue;
    }

    // bullet list
    if (/^- /.test(line)) {
      while (i < lines.length && /^- /.test(lines[i])) {
        blocks.push({
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: { rich_text: richText(lines[i].replace(/^- /, "")) },
        });
        i++;
      }
      continue;
    }

    // table (lines starting with |)
    if (line.trim().startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const rows = tableLines.map((tl) =>
        tl.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim())
      );
      // セパレーター行（---）を除外
      const dataRows = rows.filter((r) => !r.every((c) => /^:?-+:?$/.test(c)));
      if (dataRows.length === 0) continue;
      const colCount = Math.max(...dataRows.map((r) => r.length));
      blocks.push({
        object: "block",
        type: "table",
        table: {
          table_width: colCount,
          has_column_header: true,
          has_row_header: false,
          children: dataRows.map((r) => ({
            object: "block",
            type: "table_row",
            table_row: {
              cells: Array.from({ length: colCount }, (_, ci) => richText(r[ci] ?? "")),
            },
          })),
        },
      });
      continue;
    }

    // hr
    if (/^---+$/.test(line.trim())) {
      blocks.push({ object: "block", type: "divider", divider: {} });
      i++; continue;
    }

    // blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].replace(/^> /, ""));
        i++;
      }
      blocks.push({
        object: "block",
        type: "quote",
        quote: { rich_text: richText(quoteLines.join("\n")) },
      });
      continue;
    }

    // paragraph
    blocks.push({
      object: "block",
      type: "paragraph",
      paragraph: { rich_text: richText(line) },
    });
    i++;
  }
  return blocks;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function appendBlocksInChunks(blockId: string, blocks: any[]) {
  const CHUNK = 50; // Notion API は children を一度に最大 100 まで
  for (let i = 0; i < blocks.length; i += CHUNK) {
    const chunk = blocks.slice(i, i + CHUNK);
    await notion.blocks.children.append({ block_id: blockId, children: chunk });
  }
}

async function translateMeta(
  client: Anthropic,
  target: Locale,
  meta: { title: string; summary: string }
): Promise<{ title: string; summary: string }> {
  const targetName = target === "en" ? "English" : "Korean";
  const resp = await client.messages.create({
    model: TRANSLATION_MODEL,
    max_tokens: 800,
    system: SYSTEM_PROMPT_META,
    messages: [
      {
        role: "user",
        content: `Translate to ${targetName}. Output JSON only.\n${JSON.stringify(meta, null, 2)}`,
      },
    ],
  });
  const text = resp.content.filter((c) => c.type === "text").map((c) => (c as { text: string }).text).join("");
  const cleaned = text.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

async function translateBody(client: Anthropic, target: Locale, markdown: string): Promise<string> {
  const targetName = target === "en" ? "English" : "Korean";
  const resp = await client.messages.create({
    model: TRANSLATION_MODEL,
    max_tokens: 8192,
    system: SYSTEM_PROMPT_BODY,
    messages: [
      { role: "user", content: `Translate the following Japanese article body to ${targetName}.\n\n---\n${markdown}\n---` },
    ],
  });
  return resp.content.filter((c) => c.type === "text").map((c) => (c as { text: string }).text).join("").trim();
}

async function processPostForLocale(
  client: Anthropic,
  post: PostMeta,
  target: Locale,
  opts: CliOpts
): Promise<"translated" | "skipped-manual" | "skipped-no-change" | "error"> {
  const titleProp = `タイトル_${target}`;
  const summaryProp = `概要_${target}`;
  const statusProp = `翻訳ステータス_${target}`;
  const hashProp = `翻訳元ハッシュ_${target}`;
  const childPageName = `__translation_${target}`;

  // ja 本文を Markdown 化（ハッシュ計算と翻訳入力に使う）
  const mdBlocks = await n2m.pageToMarkdown(post.pageId);
  const md = n2m.toMarkdownString(mdBlocks).parent ?? "";
  const currentHash = sha256(`${post.title}\n${post.summary}\n${md}`);

  // ページ詳細を取って各プロパティを読む
  const pageDetail = await fetchPagePropertyDetails(post.pageId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props = (pageDetail as any).properties ?? {};
  const status = readSelect(props[statusProp]);
  const lastHash = readPlainTextProp(props[hashProp], "rich_text");

  if (status === "手動上書き") return "skipped-manual";
  if (lastHash === currentHash && !opts.dryRun) return "skipped-no-change";

  if (opts.dryRun) {
    console.log(`  [dry] ${post.slug} → ${target} (${md.length} chars)`);
    return "translated";
  }

  // 翻訳
  const translatedMeta = await translateMeta(client, target, { title: post.title, summary: post.summary });
  const translatedBody = await translateBody(client, target, md);
  const translatedBlocks = markdownToBlocks(translatedBody);

  // 子ページ作成 or 既存を空にして再構築
  let childId = await findChildPageIdByName(post.pageId, childPageName);
  if (!childId) {
    childId = await createChildPage(post.pageId, childPageName);
  } else {
    await deleteAllChildren(childId);
  }
  await appendBlocksInChunks(childId, translatedBlocks);

  // 親ページのプロパティ更新
  await notion.pages.update({
    page_id: post.pageId,
    properties: {
      [titleProp]: { rich_text: richText(translatedMeta.title) },
      [summaryProp]: { rich_text: richText(translatedMeta.summary) },
      [statusProp]: { select: { name: "自動翻訳" } },
      [hashProp]: { rich_text: richText(currentHash) },
    },
  });

  return "translated";
}

async function runWithConcurrency<T>(items: T[], concurrency: number, worker: (it: T) => Promise<void>) {
  const queue = [...items];
  const runners = Array.from({ length: concurrency }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      try {
        await worker(item);
      } catch (err) {
        console.error("worker error:", (err as Error).message);
      }
    }
  });
  await Promise.all(runners);
}

async function main() {
  if (!NOTION_API_KEY || !DATABASE_ID) {
    console.error("NOTION_API_KEY and NOTION_DATABASE_ID must be set");
    process.exit(1);
  }
  if (!ANTHROPIC_API_KEY && !process.argv.includes("--dry-run")) {
    console.error("ANTHROPIC_API_KEY required (skip with --dry-run)");
    process.exit(1);
  }

  const opts = parseArgs(process.argv);
  const targets = opts.locale ? [opts.locale] : TARGETS;

  const client = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : (null as unknown as Anthropic);

  console.log("Fetching published posts from Notion...");
  let posts = await fetchPublishedPosts();
  if (opts.slug) posts = posts.filter((p) => p.slug === opts.slug);
  console.log(`Posts to consider: ${posts.length}`);

  const stats: Record<string, number> = { translated: 0, "skipped-manual": 0, "skipped-no-change": 0, error: 0 };

  for (const target of targets) {
    console.log(`\n=== Target: ${target} ===`);
    await runWithConcurrency(posts, opts.concurrency, async (post) => {
      try {
        const result = await processPostForLocale(client, post, target, opts);
        stats[result] = (stats[result] ?? 0) + 1;
        console.log(`  ${result.padEnd(20)} ${target} ${post.slug}`);
      } catch (err) {
        stats.error++;
        console.error(`  error             ${target} ${post.slug}: ${(err as Error).message}`);
      }
    });
  }

  console.log("\n=== Summary ===");
  for (const [k, v] of Object.entries(stats)) console.log(`  ${k}: ${v}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
