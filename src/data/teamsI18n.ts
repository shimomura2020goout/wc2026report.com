// チーム関連データのロケール別表記
// teams.ts は ja を真実として保持し、英語・韓国語表記はここで一元管理。
// FIFA 公式の英語表記、および韓国メディアでの一般的な表記を採用。
//
// 編集ガイド:
//  - 英語: FIFA / IOC の標準英語表記を使用（例: 日本 → Japan、オランダ → Netherlands）
//  - 韓国語: 韓国メディアで定着している표기를 사용（예: 일본、네덜란드）
//  - 国コード（FIFA 3レター）をキーにする

import type { Locale } from "@/i18n/constants";
import type { Team } from "./teams";

// ========================================
// 国名 (code → { en, ko })
// ========================================
export const TEAM_NAMES_I18N: Record<string, { en: string; ko: string }> = {
  // Group A
  MEX: { en: "Mexico", ko: "멕시코" },
  KOR: { en: "South Korea", ko: "대한민국" },
  RSA: { en: "South Africa", ko: "남아프리카공화국" },
  CZE: { en: "Czechia", ko: "체코" },
  // Group B
  CAN: { en: "Canada", ko: "캐나다" },
  QAT: { en: "Qatar", ko: "카타르" },
  SUI: { en: "Switzerland", ko: "스위스" },
  BIH: { en: "Bosnia and Herzegovina", ko: "보스니아 헤르체고비나" },
  // Group C
  BRA: { en: "Brazil", ko: "브라질" },
  HAI: { en: "Haiti", ko: "아이티" },
  SCO: { en: "Scotland", ko: "스코틀랜드" },
  MAR: { en: "Morocco", ko: "모로코" },
  // Group D
  USA: { en: "United States", ko: "미국" },
  PAR: { en: "Paraguay", ko: "파라과이" },
  AUS: { en: "Australia", ko: "호주" },
  TUR: { en: "Türkiye", ko: "튀르키예" },
  // Group E
  GER: { en: "Germany", ko: "독일" },
  CIV: { en: "Côte d'Ivoire", ko: "코트디부아르" },
  ECU: { en: "Ecuador", ko: "에콰도르" },
  CUW: { en: "Curaçao", ko: "퀴라소" },
  // Group F
  NED: { en: "Netherlands", ko: "네덜란드" },
  JPN: { en: "Japan", ko: "일본" },
  TUN: { en: "Tunisia", ko: "튀니지" },
  SWE: { en: "Sweden", ko: "스웨덴" },
  // Group G
  IRN: { en: "Iran", ko: "이란" },
  BEL: { en: "Belgium", ko: "벨기에" },
  EGY: { en: "Egypt", ko: "이집트" },
  NZL: { en: "New Zealand", ko: "뉴질랜드" },
  // Group H
  ESP: { en: "Spain", ko: "스페인" },
  KSA: { en: "Saudi Arabia", ko: "사우디아라비아" },
  URU: { en: "Uruguay", ko: "우루과이" },
  CPV: { en: "Cape Verde", ko: "카보베르데" },
  // Group I
  FRA: { en: "France", ko: "프랑스" },
  SEN: { en: "Senegal", ko: "세네갈" },
  NOR: { en: "Norway", ko: "노르웨이" },
  BOL: { en: "Bolivia", ko: "볼리비아" },
  // Group J
  ARG: { en: "Argentina", ko: "아르헨티나" },
  ALG: { en: "Algeria", ko: "알제리" },
  AUT: { en: "Austria", ko: "오스트리아" },
  JOR: { en: "Jordan", ko: "요르단" },
  // Group K
  POR: { en: "Portugal", ko: "포르투갈" },
  UZB: { en: "Uzbekistan", ko: "우즈베키스탄" },
  COL: { en: "Colombia", ko: "콜롬비아" },
  COD: { en: "DR Congo", ko: "콩고민주공화국" },
  // Group L
  ENG: { en: "England", ko: "잉글랜드" },
  GHA: { en: "Ghana", ko: "가나" },
  PAN: { en: "Panama", ko: "파나마" },
  CRO: { en: "Croatia", ko: "크로아티아" },
};

// 日本語 → 国コード逆引き（matches.ts 等で homeTeam/awayTeam が ja 文字列として
// 入ってくる場合に備える）
export const TEAM_NAME_JA_TO_CODE: Record<string, string> = {
  メキシコ: "MEX", 韓国: "KOR", 南アフリカ: "RSA", チェコ: "CZE",
  カナダ: "CAN", カタール: "QAT", スイス: "SUI", "ボスニア・ヘルツェゴビナ": "BIH",
  ブラジル: "BRA", ハイチ: "HAI", スコットランド: "SCO", モロッコ: "MAR",
  アメリカ: "USA", パラグアイ: "PAR", オーストラリア: "AUS", トルコ: "TUR",
  ドイツ: "GER", コートジボワール: "CIV", エクアドル: "ECU", キュラソー: "CUW",
  オランダ: "NED", 日本: "JPN", チュニジア: "TUN", スウェーデン: "SWE",
  イラン: "IRN", ベルギー: "BEL", エジプト: "EGY", ニュージーランド: "NZL",
  スペイン: "ESP", サウジアラビア: "KSA", ウルグアイ: "URU", カーボベルデ: "CPV",
  フランス: "FRA", セネガル: "SEN", ノルウェー: "NOR", ボリビア: "BOL",
  アルゼンチン: "ARG", アルジェリア: "ALG", オーストリア: "AUT", ヨルダン: "JOR",
  ポルトガル: "POR", ウズベキスタン: "UZB", コロンビア: "COL", コンゴ民主共和国: "COD",
  イングランド: "ENG", ガーナ: "GHA", パナマ: "PAN", クロアチア: "CRO",
};

