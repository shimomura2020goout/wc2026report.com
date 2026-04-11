/**
 * コンテンツ記事テンプレート定義
 *
 * 「{国名}の{選手名}選手のコラムを作成お願いします」と指示された場合、
 * このテンプレートの構成に従って記事を制作する。
 *
 * 指示例:
 * - 「日本の久保建英選手のコラムを作成お願いします」
 * - 「フランスのムバッペ選手のコラムを作成お願いします」
 *
 * ニュース記事との違い:
 * - ニュース記事 = 速報性重視、事実ベース、短め
 * - コラム記事 = 深掘り、選手の人間性にフォーカス、再訪問価値のあるエバーグリーンコンテンツ
 *
 * 国名による出身地リサーチの違い:
 * - 日本の選手 → サッカーを始めた場所（少年団・ユースの所在地）を故郷として深掘り
 * - 海外の選手 → 生まれた土地を故郷として深掘り
 */

// ─── コンテンツ記事のカテゴリ・タグ設定 ───
export const CONTENT_ARTICLE_DEFAULTS = {
  category: "コラム", // コンテンツ記事は「コラム」カテゴリ
  defaultTags: ["注目選手"], // 最低限のタグ。選手に応じて「日本代表」等を追加
  slugPrefix: "player-story-", // スラッグの接頭辞
  seriesName: "選手の素顔", // シリーズ名
};

// ─── 記事構成セクション定義 ───
export interface ContentArticleSection {
  id: string;
  title: string;
  icon: string; // Notion Markdown用の絵文字ショートコード
  description: string;
  required: boolean;
}

export const CONTENT_ARTICLE_SECTIONS: ContentArticleSection[] = [
  {
    id: "intro",
    title: "リード文",
    icon: "",
    description:
      "シリーズの趣旨説明と、選手の簡単な紹介。読者を引き込む導入。",
    required: true,
  },
  {
    id: "profile",
    title: "基本プロフィール",
    icon: ":star:",
    description:
      "選手の顔写真（Wikimedia Commonsのフリー画像）、氏名、生年月日、出身地、身長/体重、ポジション、利き足、所属クラブ、代表キャップ数をテーブル形式で表示。",
    required: true,
  },
  {
    id: "hometown",
    title: "故郷を知る",
    icon: ":arrow_right:",
    description:
      "サッカーを始めた場所（国内選手は少年団/ユースのあった街、海外選手は生まれた土地）を深掘り。首都からの距離、人口、市長/首長、特産品、観光名所、街の特徴を紹介。読者がその土地に興味を持つような書き方。",
    required: true,
  },
  {
    id: "career_timeline",
    title: "年代別キャリア年表",
    icon: ":calendar:",
    description:
      "出生から現在までの経歴をテーブル形式（年|年齢|出来事）で時系列に整理。追えるところまで詳細に。",
    required: true,
  },
  {
    id: "club_career",
    title: "サッカー遍歴",
    icon: ":soccer:",
    description:
      "プロ入り後の所属クラブ遍歴。各クラブでの滞在期間、成績、主な活躍、移籍の経緯を紹介。仲の良い選手との関係性も記載。",
    required: true,
  },
  {
    id: "national_team",
    title: "代表での活躍",
    icon: ":fire:",
    description:
      "日本代表（または各国代表）での主な成績と注目試合をテーブル形式で紹介。",
    required: true,
  },
  {
    id: "sns",
    title: "SNS・メディア発信",
    icon: ":heart:",
    description:
      "公式SNS（Instagram, X/Twitter, YouTube等）のアカウント情報と直近の投稿内容を紹介。公式サイトやフォトブック等があればそちらも。SNSがなければ最新ニュースのみ掲載。",
    required: true,
  },
  {
    id: "editorial",
    title: "編集後記",
    icon: ":info:",
    description:
      "選手の人間性やキャリアを総括するまとめ。数字では見えない魅力を伝える。シリーズの案内で締めくくる。",
    required: true,
  },
];

