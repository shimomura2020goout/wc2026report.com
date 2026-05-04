/**
 * Notion TeamDetails / Coaches DB の i18n カラムを Claude API で自動補完するバッチ。
 *
 * 前提: Notion 側に下記カラムを追加済み（NOTION_TRANSLATION_SETUP.md 参照）
 *   TeamDetails: 愛称_en/ko, ユニフォーム色_en/ko, チーム紹介_en/ko, 強み_en/ko, 弱み_en/ko,
 *                W杯の歴史_en/ko, 予選突破経緯_en/ko, 注目選手1/2/3_en/ko,
 *                翻訳ステータス_en/ko, 翻訳元ハッシュ_en/ko
 *   Coaches: 氏名_en/ko, 国籍_en/ko
 *
 * 動作:
 *  - 翻訳ステータス_xx == "手動上書き" の TeamDetail 行は触らない
 *  - ja の SHA-256 ハッシュが「翻訳元ハッシュ_xx」と一致すればスキップ（idempotent）
 *  - そうでなければ Claude で各フィールドを翻訳して Notion に書き戻し、ステータスを「自動翻訳」に
 *  - Coaches は手動上書き列がないため常に空列をターゲットにする
 *
 * 使い方:
 *   npm run translate:teams                      # 全 48 国 × en/ko
 *   npm run translate:teams -- --dry-run         # 翻訳対象だけ列挙
 *   npm run translate:teams -- --code=JPN        # 特定の国だけ
 *   npm run translate:teams -- --locale=en       # 英語だけ
 *   npm run translate:teams -- --concurrency=2
 *
 * 出力後の流れ:
 *   1. Notion で訳をレビュー、必要なら手動修正 → 翻訳ステータス_xx を「手動上書き」に
 *   2. `npm run sync:teams` で src/data/teamDetails.ts に書き出し
 *   3. commit → デプロイ
 */

import "dotenv/config";
import crypto from "node:crypto";
import { Client } from "@notionhq/client";
import Anthropic from "@anthropic-ai/sdk";
import { queryDataSource, getEnv } from "./lib/notionClient";

type Locale = "en" | "ko";
const TARGETS: Locale[] = ["en", "ko"];
const TRANSLATION_MODEL = "claude-sonnet-4-6";

interface CliOpts {
  code: string | null;
  locale: Locale | null;
  dryRun: boolean;
  concurrency: number;
}

