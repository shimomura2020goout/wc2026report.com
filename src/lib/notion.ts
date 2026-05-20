import { NotionToMarkdown } from "notion-to-md";
import { Client } from "@notionhq/client";
import { unstable_cache } from "next/cache";
import type { Locale } from "@/i18n/constants";

const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

// 429 / 5xx / timeout を「一時障害」として識別する
// ランタイム ISR でこれを検知したらページ側で 200+noindex フォールバックに振り、
// Googlebot に 5xx を返さない（GSC のサーバーエラー誤計上を防ぐ）
export function isNotionTransientError(err: unknown): boolean {
  const e = err as { code?: string; status?: number; message?: string } | null | undefined;
  const msg = String(e?.message ?? err ?? "");
  const isRateLimit = e?.code === "rate_limited" || e?.status === 429 || /\b429\b|rate_limited/.test(msg);
  const isTimeout = e?.code === "notionhq_client_request_timeout" || /timed out|timeout|ECONNRESET|ETIMEDOUT/i.test(msg);
  const is5xx = e?.status === 502 || e?.status === 503 || e?.status === 504 || /\b50[234]\b/.test(msg);
  return isRateLimit || isTimeout || is5xx;
}

// 429 / 502 / 503 を指数バックオフで自動リトライ
// ビルド時に 500+ ページが Notion API に殺到してレート制限に当たるため必須
async function withRetry<T>(label: string, fn: () => Promise<T>, maxRetries = 10): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isNotionTransientError(err) || i === maxRetries) throw err;
      // exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s, 60s, 60s, 60s, 60s
      const delay = Math.min(1000 * Math.pow(2, i), 60000);
      console.warn(`[notion] retry ${i + 1}/${maxRetries} for ${label} after ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

// グローバル並列数 1 + 最低 350ms 間隔（≈ 2.85 req/s, Notion 公式上限 3 req/s 内）
// 並列に投げると bursting 扱いになり長時間ロックされるため逐次化
const MAX_CONCURRENT = 1;
const MIN_INTERVAL_MS = 350;
let activeRequests = 0;
let lastRequestAt = 0;
const queue: Array<() => void> = [];
async function withLimit<T>(fn: () => Promise<T>): Promise<T> {
  if (activeRequests >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => queue.push(resolve));
  }
  activeRequests++;
  try {
    const elapsed = Date.now() - lastRequestAt;
    if (elapsed < MIN_INTERVAL_MS) {
      await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
    }
    lastRequestAt = Date.now();
    return await fn();
  } finally {
    activeRequests--;
    const next = queue.shift();
    if (next) next();
  }
}

// notion-to-md 用のクライアント（ページ本文取得）
// Notion 公式 SDK のデフォルトタイムアウトは 60s。Vercel ビルド時は遅延が大きく
// 60s では足りないことがあるため 120s に拡張（withRetry でリトライもされる）。
const rawNotionClient = new Client({ auth: NOTION_API_KEY, timeoutMs: 120000 });
// notionClient.blocks.children.list はビルド時に 500+ 回呼ばれるため
// リトライ・並列制限ラッパで包む（n2m.pageToMarkdown が内部でこれを呼ぶ）
const originalBlocksList = rawNotionClient.blocks.children.list.bind(rawNotionClient.blocks.children);
rawNotionClient.blocks.children.list = ((args: Parameters<typeof originalBlocksList>[0]) =>
  withLimit(() => withRetry(`blocks.children.list(${args.block_id})`, () => originalBlocksList(args)))) as typeof originalBlocksList;
const notionClient = rawNotionClient;
// `parseChildPages: false` で `__translation_en` / `__translation_ko` 子ページの本文が
// 親記事に連結されないようにする（無効化しないと /ja の記事末尾に英訳・韓国語訳が連結表示される）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const n2m = new NotionToMarkdown({ notionClient: notionClient as any, config: { parseChildPages: false } });

// テーブルブロックのカスタムトランスフォーマー
n2m.setCustomTransformer("table", async (block) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableBlock = block as any;
  const hasColumnHeader = tableBlock?.table?.has_column_header ?? false;

  try {
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

      if (ri === 0 && hasColumnHeader) {
        mdRows.push(`| ${cellTexts.map(() => "---").join(" | ")} |`);
      }
    }

    if (!hasColumnHeader && rows.length > 1) {
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

// 翻訳の出処を識別するためのフラグ
// - 'original' = ja 原文をそのまま表示（en/ko 翻訳が未生成のフォールバック状態）
// - 'auto'     = scripts/translateArticles.ts による自動翻訳
// - 'manual'   = Notion で「翻訳ステータス_xx」が「手動上書き」になっており、人間が編集
export type TranslationSource = "original" | "auto" | "manual";

export interface BlogPostWithContent extends BlogPost {
  content: string;
  translationSource: TranslationSource;
}

// Notion API を直接 fetch で呼ぶ
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function queryDatabase(body: Record<string, unknown>): Promise<any> {
  if (!NOTION_API_KEY || !DATABASE_ID) {
    return { results: [] };
  }

  return withLimit(() =>
    withRetry("queryDatabase", async () => {
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
        const text = await res.text();
        const err = new Error(`Notion API error: ${res.status} ${text}`) as Error & { status?: number };
        err.status = res.status;
        throw err;
      }

      return res.json();
    })
  );
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

// Notion 上の locale 別プロパティ名の取り決め
// ja (原文) は基本プロパティ「タイトル」「概要」「本文」を使う
// en/ko は別プロパティに格納:
//   - 「タイトル_en」「タイトル_ko」     (rich_text)
//   - 「概要_en」「概要_ko」           (rich_text)
//   - 「翻訳ステータス_en」「翻訳ステータス_ko」 (select: 未翻訳/自動翻訳/手動上書き)
//   - 本文翻訳は子ページ（Notion 上の「__translation_en」「__translation_ko」と命名）
function localizedTitleProp(locale: Locale): string | null {
  if (locale === "ja") return null;
  return `タイトル_${locale}`;
}
function localizedSummaryProp(locale: Locale): string | null {
  if (locale === "ja") return null;
  return `概要_${locale}`;
}
function localizedStatusProp(locale: Locale): string | null {
  if (locale === "ja") return null;
  return `翻訳ステータス_${locale}`;
}
const TRANSLATION_CHILD_PAGE_PREFIX = "__translation_";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pageToPost(page: any, locale: Locale = "ja"): BlogPost {
  const baseTitle = (extractProperty(page, "タイトル", "title") as string) ?? "";
  const baseSummary = extractProperty(page, "概要", "rich_text") as string | null;

  let title = baseTitle;
  let summary = baseSummary;

  if (locale !== "ja") {
    const tProp = localizedTitleProp(locale);
    const sProp = localizedSummaryProp(locale);
    if (tProp) {
      const localized = (extractProperty(page, tProp, "rich_text") as string | null) ?? "";
      if (localized) title = localized;
    }
    if (sProp) {
      const localized = extractProperty(page, sProp, "rich_text") as string | null;
      if (localized) summary = localized;
    }
  }

  return {
    id: page.id,
    title,
    slug: extractProperty(page, "スラッグ", "rich_text") as string,
    status: extractProperty(page, "ステータス", "select") as string,
    category: extractProperty(page, "カテゴリ", "select") as string,
    tags: extractProperty(page, "タグ", "multi_select") as string[],
    relatedTeams: (extractProperty(page, "関連チーム", "multi_select") as string[]) || [],
    publishedAt: extractProperty(page, "公開日", "date") as string | null,
    eyecatchUrl: extractProperty(page, "アイキャッチURL", "url") as string | null,
    sourceName: extractProperty(page, "出典名", "rich_text") as string | null,
    sourceUrl: extractProperty(page, "出典URL", "url") as string | null,
    summary,
  };
}

// 翻訳ステータスを取得（ja の場合は常に 'manual' 扱い ＝原文として尊重）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function readTranslationStatus(page: any, locale: Locale): TranslationSource {
  if (locale === "ja") return "manual";
  const prop = localizedStatusProp(locale);
  if (!prop) return "original";
  const value = extractProperty(page, prop, "select") as string;
  if (value === "手動上書き") return "manual";
  if (value === "自動翻訳") return "auto";
  return "original";
}

// 子ページを名前で取得（__translation_en, __translation_ko）
async function findTranslationChildPage(parentPageId: string, locale: Locale): Promise<string | null> {
  if (locale === "ja") return null;
  try {
    const res = await notionClient.blocks.children.list({ block_id: parentPageId, page_size: 100 });
    for (const block of res.results) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const b = block as any;
      if (b.type === "child_page") {
        const title: string = b.child_page?.title ?? "";
        if (title === `${TRANSLATION_CHILD_PAGE_PREFIX}${locale}`) {
          return b.id as string;
        }
      }
    }
  } catch {
    // ignore — child page lookup is best-effort
  }
  return null;
}

// ビルド時の重複DBクエリを排除する process 内キャッシュ
// 全 locale 共通のページオブジェクト配列を一度だけ取得し、再利用する
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _allPagesPromise: Promise<any[]> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function _fetchAllPagesOnce(): Promise<any[]> {
  if (_allPagesPromise) return _allPagesPromise;
  _allPagesPromise = (async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out: any[] = [];
    let cursor: string | undefined;
    do {
      const data = await queryDatabase({
        filter: { property: "ステータス", select: { equals: "公開" } },
        sorts: [{ property: "公開日", direction: "descending" }],
        ...(cursor ? { start_cursor: cursor } : {}),
      });
      out.push(...data.results);
      cursor = data.has_more ? data.next_cursor : undefined;
    } while (cursor);
    return out;
  })();
  return _allPagesPromise;
}

// 公開記事一覧を取得（未キャッシュ）
async function _getPublishedPosts(locale: Locale = "ja"): Promise<BlogPost[]> {
  const pages = await _fetchAllPagesOnce();
  return pages.map((p: unknown) => pageToPost(p, locale));
}

// 記事詳細（本文含む）を取得（未キャッシュ）
async function _getPostBySlug(slug: string, locale: Locale = "ja"): Promise<BlogPostWithContent | null> {
  const pages = await _fetchAllPagesOnce();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const page = pages.find((p: any) => {
    const sl = extractProperty(p, "スラッグ", "rich_text") as string;
    return sl === slug;
  });
  if (!page) return null;

  const post = pageToPost(page, locale);
  const status = readTranslationStatus(page, locale);

  // 本文 Markdown を取得
  // ja: 親ページから直接
  // en/ko: 子ページ「__translation_<locale>」から（無ければ ja 原文にフォールバック）
  let contentSourceId: string = page.id;
  let actualSource: TranslationSource = status;
  if (locale !== "ja") {
    const childId = await findTranslationChildPage(page.id, locale);
    if (childId) {
      contentSourceId = childId;
    } else {
      contentSourceId = page.id;
      actualSource = "original";
    }
  }

  const mdBlocks = await n2m.pageToMarkdown(contentSourceId);
  const mdString = n2m.toMarkdownString(mdBlocks);

  return {
    ...post,
    content: mdString.parent,
    translationSource: actualSource,
  };
}

// ---------- キャッシュ層 ----------
const CACHE_TTL_SECONDS = 300;

export async function getPublishedPosts(locale: Locale = "ja"): Promise<BlogPost[]> {
  const cached = unstable_cache(
    () => _getPublishedPosts(locale),
    ["notion:getPublishedPosts", locale],
    { revalidate: CACHE_TTL_SECONDS, tags: ["notion", "notion:list", `notion:list:${locale}`] }
  );
  return cached();
}

export async function getPostBySlug(slug: string, locale: Locale = "ja"): Promise<BlogPostWithContent | null> {
  const cached = unstable_cache(
    () => _getPostBySlug(slug, locale),
    ["notion:getPostBySlug", slug, locale],
    { revalidate: CACHE_TTL_SECONDS, tags: ["notion", `notion:post:${slug}`] }
  );
  return cached();
}

export const getAllSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const posts = await _getPublishedPosts("ja");
    return posts.map((post) => post.slug).filter(Boolean);
  },
  ["notion:getAllSlugs"],
  { revalidate: CACHE_TTL_SECONDS, tags: ["notion", "notion:list"] }
);
