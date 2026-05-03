/**
 * 辞書ファイルの差分を Claude API で翻訳して埋めるスクリプト
 *
 * 使い方:
 *   npm run dict:sync
 *   npm run dict:sync -- --target=en          # en だけ
 *   npm run dict:sync -- --dry-run            # API 呼ばずに差分だけ表示
 *   npm run dict:sync -- --force-key=meta.defaultDescription  # 既存値を強制再翻訳
 *
 * ロジック:
 *  1. ja.json をマスターとして読み込む
 *  2. en.json / ko.json と比較して、ja に存在するが対象側に無い（または "" 値の）キーを抽出
 *  3. Claude API に「このキーの ja 値を {target} に翻訳して」と依頼
 *  4. 翻訳結果を対象 JSON にマージして書き戻す
 *
 * 注意:
 *  - ANTHROPIC_API_KEY が必要（Vercel 環境変数 or .env.local）
 *  - サッカー固有名詞・ランキング数値は変えない指示を system prompt に含める
 *  - 既存の手動翻訳（既に値があるキー）は --force-key で明示しない限り上書きしない
 */

import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";

type Locale = "ja" | "en" | "ko";
type Dict = Record<string, string | string[]>;

const LOCALES_DIR = path.join(process.cwd(), "src/i18n/locales");
const SUPPORTED_TARGETS: Locale[] = ["en", "ko"];
const TRANSLATION_MODEL = "claude-sonnet-4-6";

interface CliOpts {
  target: Locale[];
  dryRun: boolean;
  forceKeys: Set<string>;
}

function parseArgs(argv: string[]): CliOpts {
  const opts: CliOpts = {
    target: SUPPORTED_TARGETS,
    dryRun: false,
    forceKeys: new Set(),
  };
  for (const arg of argv.slice(2)) {
    if (arg === "--dry-run") opts.dryRun = true;
    else if (arg.startsWith("--target=")) {
      const value = arg.split("=")[1] as Locale;
      if (SUPPORTED_TARGETS.includes(value)) opts.target = [value];
    } else if (arg.startsWith("--force-key=")) {
      opts.forceKeys.add(arg.split("=")[1]);
    }
  }
  return opts;
}

function readDict(locale: Locale): Dict {
  const p = path.join(LOCALES_DIR, `${locale}.json`);
  return JSON.parse(readFileSync(p, "utf8")) as Dict;
}

function writeDict(locale: Locale, dict: Dict) {
  const p = path.join(LOCALES_DIR, `${locale}.json`);
  // 末尾の改行を維持し、JSON.stringify で 2 スペース整形
  writeFileSync(p, JSON.stringify(dict, null, 2) + "\n", "utf8");
}

function findMissingKeys(master: Dict, target: Dict, forceKeys: Set<string>): string[] {
  const out: string[] = [];
  for (const [key, value] of Object.entries(master)) {
    const targetValue = target[key];
    if (forceKeys.has(key)) {
      out.push(key);
      continue;
    }
    if (targetValue === undefined) {
      out.push(key);
      continue;
    }
    // 値が完全に空、または ja の値とそっくりそのまま（=未翻訳）の場合も対象に
    if (typeof value === "string" && typeof targetValue === "string") {
      if (targetValue.trim() === "" || targetValue === value) {
        out.push(key);
      }
    } else if (Array.isArray(value) && Array.isArray(targetValue)) {
      if (targetValue.length === 0) out.push(key);
    } else if (typeof value !== typeof targetValue) {
      // 型が違う場合は再翻訳
      out.push(key);
    }
  }
  return out;
}

