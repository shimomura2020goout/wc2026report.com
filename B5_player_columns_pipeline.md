# B-5 Task 1: 日本代表 未コラム16名の「選手の素顔」量産パイプライン

> **目的**: 5月15日のメンバー発表を見据え、本紙予想26名のうち**「選手の素顔」コラム未公開の16名**について、ポジション別深掘り記事を順次量産する。
> **ゴール**: 5月15日時点で `/japan-squad` インデックスから26人すべてのコラムへ内部リンクが張れる状態を作る（少なくとも主軸の優先5名は最優先で完了させる）。
> **リファレンス**: 既存「選手の素顔」#1〜#15（最新は #15 田中碧, 2026-04-29）

---

## このファイルの使い方

新しいセッションで以下の **継続プロンプト** を貼り付けて Claude に依頼してください。Claude は本MDのチェックリストを読み、次の対象選手を1名選び、template_player_column_structure に沿ってコラムを書き、Notionへ公開、`japanSquad.ts` を更新、commit/push まで完遂します。

### 📋 継続プロンプト（コピペ用）

```
B5_player_columns_pipeline.md を読んで、未着手リストの先頭1名（または明示的に指定された1名）の「選手の素顔」コラムをNotion CMSに公開してください。

手順:
1. ~/.claude/projects/.../memory/template_player_column_structure.md を参照して標準構成（リード+9セクション）に準拠
2. ~/.claude/projects/.../memory/feedback_column_player_photo.md の通り、Wikimedia Commons のフルサイズ画像URLを使用
3. notion-create-pages で公開（連番は既存最大番号+1、スラッグは player-story-{firstname-lastname} か {firstname}-{lastname}-japan-column-2026 形式）
4. wcup2026/src/data/japanSquad.ts の対象選手に columnSlug を追記
5. wcup2026/src/data/teamDetails.ts の playerColumnSlugs にもマッピング追記（必要なら starPlayers にも）
6. B5_player_columns_pipeline.md のチェックリストにチェックを入れる
7. commit + push（main直push可・"feat(columns): 【選手の素顔 #N】選手名" 形式のメッセージ）

完了後、次の未着手選手と進捗（X/16）を報告してください。複数連続実行する場合は1回の実行ごとに上記サイクルを完結させてください。
```

---

## 進捗トラッカー

**完了**: 0/16

### 優先A：主軸スターター候補（先行量産推奨5名）

検索ボリュームが大きく、欧州主要リーグで主軸を張る選手から着手。`/japan-squad` のSEO効果を最大化する。

- [ ] 守田英正（スポルティングCP・葡）— ポジション: MF、想定 #16
- [ ] 伊東純也（ランス・仏）— ポジション: MF（右WB）、想定 #17
- [ ] 板倉滉（ボルシアMG・独）— ポジション: DF、想定 #18
- [ ] 冨安健洋（アーセナル・英）— ポジション: DF、想定 #19
- [ ] 伊藤洋輝（バイエルン・ミュンヘン・独）— ポジション: DF、想定 #20

### 優先B：サプライズ枠（高SEO関心）

「衝撃の予想復帰」「電撃抜擢」のキーワードで検索される可能性が高く、5/15発表時にバズる可能性も。

- [ ] 長友佑都（FC東京）— ポジション: DF、想定 #21、**衝撃の予想復帰**（39歳W杯5度目）
- [ ] 鈴木淳之介（FCコペンハーゲン・デンマーク）— ポジション: DF、想定 #22、**電撃抜擢**（22歳）
- [ ] 大橋祐紀（ブラックバーン・英2部）— ポジション: MF、想定 #23、**電撃選出**

### 優先C：中堅・控え

- [ ] 菅原由勢（サウサンプトン・英）— ポジション: DF（右WB）、想定 #24
- [ ] 町田浩樹（ユニオンSG・ベルギー）— ポジション: DF、想定 #25
- [ ] 前田大然（セルティック・スコットランド）— ポジション: FW、想定 #26
- [ ] 小川航基（NECナイメヘン・蘭）— ポジション: FW、想定 #27
- [ ] 大迫敬介（サンフレッチェ広島）— ポジション: GK、想定 #28
- [ ] 藤田譲瑠チマ（フェイエノールト・蘭）— ポジション: MF、想定 #29

### 優先D：3番手・若手

- [ ] 早川友基（鹿島アントラーズ）— ポジション: GK、想定 #30
- [ ] 瀬古歩夢（グラスホッパー・スイス）— ポジション: DF、想定 #31

> 連番は実際の公開順で確定する（後から挿入しない）。本リストは目安。

---

## 1選手あたりの作業手順（再掲）

### 0. 事前確認
- 最新の連番を確認: 既存記事で最大の `【選手の素顔 #N】` を探す（Notion search で "選手の素顔" で確認、または `template_player_column_structure.md` の「現在の連番台帳」から推定）
- 顔写真URL候補を WebSearch で取得（Wikimedia Commons の commons URL 推奨。thumb URLは禁止）
- 直近のクラブでのスタッツを WebSearch（出場試合数・得点・直近試合）

