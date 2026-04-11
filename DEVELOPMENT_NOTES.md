# W杯2026特設サイト 開発メモ

## 🚨 デザインルール（最重要・常に守る）

### アイコンは Google Material Icons のみ使用

**ルール**: サイト内で表示するアイコンは**例外なくすべて Google Material Symbols Outlined**を使用する。絵文字（🇯🇵 ⚽ 📋 ⏫ ❤️ 🔥 ⭐ 等）は使用禁止。

**理由**:
- デザインの一貫性
- 絵文字はOS/ブラウザ/フォント環境で見え方が変わる
- 過去に何度も「絵文字を Material Icons に変えて」という修正依頼が発生している

**適用範囲**: サイト内のすべてのコード・コンポーネント・データファイル・**Notion 記事の本文**まで含む。

**実装方法**:

1. **React コンポーネント内**: `<Icon name="..." />` コンポーネントを使う
   ```tsx
   import Icon from "@/components/Icon";
   <Icon name="sports_soccer" size={20} />
   ```

2. **HTML 直接記述（必要な場合）**:
   ```html
   <span class="material-symbols-outlined" style="vertical-align:middle;font-size:1.1em;">sports_soccer</span>
   ```

3. **Notion 記事の本文（マークダウン）**: 絵文字ショートコードを使う。レンダラーが自動で Material Icons に変換する（`src/app/news/[slug]/page.tsx` の `EMOJI_ICON_MAP` 参照）。
   ```markdown
   ## :soccer: 田中碧
   :arrow_up: [トップに戻る](#top)
   ```
   - **重要**: Notion はテキストブロック内のHTMLタグ（`<span>` 等）を保存時に剥がしてしまうため、本文に直接 `<span class="material-symbols-outlined">` を書いても保存されない。**必ずショートコードを使う**こと。
   - サポート済みショートコード: `:soccer:` `:arrow_up:` `:arrow_right:` `:star:` `:info:` `:calendar:` `:tv:` `:fire:` `:heart:` `:menu:`
   - 新しいアイコンが必要な場合は `src/app/news/[slug]/page.tsx` の `EMOJI_ICON_MAP` に追加する

**やってはいけないこと**:
- ❌ 絵文字（Unicode emoji）を直接記述する
- ❌ Notion 記事本文に `<span class="material-symbols-outlined">` を直接書く（剥がされる）
- ❌ 国旗絵文字（🇯🇵 等）を Material Icons の代わりに使う

**Material Icons 一覧**: https://fonts.google.com/icons

---

## 既知の問題と対策

### Notion記事コンテンツの更新方法（重要）

**問題**: `notion-update-page` の `replace_content` コマンドでMarkdownを送ると、`|`（パイプ）が `\|` にエスケープされ、改行 `\n` が `nn` というリテラル文字になる。結果として、テーブルや見出しが1つの巨大テキストブロックとして保存され、サイト上でMarkdownがレンダリングされずプレーンテキストで表示される。

**根本原因**: Notion MCP の `replace_content` コマンドがMarkdown表記（特にテーブル・改行）を正しくNotionブロックに変換できない。

**対策（必須）**: 記事コンテンツを大幅に更新する場合は以下の手順で行う。

1. 旧記事のステータスを「非公開」に変更:
   ```
   notion-update-page → update_properties → ステータス: "非公開"
   ```

2. 同じスラッグで新規記事を作成:
   ```
   notion-create-pages → content パラメータにMarkdownを直接記述
   ```

3. `create-pages` の `content` パラメータはMarkdownを正しくNotionブロックに変換してくれるため、テーブル・見出し・リスト等が正常にレンダリングされる。

**やってはいけないこと**:
- `replace_content` でテーブルを含むMarkdownを送信しない
- `update_content` の `old_str` / `new_str` でテーブル行を置換しない

**小規模な修正の場合**: プロパティ（タイトル・日付・タグ等）のみの変更は `update_properties` で問題なく動作する。

---

### FIFAランキング更新時の注意事項

**ルール**: `src/data/teams.ts` のFIFAランキングを最新化する際、**過去のニュース記事内のランキング数値は更新しない**こと。

**理由**: ニュース記事は「その時点の情報」として公開されたもの。例えばスコットランド戦（3/29）の記事では日本は19位と記載されているが、4/1のランキング更新で18位に上がった。記事の数値を後から変えると情報の整合性が崩れる。

**対象**:
- `src/data/teams.ts` → 最新ランキングに更新OK
- Notionのニュース記事 → 公開時点のランキングを維持（更新禁止）
- チーム詳細ページ（`src/data/teamDetails.ts`）→ 最新ランキングに更新OK

---

### notion-to-md テーブル変換