const SYSTEM_PROMPT = `You are a professional translator for a FIFA World Cup 2026 fan site (Japanese → target language).

Strict rules:
- Translate the meaning faithfully and naturally for native speakers of the target language.
- Keep all proper nouns (player names, team names, stadium names) as they would be officially rendered in the target language. For Japanese player names, use the FIFA / official romanized form.
- NEVER change numerical rankings, statistics, dates, or scores. Copy them verbatim.
- Preserve placeholders like {name}, {count}, {rank} EXACTLY as they appear.
- Preserve markdown / HTML tags / line breaks if any.
- Keep the same brand wording where it appears in Japanese (e.g. "WC 2026", "DAZN", "toto"). Do NOT invent translations for these brand strings.
- For SEO keyword arrays, return native-language keywords that real users would search, not literal translations of the Japanese words.
- For UI strings, prefer concise, idiomatic phrasing that fits the same role as the Japanese (button label / heading / sentence).
- Output ONLY a JSON object with the same shape as the input. No markdown fences, no commentary.`;

function buildUserPrompt(target: Locale, items: { key: string; value: string | string[] }[]): string {
  const targetName = target === "en" ? "English" : "Korean";
  const payload: Record<string, string | string[]> = {};
  for (const it of items) payload[it.key] = it.value;
  return `Translate the values of the following Japanese dictionary entries to ${targetName}.
Return a JSON object with the SAME keys and translated values. Match the type (string vs array of strings).

Input (Japanese):
${JSON.stringify(payload, null, 2)}

Output JSON only.`;
}

async function translateBatch(
  client: Anthropic,
  target: Locale,
  items: { key: string; value: string | string[] }[]
): Promise<Record<string, string | string[]>> {
  const resp = await client.messages.create({
    model: TRANSLATION_MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(target, items) }],
  });

  const text = resp.content
    .filter((c) => c.type === "text")
    .map((c) => (c as { text: string }).text)
    .join("");

  // Claude が ```json ... ``` を付ける場合があるので剥がす
  const cleaned = text.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

  try {
    return JSON.parse(cleaned) as Record<string, string | string[]>;
  } catch (err) {
    throw new Error(`Failed to parse Claude response as JSON for ${target}: ${(err as Error).message}\nRaw: ${cleaned.slice(0, 500)}`);
  }
}

async function main() {
  const opts = parseArgs(process.argv);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey && !opts.dryRun) {
    console.error("ANTHROPIC_API_KEY is required (set in .env.local or environment).");
    process.exit(1);
  }

  const master = readDict("ja");
  console.log(`Master (ja): ${Object.keys(master).length} keys`);

  const client = apiKey ? new Anthropic({ apiKey }) : null;

  for (const target of opts.target) {
    const targetDict = readDict(target);
    const missing = findMissingKeys(master, targetDict, opts.forceKeys);

    console.log(`\n=== ${target.toUpperCase()} ===`);
    console.log(`Existing keys: ${Object.keys(targetDict).length}`);
    console.log(`Missing/stale: ${missing.length}`);

    if (missing.length === 0) {
      console.log(`✔ ${target}.json is in sync.`);
      continue;
    }

    if (opts.dryRun) {
      console.log("Missing keys (first 30):");
      missing.slice(0, 30).forEach((k) => console.log("  -", k));
      if (missing.length > 30) console.log(`  ... and ${missing.length - 30} more`);
      continue;
    }

    if (!client) throw new Error("Claude client unavailable");

    // バッチ分割（一度に大きすぎると JSON 出力がトークン上限で切れる）
    const BATCH_SIZE = 25;
    const merged: Record<string, string | string[]> = {};
    for (let i = 0; i < missing.length; i += BATCH_SIZE) {
      const batchKeys = missing.slice(i, i + BATCH_SIZE);
      const batchItems = batchKeys.map((k) => ({ key: k, value: master[k] }));
      console.log(`  → batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batchItems.length} keys`);
      try {
        const translated = await translateBatch(client, target, batchItems);
        for (const [k, v] of Object.entries(translated)) {
          merged[k] = v;
        }
      } catch (err) {
        console.error(`    ✗ batch failed: ${(err as Error).message}`);
      }
    }

    // 元の辞書とマージ。translated 側を優先（forceKeys のため）。
    const updated: Dict = { ...targetDict };
    for (const [k, v] of Object.entries(merged)) {
      updated[k] = v;
    }

    writeDict(target, updated);
    console.log(`✔ ${target}.json updated with ${Object.keys(merged).length} new/updated keys.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
