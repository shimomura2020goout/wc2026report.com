# Notion 同期スクリプト

出場 48 カ国・監督・チーム詳細の情報を Notion で一元管理し、`src/data/teams.ts` と `src/data/teamDetails.ts` を自動生成する仕組みです。

## アーキテクチャ概要

```
  [Notion マスタデータ]                [リポジトリ]
┌─────────────────────┐              ┌────────────────────────┐
│ Teams DB            │              │ src/data/teams.ts       │
│ TeamDetails DB      │ ──sync:teams→│ src/data/teamDetails.ts │
│ Coaches DB          │              │ (自動生成、直接編集禁止) │
└─────────────────────┘              └────────────────────────┘
         ↑ 編集                               ↓ import
         └──────── 人間が編集                Next.js ページ（変更不要）
```

- **ソース・オブ・トゥルース**: Notion
- サイトのビルド/ランタイムでは**いっさい Notion を叩かない**（TS ファイルを読むだけ）
- Notion 編集 →「sync:teams を実行 → git diff 確認 → commit → deploy」のフロー

## Notion DB 構成

マスタページ: <https://www.notion.so/34327709231f816c9209d467cb448d8f>

| DB | ID | 用途 |
|---|---|---|
| Teams | `cd7b0a3ffffc46babac1acbcef1352a9` | 48 カ国の基本情報 |
| TeamDetails | `9b83b855018f4d50af8132d3ae0fbf27` | 愛称・紹介文・注目選手など |
| Coaches | `aedabbe6488545c886a1f2735a736e20` | 監督と就任/退任日（交代履歴） |

## 初回セットアップ（1 回だけ）

### 1. Notion Integration を各 DB に接続

以下を**それぞれ**開き、右上「…」→「コネクト」→ 既存 Integration を選択して接続：

- [Teams](https://www.notion.so/cd7b0a3ffffc46babac1acbcef1352a9)
- [TeamDetails](https://www.notion.so/9b83b855018f4d50af8132d3ae0fbf27)
- [Coaches](https://www.notion.so/aedabbe6488545c886a1f2735a736e20)

### 2. `.env.local` に DB ID を追加

`.env.local.example` を参考に以下 3 行を追加：

```
NOTION_TEAMS_DATABASE_ID=cd7b0a3ffffc46babac1acbcef1352a9
NOTION_TEAM_DETAILS_DATABASE_ID=9b83b855018f4d50af8132d3ae0fbf27
NOTION_COACHES_DATABASE_ID=aedabbe6488545c886a1f2735a736e20
```

### 3. 既存 TS データを Notion に投入

```
npm run seed:teams
```

- `src/data/teams.ts` と `src/data/teamDetails.ts` を読んで Notion の 3 DB へ投入
- 48 チーム + 48 詳細 + 48 監督エントリが作成される
- ⚠️ **重複実行厳禁**: 既に投入済みの Notion に再実行すると重複レコードが作られます。初回のみ。

### 4. 動作確認

```
npm run sync:teams
git diff src/data
```

初回は差分がほぼ出ないはず（Notion から戻したデータ = 元のデータ）。差分が出ていたら Notion 側のデータ不整合を確認してください。

## 運用フロー

### パターン A: 監督交代（頻繁）

1. Coaches DB を開き、旧監督エントリに「退任日」を入力
2. 「新規」ボタンで新監督エントリを作成（チームリレーション + 氏名 + 国籍 + 就任日）
3. `npm run sync:teams` を実行
4. `git diff` で `teamDetails.ts` の該当国の coach/coachNationality が変わっているか確認
5. commit & push

### パターン B: FIFA ランキング更新（月次）

1. Teams DB で各国の「FIFAランキング」「FIFAポイント」「FIFA前回ポイント」を更新
2. `npm run sync:teams`
3. commit & push

### パターン C: 出場国差し替え（例: 大陸間 PO で敗退/勝利）

1. Teams DB で敗退国の「公開フラグ」を「非公開」に
2. 勝利国のエントリを新規作成、または既存なら「公開」に
3. TeamDetails / Coaches も更新
4. `npm run sync:teams`
5. commit & push

### パターン D: 注目選手の入れ替え

1. TeamDetails DB で「注目選手1/2/3」を更新
2. sync → commit

## Notion 側の編集ルール

- **国コード** は FIFA 3 文字コード（JPN, BRA, USA）。**一意**かつ変更禁止（サイトの URL `/teams/[code]` に使用）
- **グループ** は A〜L のセレクト。事前定義された選択肢以外を追加しない
- **強み / 弱み** は改行区切りで複数入力（Notion 上では Shift+Enter で改行）
- **公開フラグ = 公開** のチームだけが `allTeams` に含まれる
- **Coaches の退任日** が入っていると現職扱いされず、サイトには反映されない
- 同一チームに退任日未入力の Coach が複数ある場合は、**就任日が新しい方**が採用される

## トラブルシューティング

### `seed:teams` が 404 で失敗する
→ Integration が DB に接続されていません。手順 1 を確認。

### `sync:teams` で特定チームが警告 `詳細/監督データが Notion にありません`
→ そのチームの TeamDetails または Coaches エントリが Notion にない。Notion に追加してから再実行。

### 48 チームのはずが 47 になっている
→ 誰かが「公開フラグ = 非公開」にしている可能性。Teams DB をフィルタなしで確認。

### 監督が古いまま反映される
→ 旧 Coach エントリに退任日が入っていない可能性。Coaches DB で退任日を埋めてから再 sync。

### Notion 上で大量の rich_text を入れたら切れた
→ Notion の仕様で 1 プロパティ 2000 文字制限。`lib/notionClient.ts` の `truncate2000()` で自動切り詰め。長文が必要なら複数プロパティに分ける設計変更が必要。

## 将来の拡張

- **Webhook による即時反映**: Notion の `database.updated` Webhook を受ける API route を作り、`revalidateTag()` で CDN キャッシュをパージ。今の設計でも再デプロイなしで反映できるが、commit は必要。
- **GitHub Actions 化**: 毎日 1 回 `sync:teams` を実行し、差分があれば PR を自動作成
- **Events/Matches も Notion 化**: 同じパターンで `src/data/events.ts` と `matches.ts` も Notion に移行可能
