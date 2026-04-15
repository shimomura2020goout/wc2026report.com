// ========================================
// Notion 同期スクリプト
// Notion の Teams / TeamDetails / Coaches DB → src/data/teams.ts & teamDetails.ts
//
// 使い方:
//   1. .env.local に NOTION_API_KEY と 3 つの DB ID を設定（seedTeams.ts と同じ）
//   2. Notion で編集
//   3. `npm run sync:teams` を実行
//   4. 差分確認して commit & deploy
//
// 出力:
//   - src/data/teams.ts を上書き
//   - src/data/teamDetails.ts を上書き（末尾の getTeamDetail/hasTeamDetail/playerColumnSlugs は保持）
// ========================================

import fs from "node:fs";
import path from "node:path";
import { queryDataSource, getProp, getEnv } from "./lib/notionClient";

// --- 型定義 ---
interface TeamRow {
  name: string;
  code: string;
  group: string;
  fifaRanking: number;
  fifaPoints: number;
  fifaPrevPoints: number;
  region: string;
  regionLabel: string;
  wcAppearances: number;
  bestResult: string;
  flag: string;
  isPlaceholder?: boolean;
  displayOrder: number; // グループ内表示順
}

interface DetailRow {
  code: string;
  coach: string;
  coachNationality: string;
  nickname: string;
  kitColors: string;
  starPlayers: string[];
  description: string;
  strengths: string[];
  weaknesses: string[];
  worldCupHistory: string;
  qualificationPath: string;
}

// --- Notion から取得 ---
async function fetchTeams(): Promise<TeamRow[]> {
  const dsId = getEnv("NOTION_TEAMS_DATABASE_ID");
  const pages = await queryDataSource(dsId, {
    filter: {
      property: "公開フラグ",
      select: { equals: "公開" },
    },
  });

  return pages.map((page) => ({
    name: getProp(page, "国名", "title") as string,
    code: getProp(page, "国コード", "rich_text") as string,
    group: getProp(page, "グループ", "select") as string,
    fifaRanking: getProp(page, "FIFAランキング", "number") as number,
    fifaPoints: getProp(page, "FIFAポイント", "number") as number,
    fifaPrevPoints: getProp(page, "FIFA前回ポイント", "number") as number,
    region: getProp(page, "連盟", "select") as string,
    regionLabel: getProp(page, "連盟ラベル", "rich_text") as string,
    wcAppearances: getProp(page, "W杯出場回数", "number") as number,
    bestResult: getProp(page, "最高成績", "rich_text") as string,
    flag: getProp(page, "国旗", "rich_text") as string,
    isPlaceholder: !(getProp(page, "出場確定", "checkbox") as boolean),
    displayOrder: (getProp(page, "表示順", "number") as number) ?? 999,
  }));
}

async function fetchDetails(): Promise<Map<string, Omit<DetailRow, "coach" | "coachNationality">>> {
  const dsId = getEnv("NOTION_TEAM_DETAILS_DATABASE_ID");
  const pages = await queryDataSource(dsId);
  const map = new Map();

  for (const page of pages) {
    const code = getProp(page, "国コード", "rich_text") as string;
    if (!code) continue;
    const players = [
      getProp(page, "注目選手1", "rich_text") as string,
      getProp(page, "注目選手2", "rich_text") as string,
      getProp(page, "注目選手3", "rich_text") as string,
    ].filter(Boolean);

    map.set(code, {
      code,
      nickname: getProp(page, "愛称", "rich_text") as string,
      kitColors: getProp(page, "ユニフォーム色", "rich_text") as string,
      starPlayers: players,
      description: getProp(page, "チーム紹介", "rich_text") as string,
      strengths: splitLines(getProp(page, "強み", "rich_text") as string),
      weaknesses: splitLines(getProp(page, "弱み", "rich_text") as string),
      worldCupHistory: getProp(page, "W杯の歴史", "rich_text") as string,
      qualificationPath: getProp(page, "予選突破経緯", "rich_text") as string,
    });
  }
  return map;
}

async function fetchCurrentCoaches(): Promise<Map<string, { coach: string; coachNationality: string }>> {
  const dsId = getEnv("NOTION_COACHES_DATABASE_ID");
  const pages = await queryDataSource(dsId);
  const map = new Map<string, { coach: string; coachNationality: string; appointedAt: string | null }>();

  for (const page of pages) {
    const code = getProp(page, "国コード", "rich_text") as string;
    const retiredAt = getProp(page, "退任日", "date") as string | null;
    if (!code || retiredAt) continue; // 退任日が入っていたらスキップ（現職のみ）

    const appointedAt = getProp(page, "就任日", "date") as string | null;
    const existing = map.get(code);
    // 同一チームに複数現職がある場合、就任日が新しい方を採用
    if (existing && existing.appointedAt && appointedAt && appointedAt < existing.appointedAt) continue;

    map.set(code, {
      coach: getProp(page, "氏名", "title") as string,
      coachNationality: getProp(page, "国籍", "rich_text") as string,
      appointedAt,
    });
  }

  const result = new Map<string, { coach: string; coachNationality: string }>();
  for (const [code, v] of map.entries()) {
    result.set(code, { coach: v.coach, coachNationality: v.coachNationality });
  }
  return result;
}

