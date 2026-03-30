# W杯2026特設サイト 開発メモ

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

## デプロイ

- `main` ブランチへのpushでVercelに自動デプロイ
- ISRキャッシュは5分（300秒）。Notion記事の更新反映に最大5分かかる

---

## アフィリエイトリンク

| サービス | ASP | 設置場所 |
|---|---|---|
| DAZN for BUSINESS | アクセストレード | /watch, /page.tsx (トップ) |
| DMM×DAZNホーダイ | （個人向け、リンク待ち） | /watch |
| WOWOW | アクセストレード | /watch, /page.tsx (トップ) |
| ドコモスポーツくじ | ドコモアフィリエイト | /toto |
| 楽天toto | 楽天アフィリエイト | /toto |
