/**
 * 5/15 メンバー発表後、scripts/squad-input.json から
 * src/data/japanSquad.ts を「公式26名」に書き換え、ビルド確認後 commit&push する。
 *
 *   $ npx tsx scripts/updateOfficialSquad.ts                # build まで実行（pushはしない）
 *   $ npx tsx scripts/updateOfficialSquad.ts --push         # commit&push まで実行
 *   $ npx tsx scripts/updateOfficialSquad.ts --dry-run      # ファイル書き換えのみで build/git は実行しない
 *
 * 動作:
 *   1. squad-input.json を読み込み・バリデーション
 *   2. 既存 japanSquad.ts から playerSquad の name → { columnSlug, badge } マップを抽出して継承
 *   3. SQUAD_PHASE = "official"、playerSquad を公式26名で再生成、predictedExclusions は previousPrediction にリネーム退避
 *   4. npm run build で型チェック
 *   5. --push 指定時のみ git add / commit / push
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  validateSquadInput,
  type SquadInput,
  type SquadInputPlayer,
  type SquadPosition,
} from "./squad-input.schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const JAPAN_SQUAD_PATH = path.join(ROOT, "src/data/japanSquad.ts");

interface ExistingPlayerMeta {
  columnSlug?: string;
  badge?: string;
}

function extractExistingMeta(source: string): Map<string, ExistingPlayerMeta> {
  const meta = new Map<string, ExistingPlayerMeta>();
  const blockRegex = /\{\s*name:\s*"([^"]+)"[\s\S]*?\}/g;
  for (const m of source.matchAll(blockRegex)) {
    const block = m[0];
    const name = m[1];
    const columnSlug = block.match(/columnSlug:\s*"([^"]+)"/)?.[1];
    const badge = block.match(/badge:\s*"([^"]+)"/)?.[1];
    if (columnSlug || badge) {
      meta.set(name, { columnSlug, badge });
    }
  }
  return meta;
}

function escapeTsString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function renderPlayerLiteral(
  pos: SquadPosition,
  p: SquadInputPlayer,
  existing: ExistingPlayerMeta | undefined,
): string {
  const lines: string[] = [];
  lines.push("  {");
  lines.push(`    name: "${escapeTsString(p.name)}",`);
  lines.push(`    position: "${pos}",`);
  lines.push(`    club: "${escapeTsString(p.club)}",`);
  lines.push(`    league: "${escapeTsString(p.league)}",`);
  if (existing?.columnSlug) {
    lines.push(`    columnSlug: "${escapeTsString(existing.columnSlug)}",`);
  }
  if (existing?.badge) {
    lines.push(`    badge: "${escapeTsString(existing.badge)}",`);
  }
  lines.push(`    comment: "${escapeTsString(p.comment)}",`);
  lines.push("  },");
  return lines.join("\n");
}

function renderSection(
  pos: SquadPosition,
  players: SquadInputPlayer[],
  meta: Map<string, ExistingPlayerMeta>,
): string {
  const filled = players.filter((p) => p.name.trim() !== "");
  const lines: string[] = [];
  lines.push(`  // ─── ${pos} ${filled.length} ───`);
  for (const p of filled) {
    lines.push(renderPlayerLiteral(pos, p, meta.get(p.name)));
  }
  return lines.join("\n");
}

function buildNewSource(input: SquadInput, oldSource: string): string {
  const meta = extractExistingMeta(oldSource);
  const today = new Date().toISOString().slice(0, 10);

  const sections = (["GK", "DF", "MF", "FW"] as SquadPosition[])
    .map((pos) => renderSection(pos, input.squad[pos], meta))
    .join("\n\n");

  return `// ========================================
// 日本代表 W杯2026 メンバー（26名）
// ========================================
// メンバー発表会見：2026年5月15日（金）14:00 JFAハウス
// ${today} に公式発表を反映（scripts/updateOfficialSquad.ts による自動更新）

export type SquadPosition = "GK" | "DF" | "MF" | "FW";

export interface SquadPlayer {
  name: string;
  position: SquadPosition;
  club: string;
  league: string;
  /** 既存「選手の素顔」コラム slug（あれば内部リンク表示） */
  columnSlug?: string;
  /** 注目バッジ：「衝撃の予想復帰」「電撃抜擢」など */
  badge?: string;
  /** 簡易プロフィールコメント */
  comment: string;
}

/** メンバー発表会見：2026年5月15日（金）14:00 JST */
export const SQUAD_ANNOUNCEMENT_AT = "2026-05-15T14:00:00+09:00";

/** 現フェーズ。発表後に "official" に切り替え。 */
export const SQUAD_PHASE: "prediction" | "official" = "official";

/**
 * 公式26名（${today} JFA発表反映）
 */
export const playerSquad: SquadPlayer[] = [
${sections}
];

/**
 * 公式発表後は previousPrediction として保持（記録／SEO継続）
 * 直前の本紙予想26名との差分は記事側で扱う
 */
export const previousPrediction: { name: string; club: string; reason: string }[] = [];

/**
 * 後方互換用エイリアス（既存コードが参照しているため残す）
 */
export const predictedExclusions = previousPrediction;

// ========================================
// ユーティリティ
// ========================================

export function squadByPosition(pos: SquadPosition): SquadPlayer[] {
  return playerSquad.filter((p) => p.position === pos);
}

export function squadCounts(): Record<SquadPosition, number> {
  return {
    GK: squadByPosition("GK").length,
    DF: squadByPosition("DF").length,
    MF: squadByPosition("MF").length,
    FW: squadByPosition("FW").length,
  };
}

export function columnsCoveredCount(): number {
  return playerSquad.filter((p) => p.columnSlug).length;
}
`;
}

function run(cmd: string, opts: { cwd?: string } = {}): void {
  console.log(`$ ${cmd}`);
  execSync(cmd, { cwd: opts.cwd ?? ROOT, stdio: "inherit" });
}

function main() {
  const args = process.argv.slice(2);
  const inputPath = path.resolve(args.find((a) => !a.startsWith("--")) ?? path.join(ROOT, "scripts/squad-input.json"));
  const dryRun = args.includes("--dry-run");
  const doPush = args.includes("--push");

  if (!fs.existsSync(inputPath)) {
    console.error(`[error] input file not found: ${inputPath}`);
    process.exit(1);
  }

  const input = JSON.parse(fs.readFileSync(inputPath, "utf-8")) as SquadInput;
  const errors = validateSquadInput(input);
  if (errors.length > 0) {
    console.error("[error] 入力データに問題があります:");
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  const oldSource = fs.readFileSync(JAPAN_SQUAD_PATH, "utf-8");
  const newSource = buildNewSource(input, oldSource);

  fs.writeFileSync(JAPAN_SQUAD_PATH, newSource, "utf-8");
  console.log(`[ok] ${path.relative(ROOT, JAPAN_SQUAD_PATH)} を公式26名で更新しました`);

  if (dryRun) {
    console.log("[dry-run] build/git はスキップしました");
    return;
  }

  console.log("\n[step] npm run build で型チェック...");
  run("npm run build");

  if (!doPush) {
    console.log("\n[done] build 成功。git push する場合は再度 --push を指定して実行してください。");
    return;
  }

  console.log("\n[step] git add / commit / push...");
  run(`git add ${path.relative(ROOT, JAPAN_SQUAD_PATH)}`);
  run(`git commit -m "feat(japan-squad): 公式メンバー26名に更新（2026-05-15発表）"`);
  run("git push origin main");
  console.log("\n[done] 公式26名を本番デプロイにpush完了");
}

main();