function splitLines(s: string): string[] {
  return s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

// --- コード生成 ---
const GROUP_ORDER = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

function sortTeams(teams: TeamRow[]): TeamRow[] {
  return [...teams].sort((a, b) => {
    const ga = GROUP_ORDER.indexOf(a.group);
    const gb = GROUP_ORDER.indexOf(b.group);
    if (ga !== gb) return ga - gb;
    // グループ内は Notion 側の「表示順」プロパティを使用
    return a.displayOrder - b.displayOrder;
  });
}

function escapeString(s: string): string {
  // バックスラッシュ → ダブルクォート の順でエスケープ
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function generateTeamsFile(teams: TeamRow[]): string {
  const sorted = sortTeams(teams);
  const today = new Date().toISOString().slice(0, 10);
  const lines: string[] = [];
  lines.push(`export interface Team {`);
  lines.push(`  name: string;`);
  lines.push(`  code: string;`);
  lines.push(`  group: string;`);
  lines.push(`  fifaRanking: number;`);
  lines.push(`  fifaPoints: number;`);
  lines.push(`  fifaPrevPoints: number;`);
  lines.push(`  region: string;`);
  lines.push(`  regionLabel: string;`);
  lines.push(`  wcAppearances: number;`);
  lines.push(`  bestResult: string;`);
  lines.push(`  flag: string;`);
  lines.push(`  isPlaceholder?: boolean;`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`// ========================================`);
  lines.push(`// 全${sorted.length}チーム — Notion から自動生成（${today}）`);
  lines.push(`// このファイルは scripts/syncTeams.ts で自動生成されます。直接編集しないでください。`);
  lines.push(`// 編集は Notion の Teams DB で行い、\`npm run sync:teams\` を実行してください。`);
  lines.push(`// ========================================`);
  lines.push(``);
  lines.push(`export const allTeams: Team[] = [`);

  let currentGroup = "";
  for (const t of sorted) {
    if (t.group !== currentGroup) {
      if (currentGroup !== "") lines.push("");
      lines.push(`  // --- グループ ${t.group} ---`);
      currentGroup = t.group;
    }
    const placeholder = t.isPlaceholder ? `, isPlaceholder: true` : "";
    lines.push(
      `  { name: "${escapeString(t.name)}", code: "${t.code}", group: "${t.group}", ` +
      `fifaRanking: ${t.fifaRanking}, fifaPoints: ${t.fifaPoints}, fifaPrevPoints: ${t.fifaPrevPoints}, ` +
      `region: "${t.region}", regionLabel: "${escapeString(t.regionLabel)}", ` +
      `wcAppearances: ${t.wcAppearances}, bestResult: "${escapeString(t.bestResult)}", ` +
      `flag: "${t.flag}"${placeholder} },`
    );
  }
  lines.push(`];`);
  lines.push(``);
  lines.push(`// ========================================`);
  lines.push(`// ユーティリティ関数`);
  lines.push(`// ========================================`);
  lines.push(``);
  lines.push(`export function getTeamsByGroup(group: string): Team[] {`);
  lines.push(`  return allTeams.filter((t) => t.group === group);`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export function getTeamsByRegion(region: string): Team[] {`);
  lines.push(`  return allTeams.filter((t) => t.region === region);`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export function getTeamByName(name: string): Team | undefined {`);
  lines.push(`  return allTeams.find((t) => t.name === name);`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export function getConfirmedTeams(): Team[] {`);
  lines.push(`  return allTeams.filter((t) => !t.isPlaceholder);`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export const regions = [`);
  lines.push(`  { id: "UEFA", label: "ヨーロッパ (UEFA)" },`);
  lines.push(`  { id: "CONMEBOL", label: "南米 (CONMEBOL)" },`);
  lines.push(`  { id: "CONCACAF", label: "北中米カリブ海 (CONCACAF)" },`);
  lines.push(`  { id: "CAF", label: "アフリカ (CAF)" },`);
  lines.push(`  { id: "AFC", label: "アジア (AFC)" },`);
  lines.push(`  { id: "OFC", label: "オセアニア (OFC)" },`);
  lines.push(`];`);
  lines.push(``);

  return lines.join("\n");
}

function generateDetailsFile(
  teams: TeamRow[],
  details: Map<string, Omit<DetailRow, "coach" | "coachNationality">>,
  coaches: Map<string, { coach: string; coachNationality: string }>,
  playerColumnSlugsSource: string
): string {
  const today = new Date().toISOString().slice(0, 10);
  const sorted = sortTeams(teams);
  const lines: string[] = [];
  lines.push(`// ========================================`);
  lines.push(`// チーム詳細データ — Notion から自動生成（${today}）`);
  lines.push(`// このファイルは scripts/syncTeams.ts で自動生成されます。直接編集しないでください。`);
  lines.push(`// 監督情報の編集は Notion の Coaches DB、その他は TeamDetails DB で。`);
  lines.push(`// 生成後に \`npm run sync:teams\` を実行してください。`);
  lines.push(`// ========================================`);
  lines.push(``);
  lines.push(`export interface TeamDetail {`);
  lines.push(`  code: string;`);
  lines.push(`  coach: string;`);
  lines.push(`  coachNationality: string;`);
  lines.push(`  nickname: string;`);
  lines.push(`  kitColors: string;`);
  lines.push(`  starPlayers: string[];`);
  lines.push(`  description: string;`);
  lines.push(`  strengths: string[];`);
  lines.push(`  weaknesses: string[];`);
  lines.push(`  worldCupHistory: string;`);
  lines.push(`  qualificationPath: string;`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export const teamDetails: Record<string, TeamDetail> = {`);

  let currentGroup = "";
  for (const t of sorted) {
    const d = details.get(t.code);
    const c = coaches.get(t.code);
    if (!d || !c) {
      console.warn(`⚠ ${t.code}: 詳細/監督データが Notion にありません、スキップ`);
      continue;
    }
    if (t.group !== currentGroup) {
      if (currentGroup !== "") lines.push("");
      lines.push(`  // --- グループ ${t.group} ---`);
      currentGroup = t.group;
    }
    lines.push(`  ${t.code}: {`);
    lines.push(`    code: "${t.code}",`);
    lines.push(`    coach: "${escapeString(c.coach)}",`);
    lines.push(`    coachNationality: "${escapeString(c.coachNationality)}",`);
    lines.push(`    nickname: "${escapeString(d.nickname)}",`);
    lines.push(`    kitColors: "${escapeString(d.kitColors)}",`);
    lines.push(`    starPlayers: [${d.starPlayers.map((p) => `"${escapeString(p)}"`).join(", ")}],`);
    lines.push(`    description: "${escapeString(d.description)}",`);
    lines.push(`    strengths: [${d.strengths.map((s) => `"${escapeString(s)}"`).join(", ")}],`);
    lines.push(`    weaknesses: [${d.weaknesses.map((s) => `"${escapeString(s)}"`).join(", ")}],`);
    lines.push(`    worldCupHistory: "${escapeString(d.worldCupHistory)}",`);
    lines.push(`    qualificationPath: "${escapeString(d.qualificationPath)}",`);
    lines.push(`  },`);
  }
  lines.push(`};`);
  lines.push(``);
  lines.push(`// ========================================`);
  lines.push(`// ユーティリティ`);
  lines.push(`// ========================================`);
  lines.push(``);
  lines.push(`export function getTeamDetail(code: string): TeamDetail | undefined {`);
  lines.push(`  return teamDetails[code];`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export function hasTeamDetail(code: string): boolean {`);
  lines.push(`  return code in teamDetails;`);
  lines.push(`}`);
  lines.push(``);
  lines.push(playerColumnSlugsSource);
  lines.push(``);

  return lines.join("\n");
}

// 既存ファイルから playerColumnSlugs 部分だけを抜き出して保持
function extractPlayerColumnSlugs(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    return getDefaultPlayerColumnSlugs();
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const marker = "// 選手コラム記";
  const idx = content.indexOf(marker);
  if (idx === -1) return getDefaultPlayerColumnSlugs();
  return content.slice(idx).trimEnd();
}

function getDefaultPlayerColumnSlugs(): string {
  return `// ========================================
// 選手コラム記事マッピング
// ========================================
// 選手名 → コラム記事スラッグ
// コラム記事が公開されるたびにここに追加する

export const playerColumnSlugs: Record<string, string> = {};`;
}

// --- main ---
async function main() {
  console.log("📥 Notion からデータを取得中...\n");
  const [teams, details, coaches] = await Promise.all([
    fetchTeams(),
    fetchDetails(),
    fetchCurrentCoaches(),
  ]);

  console.log(`  Teams:       ${teams.length}`);
  console.log(`  TeamDetails: ${details.size}`);
  console.log(`  Coaches:     ${coaches.size}`);
  console.log();

  if (teams.length !== 48) {
    console.warn(`⚠ 出場チームが 48 ではなく ${teams.length} 件です。Notion を確認してください。\n`);
  }

  const root = path.resolve(__dirname, "..");
  const teamsPath = path.join(root, "src/data/teams.ts");
  const detailsPath = path.join(root, "src/data/teamDetails.ts");

  const playerSlugsSource = extractPlayerColumnSlugs(detailsPath);

  console.log(`📝 ${teamsPath} を生成中...`);
  fs.writeFileSync(teamsPath, generateTeamsFile(teams), "utf-8");

  console.log(`📝 ${detailsPath} を生成中...`);
  fs.writeFileSync(detailsPath, generateDetailsFile(teams, details, coaches, playerSlugsSource), "utf-8");

  console.log(`\n✅ 同期完了。\`git diff\` で変更を確認してください。\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