function parseArgs(argv: string[]): CliOpts {
  const opts: CliOpts = { code: null, locale: null, dryRun: false, concurrency: 3 };
  for (const arg of argv.slice(2)) {
    if (arg === "--dry-run") opts.dryRun = true;
    else if (arg.startsWith("--code=")) opts.code = arg.split("=")[1].toUpperCase();
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

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM_PROMPT_TEAM = `You are a professional translator for a FIFA World Cup 2026 fan site.
You will receive several Japanese-language fields for one national team and translate them all to the target language.

Strict rules:
- Translate naturally and idiomatically, not word-for-word.
- Keep proper nouns (player names, club names, manager names) in the official romanized / target-language form
  (e.g. 上田綺世 → "Ayase Ueda" in English, "우에다 아야세" in Korean).
- Preserve numbers, dates, scores, FIFA rankings exactly.
- For LIST fields (strengths, weaknesses, starPlayers), return arrays of strings, one item per element.
- For NICKNAME fields, keep parenthetical original-language nicknames as-is when culturally appropriate
  (e.g. "El Tri (エル・トリ)" in English may become 'El Tri').
- Output ONLY a single JSON object with the same keys as the input. No markdown fences, no commentary.`;

const SYSTEM_PROMPT_COACH = `You are translating a soccer national-team coach's name and nationality (Japanese → target language).

Strict rules:
- Use the official romanization for the coach's name (FIFA / federation standard).
- Use the localized country name for the nationality (e.g. メキシコ → "Mexico" / "멕시코").
- Output ONLY a JSON object with keys "coach" and "nationality". No commentary.`;

function sha256(s: string): string {
  return crypto.createHash("sha256").update(s).digest("hex");
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function richText(value: string | undefined): any[] {
  if (!value) return [];
  return [{ type: "text", text: { content: value.slice(0, 2000) } }];
}

interface DetailRow {
  pageId: string;
  code: string;
  // ja
  nickname: string;
  kitColors: string;
  description: string;
  strengths: string;
  weaknesses: string;
  worldCupHistory: string;
  qualificationPath: string;
  starPlayers: string[];
}

interface CoachRow {
  pageId: string;
  code: string;
  coach: string;
  nationality: string;
  retiredAt: string | null;
  appointedAt: string | null;
  enCoach: string;
  koCoach: string;
  enNationality: string;
  koNationality: string;
}

async function fetchAllDetails(): Promise<DetailRow[]> {
  const dsId = getEnv("NOTION_TEAM_DETAILS_DATABASE_ID");
  const pages = await queryDataSource(dsId);
  return pages
    .map((page: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = page as any;
      const code = readPlainTextProp(p.properties?.["国コード"], "rich_text");
      if (!code) return null;
      return {
        pageId: p.id,
        code,
        nickname: readPlainTextProp(p.properties?.["愛称"], "rich_text"),
        kitColors: readPlainTextProp(p.properties?.["ユニフォーム色"], "rich_text"),
        description: readPlainTextProp(p.properties?.["チーム紹介"], "rich_text"),
        strengths: readPlainTextProp(p.properties?.["強み"], "rich_text"),
        weaknesses: readPlainTextProp(p.properties?.["弱み"], "rich_text"),
        worldCupHistory: readPlainTextProp(p.properties?.["W杯の歴史"], "rich_text"),
        qualificationPath: readPlainTextProp(p.properties?.["予選突破経緯"], "rich_text"),
        starPlayers: [
          readPlainTextProp(p.properties?.["注目選手1"], "rich_text"),
          readPlainTextProp(p.properties?.["注目選手2"], "rich_text"),
          readPlainTextProp(p.properties?.["注目選手3"], "rich_text"),
        ].filter(Boolean),
      } as DetailRow;
    })
    .filter((d): d is DetailRow => d !== null);
}

async function fetchAllCoaches(): Promise<CoachRow[]> {
  const dsId = getEnv("NOTION_COACHES_DATABASE_ID");
  const pages = await queryDataSource(dsId);
  return pages
    .map((page: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = page as any;
      const code = readPlainTextProp(p.properties?.["国コード"], "rich_text");
      if (!code) return null;
      return {
        pageId: p.id,
        code,
        coach: readPlainTextProp(p.properties?.["氏名"], "title"),
        nationality: readPlainTextProp(p.properties?.["国籍"], "rich_text"),
        retiredAt: p.properties?.["退任日"]?.date?.start ?? null,
        appointedAt: p.properties?.["就任日"]?.date?.start ?? null,
        enCoach: readPlainTextProp(p.properties?.["氏名_en"], "rich_text"),
        koCoach: readPlainTextProp(p.properties?.["氏名_ko"], "rich_text"),
        enNationality: readPlainTextProp(p.properties?.["国籍_en"], "rich_text"),
        koNationality: readPlainTextProp(p.properties?.["国籍_ko"], "rich_text"),
      } as CoachRow;
    })
    .filter((c): c is CoachRow => c !== null && c.retiredAt === null);
}

async function fetchPagePropsForStatus(notion: Client, pageId: string) {
  const page = await notion.pages.retrieve({ page_id: pageId });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (page as any).properties ?? {};
}

function buildJaPayloadForDetail(d: DetailRow) {
  return {
    nickname: d.nickname,
    kitColors: d.kitColors,
    description: d.description,
    strengths: d.strengths.split(/\r?\n/).map((l) => l.trim()).filter(Boolean),
    weaknesses: d.weaknesses.split(/\r?\n/).map((l) => l.trim()).filter(Boolean),
    worldCupHistory: d.worldCupHistory,
    qualificationPath: d.qualificationPath,
    starPlayers: d.starPlayers,
  };
}

interface TranslatedDetail {
  nickname?: string;
  kitColors?: string;
  description?: string;
  strengths?: string[];
  weaknesses?: string[];
  worldCupHistory?: string;
  qualificationPath?: string;
  starPlayers?: string[];
}

async function translateDetail(
  client: Anthropic,
  target: Locale,
  payload: ReturnType<typeof buildJaPayloadForDetail>
): Promise<TranslatedDetail> {
  const targetName = target === "en" ? "English" : "Korean";
  const resp = await client.messages.create({
    model: TRANSLATION_MODEL,
    max_tokens: 2400,
    system: SYSTEM_PROMPT_TEAM,
    messages: [
      {
        role: "user",
        content: `Translate to ${targetName}. Output JSON only.\n${JSON.stringify(payload, null, 2)}`,
      },
    ],
  });
  const text = resp.content
    .filter((c) => c.type === "text")
    .map((c) => (c as { text: string }).text)
    .join("");
  const cleaned = text.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

async function translateCoach(
  client: Anthropic,
  target: Locale,
  payload: { coach: string; nationality: string }
): Promise<{ coach: string; nationality: string }> {
  const targetName = target === "en" ? "English" : "Korean";
  const resp = await client.messages.create({
    model: TRANSLATION_MODEL,
    max_tokens: 200,
    system: SYSTEM_PROMPT_COACH,
    messages: [
      {
        role: "user",
        content: `Translate to ${targetName}. Output JSON only.\n${JSON.stringify(payload, null, 2)}`,
      },
    ],
  });
  const text = resp.content
    .filter((c) => c.type === "text")
    .map((c) => (c as { text: string }).text)
    .join("");
  const cleaned = text.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

async function processDetailLocale(
  notion: Client,
  client: Anthropic,
  d: DetailRow,
  target: Locale,
  opts: CliOpts
): Promise<"translated" | "skipped-manual" | "skipped-no-change" | "error"> {
  const props = await fetchPagePropsForStatus(notion, d.pageId);
  const status = readSelect(props[`翻訳ステータス_${target}`]);
  const lastHash = readPlainTextProp(props[`翻訳元ハッシュ_${target}`], "rich_text");

  const ja = buildJaPayloadForDetail(d);
  const currentHash = sha256(JSON.stringify(ja));

  if (status === "手動上書き") return "skipped-manual";
  if (lastHash === currentHash) return "skipped-no-change";

  if (opts.dryRun) {
    console.log(`  [dry] ${d.code} → ${target}`);
    return "translated";
  }

  const tr = await translateDetail(client, target, ja);

  // Notion へ書き戻し
  const players = tr.starPlayers ?? [];
  await notion.pages.update({
    page_id: d.pageId,
    properties: {
      [`愛称_${target}`]: { rich_text: richText(tr.nickname) },
      [`ユニフォーム色_${target}`]: { rich_text: richText(tr.kitColors) },
      [`チーム紹介_${target}`]: { rich_text: richText(tr.description) },
      [`強み_${target}`]: { rich_text: richText((tr.strengths ?? []).join("\n")) },
      [`弱み_${target}`]: { rich_text: richText((tr.weaknesses ?? []).join("\n")) },
      [`W杯の歴史_${target}`]: { rich_text: richText(tr.worldCupHistory) },
      [`予選突破経緯_${target}`]: { rich_text: richText(tr.qualificationPath) },
      [`注目選手1_${target}`]: { rich_text: richText(players[0]) },
      [`注目選手2_${target}`]: { rich_text: richText(players[1]) },
      [`注目選手3_${target}`]: { rich_text: richText(players[2]) },
      [`翻訳ステータス_${target}`]: { select: { name: "自動翻訳" } },
      [`翻訳元ハッシュ_${target}`]: { rich_text: richText(currentHash) },
    },
  });

  return "translated";
}

async function processCoachLocale(
  notion: Client,
  client: Anthropic,
  c: CoachRow,
  target: Locale,
  opts: CliOpts
): Promise<"translated" | "skipped-no-change" | "error"> {
  const existingCoach = target === "en" ? c.enCoach : c.koCoach;
  const existingNat = target === "en" ? c.enNationality : c.koNationality;
  if (existingCoach && existingNat) return "skipped-no-change";

  if (opts.dryRun) {
    console.log(`  [dry] ${c.code} coach (${c.coach}) → ${target}`);
    return "translated";
  }

  const tr = await translateCoach(client, target, { coach: c.coach, nationality: c.nationality });

  await notion.pages.update({
    page_id: c.pageId,
    properties: {
      [`氏名_${target}`]: { rich_text: richText(tr.coach) },
      [`国籍_${target}`]: { rich_text: richText(tr.nationality) },
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
  const opts = parseArgs(process.argv);

  if (!NOTION_API_KEY) {
    console.error("NOTION_API_KEY required");
    process.exit(1);
  }
  if (!ANTHROPIC_API_KEY && !opts.dryRun) {
    console.error("ANTHROPIC_API_KEY required (skip with --dry-run)");
    process.exit(1);
  }

  const notion = new Client({ auth: NOTION_API_KEY });
  const client = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : (null as unknown as Anthropic);

  const [details, coaches] = await Promise.all([fetchAllDetails(), fetchAllCoaches()]);

  let detailRows = details;
  let coachRows = coaches;
  if (opts.code) {
    detailRows = detailRows.filter((d) => d.code === opts.code);
    coachRows = coachRows.filter((c) => c.code === opts.code);
  }

  const targets = opts.locale ? [opts.locale] : TARGETS;

  console.log(`Details to consider: ${detailRows.length}, Coaches: ${coachRows.length}`);

  const stats: Record<string, number> = { translated: 0, "skipped-manual": 0, "skipped-no-change": 0, error: 0 };

  for (const target of targets) {
    console.log(`\n=== TeamDetails ${target} ===`);
    await runWithConcurrency(detailRows, opts.concurrency, async (d) => {
      try {
        const r = await processDetailLocale(notion, client, d, target, opts);
        stats[r] = (stats[r] ?? 0) + 1;
        console.log(`  ${r.padEnd(20)} ${d.code}`);
      } catch (err) {
        stats.error++;
        console.error(`  error             ${d.code}: ${(err as Error).message}`);
      }
    });

    console.log(`\n=== Coaches ${target} ===`);
    await runWithConcurrency(coachRows, opts.concurrency, async (c) => {
      try {
        const r = await processCoachLocale(notion, client, c, target, opts);
        stats[r] = (stats[r] ?? 0) + 1;
        console.log(`  ${r.padEnd(20)} ${c.code} (${c.coach})`);
      } catch (err) {
        stats.error++;
        console.error(`  error             ${c.code}: ${(err as Error).message}`);
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
