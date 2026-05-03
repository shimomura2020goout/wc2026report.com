# Notion 記事 多言語化 セットアップ手順

W杯2026特設ページの **Notion 記事DB**（`28a344a2-e61a-4a74-a6bb-f951e1aa23ca`）を、**英語・韓国語の多言語対応** に拡張するための手動セットアップ手順です。

このセットアップは **一度だけ** 実施します。完了後は cron が自動翻訳を回します。

---

## 1. Notion 記事DB に追加するプロパティ

ブログ記事DB（`タイトル`、`スラッグ`、`ステータス`…等の既存プロパティを持つDB）に、以下 **8 プロパティ** を追加してください。

| プロパティ名 | 種別 | 用途 |
|---|---|---|
| `タイトル_en` | rich_text（テキスト） | 英語タイトル |
| `タイトル_ko` | rich_text（テキスト） | 韓国語タイトル |
| `概要_en` | rich_text（テキスト） | 英語の概要・OG description 用 |
| `概要_ko` | rich_text（テキスト） | 韓国語の概要 |
| `翻訳ステータス_en` | select（セレクト） | 値: `未翻訳` / `自動翻訳` / `手動上書き` |
| `翻訳ステータス_ko` | select（セレクト） | 同上 |
| `翻訳元ハッシュ_en` | rich_text（テキスト） | ja 本文の SHA-256 を保存。差分検知用（自動更新） |
| `翻訳元ハッシュ_ko` | rich_text（テキスト） | 同上 |

**select の選択肢を作るときの注意**:
- まず select 自体を追加 → 1 件目のレコードで `未翻訳` を入力 → ドロップダウンに登録される
- 同じく `自動翻訳`、`手動上書き` を順に登録
- 全角・半角・スペースの入り方が違うとマッチしないので **そのまま** コピペ推奨

---

## 2. 本文の翻訳保存先

本文の翻訳結果は、**親ページ直下の子ページ**として保存されます。コードと cron が自動生成・更新するので、人が触る必要はありません。

| 子ページ名 | 内容 |
|---|---|
| `__translation_en` | 英訳本文（Markdown を Notion ブロックに変換したもの） |
| `__translation_ko` | 韓国語訳本文 |

これらの子ページは Notion の検索や記事一覧には混ざりません（命名で識別）。手動で削除してもOK（次回 cron が再生成）。

---

## 3. 動作モード

各記事 × 各言語の組み合わせで、`翻訳ステータス_en` / `翻訳ステータス_ko` の値によって挙動が変わります。

| ステータス | cron の動作 | サイト表示 |
|---|---|---|
| `未翻訳`（または空） | 次回の cron で **自動翻訳して書き込む** | 翻訳前は ja 原文を表示（`canonical` は ja に向く） |
| `自動翻訳` | ja 原文に変更があれば **再翻訳**（差分検知）。無ければスキップ | 翻訳結果を表示 |
| `手動上書き` | **絶対に触らない**（人間優先） | 手動で編集した内容を表示 |

**手動上書きの運用**:
1. cron が翻訳した結果をレビュー
2. 直したい記事だけ Notion の `タイトル_en`/`概要_en`/`__translation_en` 子ページを直接編集
3. `翻訳ステータス_en` を `手動上書き` に変更 → 以降 cron は触らない

**再翻訳したくなったら**:
- `翻訳ステータス_en` を `未翻訳` に戻す → 次回 cron で再翻訳される

---

## 4. 翻訳の発火タイミング

Vercel Cron が **2 時間おき** に `/api/cron/translate` を叩きます（`vercel.json` 設定）。

1 回の cron で処理する記事数は環境変数 `TRANSLATE_BATCH_SIZE`（既定 6）で制限されています。これは Vercel の関数タイムアウト（Hobby: 60s, Pro: 300s）と Claude API のレートリミットに対する保護です。20 記事 × 2 言語 = 40 ジョブある場合、約 14 時間かけて全件回ります（差分が無い記事はスキップで瞬時）。

**手動でいますぐ翻訳したい場合**:

```bash
# ローカルから実行（ANTHROPIC_API_KEY が必要）
npm run translate:articles                  # 全公開記事 × en/ko
npm run translate:articles -- --slug=foo    # 特定記事だけ
npm run translate:articles -- --locale=en   # 英語だけ
npm run translate:articles -- --dry-run     # 実行内容のプレビューだけ

# 本番から手動 trigger（CRON_SECRET 必要）
curl "https://www.wc2026report.com/api/cron/translate?secret=<CRON_SECRET>"
```

---

## 5. 環境変数の確認

Vercel と `.env.local` に以下が設定されていることを確認:

| 変数 | 用途 |
|---|---|
| `NOTION_API_KEY` | Notion 記事 DB への読み書き |
| `NOTION_DATABASE_ID` | 記事DB の ID（`28a344a2-...`） |
| `ANTHROPIC_API_KEY` | Claude API 翻訳（既存） |
| `CRON_SECRET` | Vercel Cron 認証（既存） |
| `TRANSLATE_BATCH_SIZE` | 任意。1 回の cron で処理する件数（既定 6） |

---

## 6. 静的UI辞書の翻訳（記事とは別）

サイトのナビ・ボタン・見出しなどの UI 文言は `src/i18n/locales/{ja,en,ko}.json` に格納しています。

**新しい UI 文字列を追加した場合**:
1. `ja.json` にキーを追加
2. `npm run dict:sync -- --dry-run` で en/ko の差分を確認
3. `npm run dict:sync` で Claude API が自動翻訳して en/ko を埋める
4. PR レビューで人間が固有名詞・サッカー用語をチェック

---

## 7. セットアップ完了後の動作確認

1. Notion で 1 記事の `翻訳ステータス_en` を `未翻訳` にする
2. ローカルで `npm run translate:articles -- --slug=<その記事のslug> --locale=en --dry-run` → 翻訳対象になっているか確認
3. `--dry-run` を外して実行 → Notion 上でその記事のプロパティと子ページが更新されているか確認
4. `https://localhost:3000/en/news/<slug>` で英語版が表示されるか確認
5. `<link rel="canonical">` が `/en/news/<slug>` を指しているか確認
6. （翻訳が無いケース）`canonical` が `/ja/news/<slug>` にフォールバックするか別記事で確認
