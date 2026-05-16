/**
 * 5/15 メンバー発表 速報記事の Markdown 本文と Notion 投稿用ペイロードを生成する
 *
 *   $ npx tsx scripts/buildSquadArticle.ts                      # squad-input.json を読む
 *   $ npx tsx scripts/buildSquadArticle.ts scripts/squad-input.json
 *
 * 出力先:
 *   - scripts/output/squad-article.md   … 記事本文 Markdown（プレビュー用）
 *   - scripts/output/squad-article.json … notion-create-pages 用ペイロード
 *
 * Notion 投稿はこの JSON を `notion-create-pages` MCP に流すだけで完了。
 */

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

const DATA_SOURCE_ID = "28a344a2-e61a-4a74-a6bb-f951e1aa23ca";
const SLUG = "japan-squad-final-26-may-15-2026";

function loadInput(inputPath: string): SquadInput {
  const raw = fs.readFileSync(inputPath, "utf-8");
  return JSON.parse(raw) as SquadInput;
}

function renderPositionTable(pos: SquadPosition, players: SquadInputPlayer[]): string {
  const filled = players.filter((p) => p.name.trim() !== "");
  const lines: string[] = [];
  lines.push(`### ${pos} — ${filled.length}名`);
  lines.push("");
  lines.push("| 選手 | 所属クラブ | ポイント |");
  lines.push("|---|---|---|");
  for (const p of filled) {
    const comment = (p.comment || "").replace(/\|/g, "／");
    lines.push(`| ${p.name} | ${p.club}（${p.league}） | ${comment} |`);
  }
  return lines.join("\n");
}

function renderSurprises(
  label: string,
  items: { name: string; club: string; reason: string }[] | undefined,
): string {
  const filled = (items ?? []).filter((s) => s.name.trim() !== "");
  if (filled.length === 0) return "";
  const lines: string[] = [];
  lines.push(`## ${label}`);
  lines.push("");
  for (const [i, s] of filled.entries()) {
    lines.push(`### ${i + 1}. ${s.name}（${s.club}）`);
    lines.push("");
    lines.push(s.reason);
    lines.push("");
  }
  return lines.join("\n");
}

function renderCoachQuotes(quotes: SquadInput["coachQuotes"]): string {
  const filled = (quotes ?? []).filter((q) => q.quote.trim() !== "");
  if (filled.length === 0) return "";
  const lines: string[] = [];
  lines.push("## :tv: 森保監督 会見コメント抜粋");
  lines.push("");
  for (const q of filled) {
    lines.push(`### ${q.topic}`);
    lines.push("");
    lines.push(`> ${q.quote}`);
    lines.push("");
  }
  return lines.join("\n");
}

function buildContent(input: SquadInput): string {
  const { announcement, squad } = input;
  const total =
    squad.GK.filter((p) => p.name).length +
    squad.DF.filter((p) => p.name).length +
    squad.MF.filter((p) => p.name).length +
    squad.FW.filter((p) => p.name).length;

  return `> **${announcement.date.replace(/-/g, "年").replace(/年(\d{2})年(\d{2})/, "年$1月$2日")}（${announcement.weekday}）${announcement.time}**、JFA（日本サッカー協会）はW杯2026最終登録メンバー${total}名を正式発表した。森保一監督がカタール大会以来3年半をかけて作り上げた**SAMURAI BLUE**の最終形が、ついにベールを脱いだ。本記事は速報として、ポジション別の${total}名一覧と、サプライズ選出・落選を整理する。

---

## :calendar: 発表会見の概要

| 項目 | 内容 |
|---|---|
| 日時 | ${announcement.date}（${announcement.weekday}）${announcement.time}〜（JST） |
| 場所 | ${announcement.venue} |
| 発表者 | ${announcement.presenter} |
| 発表内容 | W杯2026 最終登録メンバー **${total}名** |
| 中継 | JFA公式YouTube・NHK・民放各局 |

---

## :soccer: 公式登録メンバー${total}名

${renderPositionTable("GK", squad.GK)}

${renderPositionTable("DF", squad.DF)}

${renderPositionTable("MF", squad.MF)}

${renderPositionTable("FW", squad.FW)}

:info: **内訳：GK ${squad.GK.filter((p) => p.name).length} ＋ DF ${squad.DF.filter((p) => p.name).length} ＋ MF ${squad.MF.filter((p) => p.name).length} ＋ FW ${squad.FW.filter((p) => p.name).length} ＝ 合計 ${total}名**（FIFA規定）

---

${renderSurprises(":fire: サプライズ選出", input.surprises?.selectedIn)}
${renderSurprises(":warning: サプライズ落選", input.surprises?.selectedOut)}
---

## :star: 本紙予想との一致率

本紙が4月25日時点で公開した予想26名（[詳細](/news/japan-squad-announcement-may-15-2026)）との比較は、本記事公開後の検証記事で公開予定。

---

${renderCoachQuotes(input.coachQuotes)}
---

## :calendar: 発表後のスケジュール

| 日付 | 予定 |
|---|---|
| 2026年5月下旬 | 国内合宿（千葉・高円宮記念JFA夢フィールド） |
| **5月31日（日）19:20** | **キリンチャレンジカップ 日本 vs アイスランド（国立競技場）** |
| 6月上旬 | 北米出発、現地合宿（ダラス／ヒューストン） |
| **6月15日（月）05:00 JST** | **W杯本大会初戦：日本 vs オランダ（AT&Tスタジアム・ダラス）** |
| 6月21日（日）13:00 JST | 第2節：日本 vs チュニジア（BBVA・モンテレイ） |
| 6月26日（金）08:00 JST | 第3節：日本 vs スウェーデン（AT&Tスタジアム・ダラス） |

---

## :heart: 編集後記

森保ジャパンが描いた最終形がついに固まった。グループF（オランダ・チュニジア・スウェーデン）を勝ち抜き、悲願のベスト8突破へ。サムライブルーへの期待は、いま頂点に達している。

---

:info: **関連リンク**

- [日本代表 W杯2026 メンバー26人（一覧ページ）](/japan-squad)
- [本紙の予想26名記事（2026-04-25）](/news/japan-squad-announcement-may-15-2026)
- [日本代表 試合日程・キックオフ時間（日本時間）](/matches/team/jpn)
- [グループF 対戦相手：オランダ／チュニジア／スウェーデン](/groups)
- [日本代表 チーム情報](/teams/jpn)
`;
}

