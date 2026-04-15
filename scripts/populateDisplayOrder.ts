// ========================================
// 一時スクリプト: Notion Teams DB の「表示順」を埋める
// 現在の src/data/teams.ts の並び順（グループ内 index）を各ページに設定
// 1 回だけ実行すればよい
// ========================================

import { createClient, getEnv, queryDataSource, getProp } from "./lib/notionClient";
import { allTeams } from "../src/data/teams";

async function main() {
  const client = createClient();
  const dsId = getEnv("NOTION_TEAMS_DATABASE_ID");

  console.log("📥 Notion から全チームを取得中...");
  const pages = await queryDataSource(dsId);
  const codeToPageId = new Map<string, string>();
  for (const p of pages) {
    const code = getProp(p, "国コード", "rich_text") as string;
    codeToPageId.set(code, p.id);
  }
  console.log(`  取得: ${codeToPageId.size} ページ`);

  // グループ内 index を計算
  const groupCounter = new Map<string, number>();
  console.log("\n📝 表示順を更新中...");
  for (const team of allTeams) {
    const idx = groupCounter.get(team.group) ?? 0;
    groupCounter.set(team.group, idx + 1);
    const pageId = codeToPageId.get(team.code);
    if (!pageId) {
      console.warn(`  ⚠ ${team.code}: Notion にページなし`);
      continue;
    }
    try {
      await client.pages.update({
        page_id: pageId,
        properties: {
          "表示順": { number: idx },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      });
      console.log(`  ✓ ${team.code} (${team.group}) → 表示順=${idx}`);
    } catch (e) {
      console.error(`  ✗ ${team.code} — ${(e as Error).message}`);
    }
  }
  console.log("\n✅ 完了");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