// ─── Notion記事プロパティのテンプレート ───
export interface ContentArticleProperties {
  title: string; // タイトル: 【選手の素顔 #N】{選手名}｜{キャッチコピー}
  slug: string; // スラッグ: player-story-{english-name}
  category: string; // カテゴリ: コラム
  tags: string[]; // タグ: ["注目選手", "日本代表", etc.]
  summary: string; // 概要: SEO用120文字程度
  sourceName: string; // 出典名
  sourceUrl: string; // 出典URL
  eyecatchUrl: string | null; // アイキャッチURL（Wikimedia Commonsフリー画像推奨）
}

// ─── リサーチ項目チェックリスト ───
export const RESEARCH_CHECKLIST = {
  basicInfo: [
    "正式名称（漢字・ひらがな・英語表記）",
    "生年月日・年齢",
    "出身地（市区町村レベル）",
    "身長・体重",
    "ポジション・利き足",
    "現所属クラブ・背番号",
    "代表キャップ数・ゴール数",
    "愛称・ニックネーム",
  ],
  hometown: [
    "所在地（県・地方）",
    "人口",
    "市長/首長",
    "首都/主要都市からの距離・アクセス",
    "特産品・名物",
    "観光スポット",
    "街の歴史的・文化的特徴",
    "選手との関連（応援情報、出身校など）",
  ],
  career: [
    "ユース/少年団/学生時代の所属チーム",
    "プロ契約の経緯",
    "各クラブでの在籍期間・成績",
    "移籍金（公開されている場合）",
    "主な活躍・受賞歴",
    "仲の良い選手・チームメイト（エピソード付き）",
  ],
  socialMedia: [
    "Instagram（@ハンドル）",
    "X/Twitter（@ハンドル）",
    "YouTube（チャンネル名）",
    "公式サイト",
    "直近の投稿内容",
    "フォトブック・書籍等のメディア展開",
  ],
  freeImage: [
    "Wikimedia Commonsで選手名を検索",
    "CC BY-SA / CC0 ライセンスの画像を優先",
    "アクション写真またはポートレートを選択",
    "ライセンス表記を記事内に記載",
  ],
};

// ─── Markdownテンプレート生成関数 ───
export function generateContentArticleMarkdown(params: {
  seriesNumber: number;
  playerName: string;
  introText: string;
  profileImageUrl: string;
  profileImageCaption: string;
  profileTable: string; // Markdown table
  hometownName: string;
  hometownIntro: string;
  hometownDataTable: string; // Markdown table
  hometownSections: string; // Additional hometown content
  careerTimeline: string; // Markdown table
  clubCareer: string; // Markdown content with H3 sections
  nationalTeamTable: string; // Markdown table
  nationalTeamText: string;
  snsContent: string; // Markdown content
  editorialNote: string;
}): string {
  return `${params.introText}

**「選手の素顔」シリーズ第${params.seriesNumber}回**は、${params.playerName}選手を取り上げます。

---

## :star: 基本プロフィール

![${params.playerName}](${params.profileImageUrl})
*${params.profileImageCaption}*

${params.profileTable}

---

## :arrow_right: 故郷を知る ― ${params.hometownName}

${params.hometownIntro}

### ${params.hometownName}の基本データ

${params.hometownDataTable}

${params.hometownSections}

---

## :calendar: 年代別キャリア年表

${params.careerTimeline}

---

## :soccer: サッカー遍歴 ― クラブキャリアの軌跡

${params.clubCareer}

---

## :fire: 代表での活躍

${params.nationalTeamTable}

${params.nationalTeamText}

---

## :heart: SNS・メディア発信

${params.snsContent}

---

## :info: 編集後記

${params.editorialNote}

---

*本記事は「選手の素顔」シリーズの第${params.seriesNumber}回です。サッカーの成績だけでなく、選手の人間性や故郷の魅力に光を当てるコンテンツです。*`;
}
