// ========================================
// Notion 初回シードスクリプト
// 現在の TS データファイル → Notion の Teams / TeamDetails / Coaches DB
//
// 使い方:
//   1. .env.local に NOTION_API_KEY と以下の DB ID を設定
//      - NOTION_TEAMS_DATABASE_ID
//      - NOTION_TEAM_DETAILS_DATABASE_ID
//      - NOTION_COACHES_DATABASE_ID
//   2. Notion 側で各 DB に Integration を接続（共有→コネクトを追加）
//   3. `npm run seed:teams` を実行
//
// ⚠️ 既に Notion に投入済みのデータがある場合は重複して追加されます。
//    初回のみ実行してください。
// ========================================

import { createClient, getEnv, richText, title } from "./lib/notionClient";
import { allTeams } from "../src/data/teams";
import { teamDetails } from "../src/data/teamDetails";

async function main() {
  const client = createClient();
  const TEAMS_DB = getEnv("NOTION_TEAMS_DATABASE_ID");
  const TEAM_DETAILS_DB = getEnv("NOTION_TEAM_DETAILS_DATABASE_ID");
  const COACHES_DB = getEnv("NOTION_COACHES_DATABASE_ID");

  console.log(`\n🌱 Teams (${allTeams.length} チーム) をシード中...\n`);
  const codeToPageId = new Map<string, string>();

  for (const team of allTeams) {
    try {
      const res = await client.pages.create({
        parent: { database_id: TEAMS_DB },
        properties: {
          "国名": title(team.name),
          "国コード": richText(team.code),
          "グループ": { select: { name: team.group } },
          "FIFAランキング": { number: team.fifaRanking },
          "FIFAポイント": { number: team.fifaPoints },
          "FIFA前回ポイント": { number: team.fifaPrevPoints },
          "連盟": { select: { name: team.region } },
          "連盟ラベル": richText(team.regionLabel),
          "W杯出場回数": { number: team.wcAppearances },
          "最高成績": richText(team.bestResult),
          "国旗": richText(team.flag),
          "出場確定": { checkbox: !team.isPlaceholder },
          "公開フラグ": { select: { name: "公開" } },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      });
      codeToPageId.set(team.code, res.id);
      console.log(`  ✓ ${team.code}: ${team.name}`);
    } catch (e) {
      console.error(`  ✗ ${team.code}: ${team.name} — ${(e as Error).message}`);
    }
  }

  console.log(`\n📋 TeamDetails + Coaches をシード中...\n`);
  for (const [code, detail] of Object.entries(teamDetails)) {
    const teamPageId = codeToPageId.get(code);
    if (!teamPageId) {
      console.warn(`  ⚠ ${code}: Teams に対応エントリなし、スキップ`);
      continue;
    }

    // TeamDetails
    try {
      await client.pages.create({
        parent: { database_id: TEAM_DETAILS_DB },
        properties: {
          "タイトル": title(`${code} - ${detail.nickname}`),
          "国コード": richText(code),
          "チーム": { relation: [{ id: teamPageId }] },
          "愛称": richText(detail.nickname),
          "ユニフォーム色": richText(detail.kitColors),
          "注目選手1": richText(detail.starPlayers[0] || ""),
          "注目選手2": richText(detail.starPlayers[1] || ""),
          "注目選手3": richText(detail.starPlayers[2] || ""),
          "チーム紹介": richText(detail.description),
          "強み": richText(detail.strengths.join("\n")),
          "弱み": richText(detail.weaknesses.join("\n")),
          "W杯の歴史": richText(detail.worldCupHistory),
          "予選突破経緯": richText(detail.qualificationPath),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      });
      console.log(`  ✓ ${code} 詳細`);
    } catch (e) {
      console.error(`  ✗ ${code} 詳細 — ${(e as Error).message}`);
    }

    // Coach
    try {
      await client.pages.create({
        parent: { database_id: COACHES_DB },
        properties: {
          "氏名": title(detail.coach),
          "チーム": { relation: [{ id: teamPageId }] },
          "国コード": richText(code),
          "国籍": richText(detail.coachNationality),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      });
      console.log(`  ✓ ${code} 監督 (${detail.coach})`);
    } catch (e) {
      console.error(`  ✗ ${code} 監督 — ${(e as Error).message}`);
    }
  }

  console.log(`\n✅ 完了: ${codeToPageId.size} チーム分を投入しました。\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