function buildNotionPayload(input: SquadInput, content: string) {
  return {
    parent: { type: "data_source_id", data_source_id: DATA_SOURCE_ID },
    pages: [
      {
        properties: {
          タイトル:
            "【速報】日本代表 W杯2026 メンバー26名 発表｜森保ジャパン最終登録メンバー一覧（GK/DF/MF/FW別・所属クラブ・ポイント）",
          スラッグ: SLUG,
          ステータス: "公開",
          カテゴリ: "ニュース",
          タグ: '["日本代表","W杯"]',
          関連チーム: '["JPN"]',
          "date:公開日:start": input.announcement.date,
          "date:公開日:is_datetime": 0,
          出典名: "JFA公式 / Sports Nippon / スポーツ報知 / NHK / 日刊スポーツ",
          出典URL: "https://www.jfa.jp/samuraiblue/",
          ...(input.eyecatchUrl ? { アイキャッチURL: input.eyecatchUrl } : {}),
          概要: (() => {
            const c = {
              GK: input.squad.GK.filter((p) => p.name).length,
              DF: input.squad.DF.filter((p) => p.name).length,
              MF: input.squad.MF.filter((p) => p.name).length,
              FW: input.squad.FW.filter((p) => p.name).length,
            };
            const total = c.GK + c.DF + c.MF + c.FW;
            return `${input.announcement.date}（${input.announcement.weekday}）${input.announcement.time}、日本サッカー協会がW杯2026最終登録メンバー${total}名を正式発表。森保ジャパンが選んだGK${c.GK}・DF${c.DF}・MF${c.MF}・FW${c.FW}名の全顔ぶれと、サプライズ選出・落選を速報。`;
          })(),
        },
        content,
      },
    ],
  };
}

function main() {
  const inputArg = process.argv[2] ?? path.join(ROOT, "scripts/squad-input.json");
  const inputPath = path.resolve(inputArg);

  if (!fs.existsSync(inputPath)) {
    console.error(`[error] input file not found: ${inputPath}`);
    console.error(`    cp scripts/squad-input.example.json scripts/squad-input.json してから26名を埋めてください`);
    process.exit(1);
  }

  const input = loadInput(inputPath);
  const errors = validateSquadInput(input);
  if (errors.length > 0) {
    console.error("[error] 入力データに問題があります:");
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  const content = buildContent(input);
  const payload = buildNotionPayload(input, content);

  const outDir = path.join(ROOT, "scripts/output");
  fs.mkdirSync(outDir, { recursive: true });

  const mdPath = path.join(outDir, "squad-article.md");
  const jsonPath = path.join(outDir, "squad-article.json");
  fs.writeFileSync(mdPath, content, "utf-8");
  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), "utf-8");

  console.log("[ok] 生成完了:");
  console.log(`  - ${path.relative(ROOT, mdPath)}  （プレビュー用）`);
  console.log(`  - ${path.relative(ROOT, jsonPath)}  （notion-create-pages に流す）`);
  console.log("");
  console.log("次のステップ: Claudeに「scripts/output/squad-article.json を notion-create-pages で公開して」と依頼");
}

main();