### 1. 構成
[memory/template_player_column_structure.md](.) の「リード+9セクション」を**全セクション必須**で実装：
1. リード文（120〜160字）
2. `## :menu: 基本プロフィール` — 顔写真 `![選手名（所属）](URL)` ＋ 8項目テーブル
3. `## :arrow_right: 故郷を知る` — 200〜280字
4. `## :calendar: 年代別キャリア年表` — 10行前後のテーブル
5. `## :fire: 25/26シーズン、○○した「キャッチコピー」` — 4シーズン比較テーブル付き
6. `## :soccer: 代表での活躍 ― サブタイトル` — 180字前後
7. `## :star: ○○選手を一言で表すと ― 「キーワードA」と「キーワードB」の同居`
8. `## :heart: W杯2026で背負う期待 ― 日本のグループFを突破する鍵` — オランダ／スウェーデン／チュニジアへの3行テーブル
9. `## :tv: SNS・メディア発信` — Markdown形式リンク必須
10. `## :info: 乗り越えるべき課題は「○○」`

### 2. Notionプロパティ
| プロパティ | 値 |
|---|---|
| タイトル | `【選手の素顔 #N】選手名｜キャッチコピー` （`#` は半角＋数字、区切りは全角縦棒 `｜`） |
| スラッグ | `firstname-lastname-japan-column-2026` 形式（例: `morita-hidemasa-japan-column-2026`） |
| ステータス | `公開` |
| カテゴリ | `コラム` |
| タグ | `["W杯"]` |
| 公開日 | 公開当日の日付 |
| 関連チーム | `["JPN"]` |
| 出典名 | `Wikipedia / Transfermarkt / 各クラブ公式 / JFA公式` 等 |
| 出典URL | 主要ソースの代表URL |
| アイキャッチURL | Wikimedia Commons の横長ランドスケープ URL |

### 3. 公開（Notion MCP）
```
notion-create-pages
  parent: {type: "data_source_id", data_source_id: "28a344a2-e61a-4a74-a6bb-f951e1aa23ca"}
  pages: [{ properties: {...上記...}, content: "本文Markdown" }]
```

### 4. ローカルコード更新（必須）

[wcup2026/src/data/japanSquad.ts](src/data/japanSquad.ts) の対象選手エントリに `columnSlug` を追加：
```ts
{
  name: "守田英正",
  position: "MF",
  // ...
  columnSlug: "morita-hidemasa-japan-column-2026", // ← 追加
  comment: "...",
},
```

[wcup2026/src/data/teamDetails.ts](src/data/teamDetails.ts) の `playerColumnSlugs` にも追加：
```ts
"守田英正": "morita-hidemasa-japan-column-2026",
```

starPlayers に未登録なら追加（Notion `TeamDetails` の3スロット制限のため、4人目以降はコード直編集）。

### 5. commit & push
```
git add src/data/japanSquad.ts src/data/teamDetails.ts
git commit -m "feat(columns): 【選手の素顔 #N】選手名のコラム記事マッピング追加"
git push origin main
```
※ Vercel自動デプロイ。Notion記事はISR（5分）で本番反映。

### 6. 本MDのチェックリスト更新
該当選手の `[ ]` を `[x]` に変更し、進捗カウンタを更新（例：完了 5/16）。

---

## 注意点・既知のリスク

### Notion `create-pages` でのテーブル消失リスク
[memory/workflow_news_article_publish.md](.) より：
- 4行以上のテーブルや、セルに `**太字**` ＋ 絵文字ショートコードを混ぜたテーブルで**行が黙って消失する事例あり**（2026-04-25確認）
- 対策：年代別キャリア年表テーブルなどは、**fetch で全行が保存されたか必ず確認**。消失していたら箇条書きで再投稿を検討

### 顔写真の404・thumb URL問題
- Wikimedia Commons の **フルサイズ URL 必須**（`.../commons/X/YY/ファイル名.jpg`）
- thumb URL（`.../thumb/.../480px-...`）は `notion-to-md` 経由で壊れる
- 取得時に WebFetch で実際にHTTPステータスを確認すると安全

### 連番ミス防止
- 同日に複数公開する場合は**作成順に連番**を振る（後から挿入しない）
- 既存記事台帳は [memory/template_player_column_structure.md](.) の「現在の連番台帳」を真とする

### SNS情報の取り扱い
- 選手本人の公式SNSアカウントは事前に WebSearch で本物確認（ファンアカウント・なりすまし禁止）
- Markdown形式リンク `[@handle](URL)` 必須（生URLは強調表示されない）

---

## 5/15メンバー発表後の差分対応

発表で**予想と異なる選手が選ばれた場合**：
1. 公式26名のうち未コラムの新顔は本パイプラインに**追加**して継続
2. 予想26名に入っていたが公式落選した選手のコラムは**そのまま残す**（記録としての価値・SEO継続性のため非公開化しない）
3. `/japan-squad` の `playerSquad` は公式版で書き換え（`B5_announcement_template.md` 参照）

---

## 関連ファイル

- インデックスページ: [src/app/japan-squad/page.tsx](src/app/japan-squad/page.tsx)
- スクワッドデータ: [src/data/japanSquad.ts](src/data/japanSquad.ts)
- チーム詳細データ: [src/data/teamDetails.ts](src/data/teamDetails.ts)
- 標準構成テンプレ: `~/.claude/projects/.../memory/template_player_column_structure.md`
- 顔写真ルール: `~/.claude/projects/.../memory/feedback_column_player_photo.md`
- 記事公開手順: `~/.claude/projects/.../memory/workflow_news_article_publish.md`
- 速報記事テンプレ（5/15当日用）: [B5_announcement_template.md](B5_announcement_template.md)

---

## 進捗ログ（追記式）

> Claude が完遂したら下に追記する。日付・選手名・記事スラッグ・連番。

- (例) 2026-05-XX | 守田英正 | morita-hidemasa-japan-column-2026 | #16