// ========================================
// 連盟（地域）ラベル
// ========================================
export const REGION_LABELS_I18N: Record<string, { ja: string; en: string; ko: string }> = {
  UEFA: { ja: "ヨーロッパ", en: "Europe", ko: "유럽" },
  CONMEBOL: { ja: "南米", en: "South America", ko: "남미" },
  CONCACAF: { ja: "北中米カリブ海", en: "North & Central America", ko: "북중미·카리브" },
  CAF: { ja: "アフリカ", en: "Africa", ko: "아프리카" },
  AFC: { ja: "アジア", en: "Asia", ko: "아시아" },
  OFC: { ja: "オセアニア", en: "Oceania", ko: "오세아니아" },
};

// 連盟フィルターのラベル付き選択肢（旧 regions 配列の置き換え）
export function localizedRegions(locale: Locale): { id: string; label: string }[] {
  const order = ["UEFA", "CONMEBOL", "CONCACAF", "CAF", "AFC", "OFC"];
  return order.map((id) => ({
    id,
    label: `${REGION_LABELS_I18N[id][locale]} (${id})`,
  }));
}

// ========================================
// 「最高成績」テンプレート → ロケール訳
// 形式: <段階> + 「（年度）」または「初出場」
// teams.ts の bestResult 文字列を受け取り、英・韓に変換する
// ========================================

// 段階表現の変換テーブル（longest-first — 部分一致による誤置換を防ぐため）
// 例: 「準優勝」が「優勝」より先にマッチしないと "準Champions" のような壊れた出力になる
const STAGE_TRANSLATIONS: { ja: string; en: string; ko: string }[] = [
  { ja: "準優勝", en: "Runners-up", ko: "준우승" },
  { ja: "ベスト16", en: "Round of 16", ko: "16강" },
  { ja: "ベスト8", en: "Quarterfinal", ko: "8강" },
  { ja: "ベスト4", en: "Semifinal", ko: "4강" },
  { ja: "GL敗退", en: "Group stage", ko: "조별리그 탈락" },
  { ja: "初出場", en: "First appearance", ko: "첫 출전" },
  { ja: "優勝", en: "Champions", ko: "우승" },
  { ja: "4位", en: "Fourth place", ko: "4위" },
  { ja: "3位", en: "Third place", ko: "3위" },
];

// "ベスト8（1970, 1986）" → { en: "Quarterfinal (1970, 1986)", ko: "8강 (1970, 1986)" }
export function localizeBestResult(jaText: string, locale: Locale): string {
  if (locale === "ja") return jaText;

  // 「初出場」単独
  for (const tr of STAGE_TRANSLATIONS) {
    if (jaText === tr.ja) return tr[locale];
  }

  // "<段階>（<年度等>）" や "<段階>（<注釈>）" のパターンを置換
  let result = jaText;
  for (const tr of STAGE_TRANSLATIONS) {
    if (result.includes(tr.ja)) {
      result = result.replace(tr.ja, tr[locale]);
    }
  }
  // 全角括弧 → 半角（英語・韓国語版）
  result = result.replace(/（/g, " (").replace(/）/g, ")");
  // 「※xxx時代」のような注釈を最低限訳
  result = result
    .replace(/※チェコスロバキア時代/g, locale === "en" ? "as Czechoslovakia" : "체코슬로바키아 시절")
    .replace(/※ザイール時代/g, locale === "en" ? "as Zaire" : "자이르 시절");

  return result;
}

// ========================================
// ヘルパー関数 — UI から呼び出す
// ========================================

// チーム表示名（ja 原文 → ロケール表記）
export function localizedTeamName(team: Team, locale: Locale): string {
  if (locale === "ja") return team.name;
  const i18n = TEAM_NAMES_I18N[team.code];
  return i18n?.[locale] ?? team.name;
}

// チーム表示名（コード or ja 名から）— 試合データの homeTeam/awayTeam が ja 文字列の場合用
export function localizedTeamNameByJa(jaName: string, locale: Locale): string {
  if (locale === "ja") return jaName;
  const code = TEAM_NAME_JA_TO_CODE[jaName];
  if (!code) return jaName;
  return TEAM_NAMES_I18N[code]?.[locale] ?? jaName;
}

// 連盟ラベル
export function localizedRegionLabel(region: string, locale: Locale): string {
  return REGION_LABELS_I18N[region]?.[locale] ?? region;
}

// 最高成績
export function localizedBestResult(team: Team, locale: Locale): string {
  return localizeBestResult(team.bestResult, locale);
}
