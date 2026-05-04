/**
 * Vercel Cron: Notion 記事の自動翻訳バッチ
 *
 * 実装方針:
 *  - 認証: Vercel Cron は Authorization: Bearer ${CRON_SECRET} を付ける（vercel.json 設定）
 *  - 各記事 × 各 locale で「翻訳ステータス_xx ≠ 手動上書き」かつ ja 本文ハッシュが変わっているものだけ翻訳
 *  - スクリプト本体（scripts/translateArticles.ts）と同じロジックを Edge ランタイムで動かす最小実装
 *  - 大量件数のとき Vercel の関数タイムアウト（Hobby: 60s, Pro: 300s）を超えないよう、
 *    1 回の呼び出しで処理する記事数に上限を設ける（環境変数 TRANSLATE_BATCH_SIZE、既定 6）
 *
 * 認証は cron 経由でない呼び出しもブロックする（公開エンドポイント化を防ぐ）。
 */

import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { Client } from "@notionhq/client";
import Anthropic from "@anthropic-ai/sdk";
import { NotionToMarkdown } from "notion-to-md";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // Pro プランのみ 300、Hobby は自動的に 60 に丸まる

const CRON_SECRET = process.env.CRON_SECRET || "";
const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const BATCH_SIZE = Number(process.env.TRANSLATE_BATCH_SIZE ?? "6");
const TRANSLATION_MODEL = "claude-sonnet-4-6";

type Locale = "en" | "ko";
const TARGETS: Locale[] = ["en", "ko"];

const notion = new Client({ auth: NOTION_API_KEY });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const n2m = new NotionToMarkdown({ notionClient: notion as any });

const SYSTEM_PROMPT_BODY = `You are a professional translator for a FIFA World Cup 2026 fan site (Japanese → target language).
Strict rules: preserve markdown structure exactly (headings, tables, lists, links, images). Never change numbers, rankings, dates, or scores. Use FIFA official romanization for Japanese player names. Keep brand names like "DAZN", "toto", "WC 2026" verbatim. Output ONLY translated markdown.`;

const SYSTEM_PROMPT_META = `You are translating short metadata (title + summary) for a FIFA World Cup 2026 fan site. Translate naturally. Keep proper nouns in their official form. Never change numbers. Output ONLY a JSON object with the same keys as the input.`;

function sha256(s: string): string {
  return crypto.createHash("sha256").update(s).digest("hex");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function richText(value: string | null | undefined): any[] {
  if (!value) return [];
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
}

async function fetchPublishedPosts(): Promise<PostMeta[]> {
  const out: PostMeta[] = [];
  let cursor: string | undefined;
  do {
    const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: { property: "ステータス", select: { equals: "公開" } },
        sorts: [{ property: "公開日", direction: "descending" }],
        start_cursor: cursor,
      }),
    });
    if (!res.ok) throw new Error(`Notion query: ${res.status}`);
    const data = (await res.json()) as { results: unknown[]; has_more: boolean; next_cursor?: string };
    for (const page of data.results) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = page as any;
      out.push({
        pageId: p.id,
        slug: readPlainTextProp(p.properties?.["スラッグ"], "rich_text"),
        title: readPlainTextProp(p.properties?.["タイトル"], "title"),
        summary: readPlainTextProp(p.properties?.["概要"], "rich_text"),
      });
    }
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return out;
}

async function fetchPageProps(pageId: string) {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: { Authorization: `Bearer ${NOTION_API_KEY}`, "Notion-Version": "2022-06-28" },
  });
  if (!res.ok) throw new Error(`Notion page: ${res.status}`);
  return res.json();
}

async function findChildPageId(parentPageId: string, name: string): Promise<string | null> {
  const res = await notion.blocks.children.list({ block_id: parentPageId, page_size: 100 });
  for (const block of res.results) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const b = block as any;
    if (b.type === "child_page" && b.child_page?.title === name) return b.id as string;
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
  const res = await notion.blocks.children.list({ block_id: blockId, page_size: 100 });
  for (const block of res.results) {
    try { await notion.blocks.delete({ block_id: block.id }); } catch {}
  }
  if (res.has_more) await deleteAllChildren(blockId);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function markdownToBlocks(md: string): any[] {
  const lines = md.split("\n");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocks: any[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const h = line.match(/^(#{1,3}) (.+)$/);
    if (h) {
      const lvl = h[1].length;
      const type = lvl === 1 ? "heading_1" : lvl === 2 ? "heading_2" : "heading_3";
      blocks.push({ object: "block", type, [type]: { rich_text: richText(h[2]) } });
      i++; continue;
    }
    if (/^- /.test(line)) {
      while (i < lines.length && /^- /.test(lines[i])) {
        blocks.push({ object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: richText(lines[i].replace(/^- /, "")) } });
        i++;
      }
      continue;
    }
    if (line.trim().startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) { tableLines.push(lines[i].trim()); i++; }
      const rows = tableLines.map((tl) => tl.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim()));
      const dataRows = rows.filter((r) => !r.every((c) => /^:?-+:?$/.test(c)));
      if (dataRows.length === 0) continue;
      const colCount = Math.max(...dataRows.map((r) => r.length));
      blocks.push({
        object: "block", type: "table",
        table: {
          table_width: colCount, has_column_header: true, has_row_header: false,
          children: dataRows.map((r) => ({
            object: "block", type: "table_row",
            table_row: { cells: Array.from({ length: colCount }, (_, ci) => richText(r[ci] ?? "")) },
          })),
        },
      });
      continue;
    }
    if (/^---+$/.test(line.trim())) { blocks.push({ object: "block", type: "divider", divider: {} }); i++; continue; }
    if (line.startsWith("> ")) {
      const lines2: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) { lines2.push(lines[i].replace(/^> /, "")); i++; }
      blocks.push({ object: "block", type: "quote", quote: { rich_text: richText(lines2.join("\n")) } });
      continue;
    }
    blocks.push({ object: "block", type: "paragraph", paragraph: { rich_text: richText(line) } });
    i++;
  }
  return blocks;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function appendBlocksInChunks(blockId: string, blocks: any[]) {
  const CHUNK = 50;
  for (let i = 0; i < blocks.length; i += CHUNK) {
    await notion.blocks.children.append({ block_id: blockId, children: blocks.slice(i, i + CHUNK) });
  }
}