**問題**: `notion-to-md` ライブラリのデフォルトでは、Notionのテーブルブロックが正しくMarkdown表に変換されないことがある。

**対策**: `src/lib/notion.ts` にカスタムトランスフォーマーを追加済み。Notion APIから直接テーブル行データを取得し、`| col1 | col2 |` 形式のMarkdown表を生成する。

---

## 環境変数

| 変数名 | 用途 | 設定場所 |
|---|---|---|
| `NOTION_API_KEY` | Notion API認証キー | Vercel環境変数 |
| `NOTION_DATABASE_ID` | ニュース記事DB | Vercel環境変数 |
| `NOTION_PROMO_DATABASE_ID` | プロモバナー管理DB | Vercel環境変数 |

ローカル開発では `.env.local` にコピーして使用。

---

## デプロイ・公開フロー（必読）

### サイト公開の流れ

```
コード変更 → npm run build（ローカル確認） → git add → git commit → git push origin main → Vercel自動デプロイ
```

**重要**: コード変更後は必ず `git push origin main` まで実行すること。pushしないとVercelにデプロイされず、本番サイトに反映されない。

### 手順詳細

1. **コード変更**: データファイル（teams.ts, matches.ts等）やページを編集
2. **ビルド確認**: `npm run build` でエラーがないことを確認
3. **ステージング**: `git add <変更ファイル>` で対象ファイルをステージ
4. **コミット**: `git commit -m "feat: 変更内容の説明"` でコミット作成
5. **プッシュ**: `git push origin main` でGitHubにプッシュ → Vercelが自動でCI/CDを実行
6. **確認**: Vercelダッシュボードまたは https://www.wc2026report.com でデプロイ完了を確認

### 注意事項

- `main` ブランチへのpushでVercelに自動デプロイされる
- ISRキャッシュは5分（300秒）。Notion記事の更新反映に最大5分かかる
- Notion記事のみの更新（プロパティやコンテンツの変更）はpush不要。ISRで自動反映される
- コードの変更（.ts/.tsx/.json等）は必ずpushが必要

---

## コラム記事（選手の素顔シリーズ）

### 概要

通常のニュース記事（速報性重視）とは別に、**コラム記事**という深掘り型の記事カテゴリがある。選手の人間性・故郷・キャリアの裏側にフォーカスし、他の情報サイトにない価値を提供する。

### 制作指示

ユーザーが **「{国名}の{選手名}選手のコラムを作成お願いします」** と指示した場合、`src/lib/contentArticleTemplates.ts` に定義された構成に従って記事を制作する。

**指示例**:
- 「日本の久保建英選手のコラムを作成お願いします」
- 「フランスのムバッペ選手のコラムを作成お願いします」
- 「ブラジルのヴィニシウス選手のコラムを作成お願いします」

国名から出身地のリサーチ方針が変わる:
- **日本の選手** → サッカーを始めた場所（少年団・ユースの所在地）を故郷として深掘り
- **海外の選手** → 生まれた土地を故郷として深掘り

### 記事構成（必須セクション）

1. **リード文** — シリーズ趣旨と選手紹介
2. **:star: 基本プロフィール** — フリー顔写真 + テーブル形式の基本情報
3. **:arrow_right: 故郷を知る** — 出身地の深掘り（人口・首長・特産品・観光・首都からの距離）
4. **:calendar: 年代別キャリア年表** — 出生〜現在のテーブル
5. **:soccer: サッカー遍歴** — クラブ遍歴・仲の良い選手・エピソード
6. **:fire: 代表での活躍** — 代表成績テーブル
7. **:heart: SNS・メディア発信** — 公式SNSアカウントと直近の投稿
8. **:info: 編集後記** — 人間性の総括

### 制作ルール

- **カテゴリ**: コラム
- **スラッグ**: `player-story-{english-name}`
- **タイトル形式**: 【選手の素顔 #N】{選手名}｜{キャッチコピー}
- **画像**: Wikimedia Commonsのフリー画像（CC BY-SA / CC0）を使用。ライセンス表記必須
- **リサーチ**: 基本情報・出身地・経歴・SNS・フリー画像の5項目をすべて調査してから執筆
- **テンプレート定義**: `src/lib/contentArticleTemplates.ts`

---

## アフィリエイトリンク

| サービス | ASP | 設置場所 |
|---|---|---|
| DAZN for BUSINESS | アクセストレード | /watch, /page.tsx (トップ) |
| DMM×DAZNホーダイ | （個人向け、リンク待ち） | /watch |
| WOWOW | アクセストレード | /watch, /page.tsx (トップ) |
| ドコモスポーツくじ | ドコモアフィリエイト | /toto |
| 楽天toto | 楽天アフィリエイト | /toto |