async function translateMeta(client: Anthropic, target: Locale, meta: { title: string; summary: string }): Promise<{ title: string; summary: string }> {
  const targetName = target === "en" ? "English" : "Korean";
  const resp = await client.messages.create({
    model: TRANSLATION_MODEL, max_tokens: 800, system: SYSTEM_PROMPT_META,
    messages: [{ role: "user", content: `Translate to ${targetName}. Output JSON only.\n${JSON.stringify(meta, null, 2)}` }],
  });
  const text = resp.content.filter((c) => c.type === "text").map((c) => (c as { text: string }).text).join("");
  const cleaned = text.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

async function translateBody(client: Anthropic, target: Locale, markdown: string): Promise<string> {
  const targetName = target === "en" ? "English" : "Korean";
  const resp = await client.messages.create({
    model: TRANSLATION_MODEL, max_tokens: 8192, system: SYSTEM_PROMPT_BODY,
    messages: [{ role: "user", content: `Translate the following Japanese article body to ${targetName}.\n\n---\n${markdown}\n---` }],
  });
  return resp.content.filter((c) => c.type === "text").map((c) => (c as { text: string }).text).join("").trim();
}

interface ProcessResult {
  slug: string;
  target: Locale;
  result: "translated" | "skipped-manual" | "skipped-no-change" | "error";
  error?: string;
}

async function processOne(client: Anthropic, post: PostMeta, target: Locale): Promise<ProcessResult> {
  const titleProp = `タイトル_${target}`;
  const summaryProp = `概要_${target}`;
  const statusProp = `翻訳ステータス_${target}`;
  const hashProp = `翻訳元ハッシュ_${target}`;
  const childPageName = `__translation_${target}`;

  try {
    const mdBlocks = await n2m.pageToMarkdown(post.pageId);
    const md = n2m.toMarkdownString(mdBlocks).parent ?? "";
    const currentHash = sha256(`${post.title}\n${post.summary}\n${md}`);

    const pageDetail = await fetchPageProps(post.pageId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props = (pageDetail as any).properties ?? {};
    const status = readSelect(props[statusProp]);
    const lastHash = readPlainTextProp(props[hashProp], "rich_text");

    if (status === "手動上書き") return { slug: post.slug, target, result: "skipped-manual" };
    if (lastHash === currentHash) return { slug: post.slug, target, result: "skipped-no-change" };

    const translatedMeta = await translateMeta(client, target, { title: post.title, summary: post.summary });
    const translatedBody = await translateBody(client, target, md);
    const translatedBlocks = markdownToBlocks(translatedBody);

    let childId = await findChildPageId(post.pageId, childPageName);
    if (!childId) childId = await createChildPage(post.pageId, childPageName);
    else await deleteAllChildren(childId);
    await appendBlocksInChunks(childId, translatedBlocks);

    await notion.pages.update({
      page_id: post.pageId,
      properties: {
        [titleProp]: { rich_text: richText(translatedMeta.title) },
        [summaryProp]: { rich_text: richText(translatedMeta.summary) },
        [statusProp]: { select: { name: "自動翻訳" } },
        [hashProp]: { rich_text: richText(currentHash) },
      },
    });

    return { slug: post.slug, target, result: "translated" };
  } catch (err) {
    return { slug: post.slug, target, result: "error", error: (err as Error).message };
  }
}

export async function GET(request: Request) {
  // 認証: Vercel Cron からの Bearer か、ローカル開発用の ?secret=
  const authHeader = request.headers.get("authorization");
  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");
  if (CRON_SECRET) {
    const ok = authHeader === `Bearer ${CRON_SECRET}` || querySecret === CRON_SECRET;
    if (!ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!NOTION_API_KEY || !DATABASE_ID || !ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "missing env (NOTION_API_KEY / NOTION_DATABASE_ID / ANTHROPIC_API_KEY)" }, { status: 500 });
  }

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const posts = await fetchPublishedPosts();

  // 「翻訳が必要そう」な順に並べる: 最新公開を優先（fetchPublishedPosts が既に DESC で取得）
  // バッチサイズ × locale 数の単位で 1 回の cron 実行で処理し、それ以上は次回に持ち越す
  const candidates: { post: PostMeta; target: Locale }[] = [];
  for (const post of posts) {
    for (const target of TARGETS) candidates.push({ post, target });
  }
  const slice = candidates.slice(0, BATCH_SIZE);

  const results: ProcessResult[] = [];
  for (const { post, target } of slice) {
    const r = await processOne(client, post, target);
    results.push(r);
  }

  const summary = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.result] = (acc[r.result] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    processed: results.length,
    totalPosts: posts.length,
    totalCandidates: candidates.length,
    summary,
    results,
  });
}
