export type MatchType = "friendly" | "kirin" | "worldcup_gl" | "worldcup_ko" | "kirin_cup";
export type MatchStatus = "scheduled" | "live" | "finished";
export type KnockoutRound = "R32" | "R16" | "QF" | "SF" | "3rd" | "Final";

export interface Match {
  id: string;
  date: string; // JST日付 (YYYY-MM-DD)
  kickoff: string; // 日本時間表示用 (HH:MM)
  homeTeam: string;
  awayTeam: string;
  venue: string;
  city: string;
  type: MatchType;
  typeLabel: string;
  broadcast: string;
  isTotoTarget: boolean;
  isJapan: boolean;
  group?: string;
  matchday?: number;
  knockoutRound?: KnockoutRound;
  matchNumber?: number;
  status: MatchStatus;
  homeScore?: number | null;
  awayScore?: number | null;
  resultNote?: string;       // 試合結果の一言コメント
  resultLink?: string;       // 結果詳細のニュース記事リンク
  isPlaceholder?: boolean;
}

// ========================================
// 会場データ
// ========================================

type VenueKey = "azteca" | "akron" | "bbva" | "bmo" | "bc" | "sofi" | "metlife" | "gillette" | "levis" | "lincoln" | "hardrock" | "mercedes" | "nrg" | "att" | "lumen" | "arrowhead";

const venueData: Record<VenueKey, { venue: string; city: string }> = {
  azteca: { venue: "エスタディオ・アステカ", city: "メキシコシティ（メキシコ）" },
  akron: { venue: "エスタディオ・アクロン", city: "グアダラハラ（メキシコ）" },
  bbva: { venue: "エスタディオBBVA", city: "モンテレイ（メキシコ）" },
  bmo: { venue: "BMOフィールド", city: "トロント（カナダ）" },
  bc: { venue: "BCプレイス", city: "バンクーバー（カナダ）" },
  sofi: { venue: "SoFiスタジアム", city: "ロサンゼルス（アメリカ）" },
  metlife: { venue: "メットライフ・スタジアム", city: "ニューヨーク/NJ（アメリカ）" },
  gillette: { venue: "ジレット・スタジアム", city: "ボストン（アメリカ）" },
  levis: { venue: "リーバイス・スタジアム", city: "サンフランシスコ（アメリカ）" },
  lincoln: { venue: "リンカーン・フィナンシャル・フィールド", city: "フィラデルフィア（アメリカ）" },
  hardrock: { venue: "ハードロック・スタジアム", city: "マイアミ（アメリカ）" },
  mercedes: { venue: "メルセデス・ベンツ・スタジアム", city: "アトランタ（アメリカ）" },
  nrg: { venue: "NRGスタジアム", city: "ヒューストン（アメリカ）" },
  att: { venue: "AT&Tスタジアム", city: "ダラス（アメリカ）" },
  lumen: { venue: "ルーメン・フィールド", city: "シアトル（アメリカ）" },
  arrowhead: { venue: "アローヘッド・スタジアム", city: "カンザスシティ（アメリカ）" },
};

// ========================================
// ヘルパー関数（データ生成用）
// ========================================

function gl(
  id: string, date: string, kickoff: string,
  home: string, away: string, v: VenueKey,
  group: string, md: number, broadcast?: string
): Match {
  const vd = venueData[v];
  const isJapan = home === "日本" || away === "日本";
  const isPlaceholder = /PO|勝者/.test(home) || /PO|勝者/.test(away);
  return {
    id, date, kickoff, homeTeam: home, awayTeam: away,
    venue: vd.venue, city: vd.city,
    type: "worldcup_gl", typeLabel: `W杯 GL第${md}節`,
    broadcast: broadcast || "DAZN / NHK BS4K",
    isTotoTarget: true, isJapan, group, matchday: md,
    status: "scheduled", isPlaceholder: isPlaceholder || undefined,
  };
}

function ko(
  id: string, mn: number, date: string, kickoff: string,
  home: string, away: string, v: VenueKey,
  round: KnockoutRound, label: string, broadcast?: string
): Match {
  const vd = venueData[v];
  return {
    id, date, kickoff, homeTeam: home, awayTeam: away,
    venue: vd.venue, city: vd.city,
    type: "worldcup_ko", typeLabel: label,
    broadcast: broadcast || "DAZN / NHK BS4K",
    isTotoTarget: true, isJapan: false,
    status: "scheduled", isPlaceholder: true,
    knockoutRound: round, matchNumber: mn,
  };
}

// ========================================
// グループステージ 全72試合（日付・時刻はすべてJST）
// ========================================

// --- グループ A: メキシコ, 韓国, 南アフリカ, チェコ ---
const groupAMatches: Match[] = [
  gl("gl-a-1", "2026-06-12", "04:00", "メキシコ", "南アフリカ", "azteca", "A", 1, "NHK総合 / DAZN / NHK BS4K"),
  gl("gl-a-2", "2026-06-12", "11:00", "韓国", "チェコ", "akron", "A", 1, "フジテレビ / DAZN / NHK BS4K"),
  gl("gl-a-3", "2026-06-19", "01:00", "チェコ", "南アフリカ", "mercedes", "A", 2),
  gl("gl-a-4", "2026-06-19", "10:00", "メキシコ", "韓国", "akron", "A", 2, "日本テレビ / DAZN / NHK BS4K"),
  gl("gl-a-5", "2026-06-25", "10:00", "チェコ", "メキシコ", "azteca", "A", 3),
  gl("gl-a-6", "2026-06-25", "10:00", "南アフリカ", "韓国", "bbva", "A", 3),
];

// --- グループ B: カナダ, カタール, スイス, ボスニア・ヘルツェゴビナ ---
const groupBMatches: Match[] = [
  gl("gl-b-1", "2026-06-13", "04:00", "カナダ", "ボスニア・ヘルツェゴビナ", "bmo", "B", 1),
  gl("gl-b-2", "2026-06-14", "04:00", "カタール", "スイス", "levis", "B", 1),
  gl("gl-b-3", "2026-06-19", "04:00", "スイス", "ボスニア・ヘルツェゴビナ", "sofi", "B", 2),
  gl("gl-b-4", "2026-06-19", "07:00", "カナダ", "カタール", "bc", "B", 2),
  gl("gl-b-5", "2026-06-25", "04:00", "スイス", "カナダ", "bc", "B", 3),
  gl("gl-b-6", "2026-06-25", "04:00", "ボスニア・ヘルツェゴビナ", "カタール", "lumen", "B", 3),
];

// --- グループ C: ブラジル, ハイチ, スコットランド, モロッコ ---
const groupCMatches: Match[] = [
  gl("gl-c-1", "2026-06-14", "07:00", "ブラジル", "モロッコ", "metlife", "C", 1, "NHK総合 / DAZN / NHK BS4K"),
  gl("gl-c-2", "2026-06-14", "10:00", "ハイチ", "スコットランド", "gillette", "C", 1),
  gl("gl-c-3", "2026-06-20", "07:00", "スコットランド", "モロッコ", "gillette", "C", 2),
  gl("gl-c-4", "2026-06-20", "10:00", "ブラジル", "ハイチ", "lincoln", "C", 2, "日本テレビ / DAZN / NHK BS4K"),
  gl("gl-c-5", "2026-06-25", "07:00", "スコットランド", "ブラジル", "hardrock", "C", 3, "フジテレビ / DAZN / NHK BS4K"),
  gl("gl-c-6", "2026-06-25", "07:00", "モロッコ", "ハイチ", "mercedes", "C", 3),
];

// --- グループ D: アメリカ, パラグアイ, オーストラリア, トルコ ---
const groupDMatches: Match[] = [
  gl("gl-d-1", "2026-06-13", "10:00", "アメリカ", "パラグアイ", "sofi", "D", 1, "NHK総合 / DAZN / NHK BS4K"),
  gl("gl-d-2", "2026-06-14", "13:00", "オーストラリア", "トルコ", "bc", "D", 1),
  gl("gl-d-3", "2026-06-20", "04:00", "アメリカ", "オーストラリア", "lumen", "D", 2, "フジテレビ / DAZN / NHK BS4K"),
  gl("gl-d-4", "2026-06-20", "13:00", "トルコ", "パラグアイ", "levis", "D", 2),
  gl("gl-d-5", "2026-06-26", "11:00", "トルコ", "アメリカ", "sofi", "D", 3),
  gl("gl-d-6", "2026-06-26", "11:00", "パラグアイ", "オーストラリア", "levis", "D", 3),
];

// --- グループ E: ドイツ, コートジボワール, エクアドル, キュラソー ---
const groupEMatches: Match[] = [
  gl("gl-e-1", "2026-06-15", "02:00", "ドイツ", "キュラソー", "nrg", "E", 1, "日本テレビ / DAZN / NHK BS4K"),
  gl("gl-e-2", "2026-06-15", "08:00", "コートジボワール", "エクアドル", "lincoln", "E", 1),
  gl("gl-e-3", "2026-06-21", "05:00", "ドイツ", "コートジボワール", "bmo", "E", 2, "NHK総合 / DAZN / NHK BS4K"),
  gl("gl-e-4", "2026-06-21", "09:00", "エクアドル", "キュラソー", "arrowhead", "E", 2),
  gl("gl-e-5", "2026-06-26", "05:00", "エクアドル", "ドイツ", "metlife", "E", 3, "NHK総合 / DAZN / NHK BS4K"),
  gl("gl-e-6", "2026-06-26", "05:00", "キュラソー", "コートジボワール", "lincoln", "E", 3),
];

// --- グループ F: オランダ, 日本, チュニジア, スウェーデン --- ★日本所属 ※プレーオフ確定
const groupFMatches: Match[] = [
  gl("gl-f-1", "2026-06-15", "05:00", "オランダ", "日本", "att", "F", 1,
    "DAZN（無料配信）、NHK総合（地上波）"),
  gl("gl-f-2", "2026-06-15", "11:00", "スウェーデン", "チュニジア", "bbva", "F", 1),
  gl("gl-f-3", "2026-06-21", "02:00", "オランダ", "スウェーデン", "nrg", "F", 2),
  gl("gl-f-4", "2026-06-21", "13:00", "チュニジア", "日本", "bbva", "F", 2,
    "DAZN（無料配信）、日本テレビ / NHK BS"),
  gl("gl-f-5", "2026-06-26", "08:00", "日本", "スウェーデン", "att", "F", 3,
    "DAZN（無料配信）、NHK総合（地上波）"),
  gl("gl-f-6", "2026-06-26", "08:00", "チュニジア", "オランダ", "arrowhead", "F", 3),
];

// --- グループ G: イラン, ベルギー, エジプト, ニュージーランド ---
const groupGMatches: Match[] = [
  gl("gl-g-1", "2026-06-16", "04:00", "ベルギー", "エジプト", "lumen", "G", 1, "NHK総合 / DAZN / NHK BS4K"),
  gl("gl-g-2", "2026-06-16", "10:00", "イラン", "ニュージーランド", "sofi", "G", 1),
  gl("gl-g-3", "2026-06-22", "04:00", "ベルギー", "イラン", "sofi", "G", 2, "フジテレビ / DAZN / NHK BS4K"),
  gl("gl-g-4", "2026-06-22", "10:00", "ニュージーランド", "エジプト", "bc", "G", 2),
  gl("gl-g-5", "2026-06-27", "12:00", "エジプト", "イラン", "lumen", "G", 3),
  gl("gl-g-6", "2026-06-27", "12:00", "ニュージーランド", "ベルギー", "bc", "G", 3),
];

// --- グループ H: スペイン, サウジアラビア, ウルグアイ, カーボベルデ ---
const groupHMatches: Match[] = [
  gl("gl-h-1", "2026-06-16", "01:00", "スペイン", "カーボベルデ", "mercedes", "H", 1, "日本テレビ / DAZN / NHK BS4K"),
  gl("gl-h-2", "2026-06-16", "07:00", "サウジアラビア", "ウルグアイ", "hardrock", "H", 1, "NHK総合 / DAZN / NHK BS4K"),
  gl("gl-h-3", "2026-06-22", "01:00", "スペイン", "サウジアラビア", "mercedes", "H", 2, "NHK総合 / DAZN / NHK BS4K"),
  gl("gl-h-4", "2026-06-22", "07:00", "ウルグアイ", "カーボベルデ", "hardrock", "H", 2),
  gl("gl-h-5", "2026-06-27", "09:00", "カーボベルデ", "サウジアラビア", "nrg", "H", 3),
  gl("gl-h-6", "2026-06-27", "09:00", "ウルグアイ", "スペイン", "akron", "H", 3, "フジテレビ / DAZN / NHK BS4K"),
];

// --- グループ I: フランス, セネガル, ノルウェー, ボリビア ---
const groupIMatches: Match[] = [
  gl("gl-i-1", "2026-06-17", "04:00", "フランス", "セネガル", "metlife", "I", 1, "NHK総合 / DAZN / NHK BS4K"),
  gl("gl-i-2", "2026-06-17", "07:00", "ボリビア", "ノルウェー", "gillette", "I", 1),
  gl("gl-i-3", "2026-06-23", "06:00", "フランス", "ボリビア", "lincoln", "I", 2, "日本テレビ / DAZN / NHK BS4K"),
  gl("gl-i-4", "2026-06-23", "09:00", "ノルウェー", "セネガル", "metlife", "I", 2),
  gl("gl-i-5", "2026-06-27", "04:00", "ノルウェー", "フランス", "gillette", "I", 3, "NHK総合 / DAZN / NHK BS4K"),
  gl("gl-i-6", "2026-06-27", "04:00", "セネガル", "ボリビア", "bmo", "I", 3),
];

// --- グループ J: アルゼンチン, アルジェリア, オーストリア, ヨルダン ---
const groupJMatches: Match[] = [
  gl("gl-j-1", "2026-06-17", "10:00", "アルゼンチン", "アルジェリア", "arrowhead", "J", 1, "フジテレビ / DAZN / NHK BS4K"),
  gl("gl-j-2", "2026-06-17", "13:00", "オーストリア", "ヨルダン", "levis", "J", 1),
  gl("gl-j-3", "2026-06-23", "02:00", "アルゼンチン", "オーストリア", "att", "J", 2, "NHK総合 / DAZN / NHK BS4K"),
  gl("gl-j-4", "2026-06-23", "12:00", "ヨルダン", "アルジェリア", "levis", "J", 2),
  gl("gl-j-5", "2026-06-28", "11:00", "アルジェリア", "オーストリア", "arrowhead", "J", 3),
  gl("gl-j-6", "2026-06-28", "11:00", "ヨルダン", "アルゼンチン", "att", "J", 3, "日本テレビ / DAZN / NHK BS4K"),
];

// --- グループ K: ポルトガル, ウズベキスタン, コロンビア, ジャマイカ ---
const groupKMatches: Match[] = [
  gl("gl-k-1", "2026-06-18", "02:00", "ポルトガル", "ジャマイカ", "nrg", "K", 1, "NHK総合 / DAZN / NHK BS4K"),
  gl("gl-k-2", "2026-06-18", "11:00", "ウズベキスタン", "コロンビア", "azteca", "K", 1, "日本テレビ / DAZN / NHK BS4K"),
  gl("gl-k-3", "2026-06-24", "02:00", "ポルトガル", "ウズベキスタン", "nrg", "K", 2, "フジテレビ / DAZN / NHK BS4K"),
  gl("gl-k-4", "2026-06-24", "11:00", "コロンビア", "ジャマイカ", "akron", "K", 2),
  gl("gl-k-5", "2026-06-28", "08:30", "コロンビア", "ポルトガル", "hardrock", "K", 3, "NHK総合 / DAZN / NHK BS4K"),
  gl("gl-k-6", "2026-06-28", "08:30", "ジャマイカ", "ウズベキスタン", "mercedes", "K", 3),
];

// --- グループ L: イングランド, ガーナ, パナマ, クロアチア ---
const groupLMatches: Match[] = [
  gl("gl-l-1", "2026-06-18", "05:00", "イングランド", "クロアチア", "att", "L", 1, "NHK総合 / DAZN / NHK BS4K"),
  gl("gl-l-2", "2026-06-18", "08:00", "ガーナ", "パナマ", "bmo", "L", 1),
  gl("gl-l-3", "2026-06-24", "05:00", "イングランド", "ガーナ", "gillette", "L", 2, "日本テレビ / DAZN / NHK BS4K"),
  gl("gl-l-4", "2026-06-24", "08:00", "パナマ", "クロアチア", "bmo", "L", 2),
  gl("gl-l-5", "2026-06-28", "06:00", "パナマ", "イングランド", "metlife", "L", 3, "フジテレビ / DAZN / NHK BS4K"),
  gl("gl-l-6", "2026-06-28", "06:00", "クロアチア", "ガーナ", "lincoln", "L", 3),
];

// ========================================
// ノックアウトステージ 全32試合
// ========================================

// --- ラウンド32（16試合）--- ★日本関連 ko-r32-3, ko-r32-4 にF組が絡む
const r32Matches: Match[] = [
  ko("ko-r32-1", 73, "2026-06-29", "04:00", "A組2位", "B組2位", "sofi", "R32", "ラウンド32", "NHK総合 / DAZN / NHK BS4K"),
  ko("ko-r32-2", 74, "2026-06-30", "05:30", "E組1位", "3位通過", "gillette", "R32", "ラウンド32", "日本テレビ / DAZN / NHK BS4K"),
  ko("ko-r32-3", 75, "2026-06-30", "10:00", "F組1位", "C組2位", "bbva", "R32", "ラウンド32", "NHK総合 / DAZN / NHK BS4K"),
  ko("ko-r32-4", 76, "2026-06-30", "02:00", "C組1位", "F組2位", "nrg", "R32", "ラウンド32", "フジテレビ / DAZN / NHK BS4K"),
  ko("ko-r32-5", 77, "2026-07-01", "06:00", "I組1位", "3位通過", "metlife", "R32", "ラウンド32", "NHK総合 / DAZN / NHK BS4K"),
  ko("ko-r32-6", 78, "2026-07-01", "02:00", "E組2位", "I組2位", "att", "R32", "ラウンド32"),
  ko("ko-r32-7", 79, "2026-07-01", "10:00", "A組1位", "3位通過", "azteca", "R32", "ラウンド32", "日本テレビ / DAZN / NHK BS4K"),
  ko("ko-r32-8", 80, "2026-07-02", "01:00", "L組1位", "3位通過", "mercedes", "R32", "ラウンド32", "NHK総合 / DAZN / NHK BS4K"),
  ko("ko-r32-9", 81, "2026-07-02", "09:00", "D組1位", "3位通過", "levis", "R32", "ラウンド32", "フジテレビ / DAZN / NHK BS4K"),
  ko("ko-r32-10", 82, "2026-07-02", "05:00", "G組1位", "3位通過", "lumen", "R32", "ラウンド32"),
  ko("ko-r32-11", 83, "2026-07-03", "08:00", "K組2位", "L組2位", "bmo", "R32", "ラウンド32"),
  ko("ko-r32-12", 84, "2026-07-03", "04:00", "H組1位", "J組2位", "sofi", "R32", "ラウンド32", "NHK総合 / DAZN / NHK BS4K"),
  ko("ko-r32-13", 85, "2026-07-03", "12:00", "B組1位", "3位通過", "bc", "R32", "ラウンド32"),
  ko("ko-r32-14", 86, "2026-07-04", "07:00", "J組1位", "H組2位", "hardrock", "R32", "ラウンド32", "日本テレビ / DAZN / NHK BS4K"),
  ko("ko-r32-15", 87, "2026-07-04", "10:30", "K組1位", "3位通過", "arrowhead", "R32", "ラウンド32"),
  ko("ko-r32-16", 88, "2026-07-04", "03:00", "D組2位", "G組2位", "att", "R32", "ラウンド32", "フジテレビ / DAZN / NHK BS4K"),
];

// --- ラウンド16（8試合）--- 全試合地上波あり
const r16Matches: Match[] = [
  ko("ko-r16-1", 89, "2026-07-05", "06:00", "M74勝者", "M77勝者", "lincoln", "R16", "ラウンド16", "NHK総合 / DAZN / NHK BS4K"),
  ko("ko-r16-2", 90, "2026-07-05", "02:00", "M73勝者", "M75勝者", "nrg", "R16", "ラウンド16", "日本テレビ / DAZN / NHK BS4K"),
  ko("ko-r16-3", 91, "2026-07-06", "05:00", "M76勝者", "M78勝者", "metlife", "R16", "ラウンド16", "NHK総合 / DAZN / NHK BS4K"),
  ko("ko-r16-4", 92, "2026-07-06", "09:00", "M79勝者", "M80勝者", "azteca", "R16", "ラウンド16", "フジテレビ / DAZN / NHK BS4K"),
  ko("ko-r16-5", 93, "2026-07-07", "04:00", "M83勝者", "M84勝者", "att", "R16", "ラウンド16", "NHK総合 / DAZN / NHK BS4K"),
  ko("ko-r16-6", 94, "2026-07-07", "09:00", "M81勝者", "M82勝者", "lumen", "R16", "ラウンド16", "日本テレビ / DAZN / NHK BS4K"),
  ko("ko-r16-7", 95, "2026-07-08", "01:00", "M86勝者", "M88勝者", "mercedes", "R16", "ラウンド16", "NHK総合 / DAZN / NHK BS4K"),
  ko("ko-r16-8", 96, "2026-07-08", "05:00", "M85勝者", "M87勝者", "bc", "R16", "ラウンド16", "フジテレビ / DAZN / NHK BS4K"),
];

// --- 準々決勝（4試合）--- 全試合地上波あり
const qfMatches: Match[] = [
  ko("ko-qf-1", 97, "2026-07-10", "05:00", "M89勝者", "M90勝者", "gillette", "QF", "準々決勝", "NHK総合 / DAZN / NHK BS4K"),
  ko("ko-qf-2", 98, "2026-07-11", "04:00", "M93勝者", "M94勝者", "sofi", "QF", "準々決勝", "日本テレビ / DAZN / NHK BS4K"),
  ko("ko-qf-3", 99, "2026-07-12", "06:00", "M91勝者", "M92勝者", "hardrock", "QF", "準々決勝", "フジテレビ / DAZN / NHK BS4K"),
  ko("ko-qf-4", 100, "2026-07-12", "10:00", "M95勝者", "M96勝者", "arrowhead", "QF", "準々決勝", "NHK総合 / DAZN / NHK BS4K"),
];

// --- 準決勝（2試合）--- 全試合地上波あり
const sfMatches: Match[] = [
  ko("ko-sf-1", 101, "2026-07-15", "04:00", "M97勝者", "M98勝者", "att", "SF", "準決勝", "NHK総合 / 日本テレビ / DAZN / NHK BS4K"),
  ko("ko-sf-2", 102, "2026-07-16", "04:00", "M99勝者", "M100勝者", "mercedes", "SF", "準決勝", "NHK総合 / フジテレビ / DAZN / NHK BS4K"),
];

// --- 3位決定戦 ---
const thirdPlaceMatch: Match[] = [
  ko("ko-3rd", 103, "2026-07-19", "06:00", "準決勝①敗者", "準決勝②敗者", "hardrock", "3rd", "3位決定戦", "NHK総合 / DAZN / NHK BS4K"),
];

// --- 決勝 ---
const finalMatch: Match[] = [
  ko("ko-final", 104, "2026-07-20", "04:00", "準決勝①勝者", "準決勝②勝者", "metlife", "Final", "決勝", "NHK総合 / 日本テレビ / フジテレビ / DAZN / NHK BS4K"),
];

// ========================================
// 統合エクスポート — ワールドカップ全104試合
// ========================================

export const allGroupStageMatches: Match[] = [
  ...groupAMatches, ...groupBMatches, ...groupCMatches, ...groupDMatches,
  ...groupEMatches, ...groupFMatches, ...groupGMatches, ...groupHMatches,
  ...groupIMatches, ...groupJMatches, ...groupKMatches, ...groupLMatches,
];

export const allKnockoutMatches: Match[] = [
  ...r32Matches, ...r16Matches, ...qfMatches, ...sfMatches,
  ...thirdPlaceMatch, ...finalMatch,
];

export const allWorldCupMatches: Match[] = [
  ...allGroupStageMatches,
  ...allKnockoutMatches,
];

// ========================================
// 日本代表 — W杯以外の試合（親善試合・キリンカップ等）
// ========================================

export const japanNonWcMatches: Match[] = [
  {
    id: "jp-0",
    date: "2026-03-29",
    kickoff: "02:00",
    homeTeam: "スコットランド",
    awayTeam: "日本",
    venue: "ハムデン・パーク",
    city: "グラスゴー（スコットランド）",
    type: "friendly",
    typeLabel: "国際親善試合",
    broadcast: "NHK総合（生中継）、NHK ONE・U-NEXT（配信）",
    isTotoTarget: false,
    isJapan: true,
    status: "finished",
    homeScore: 0,
    awayScore: 1,
    resultNote: "伊東純也が84分に決勝ゴール。W杯前の欧州遠征を白星でスタート",
    resultLink: "/news/international-match-results-march-26-27-2026",
  },
  {
    id: "jp-1",
    date: "2026-04-01",
    kickoff: "03:45",
    homeTeam: "イングランド",
    awayTeam: "日本",
    venue: "ウェンブリー・スタジアム",
    city: "ロンドン（イングランド）",
    type: "friendly",
    typeLabel: "国際親善試合",
    broadcast: "NHK Eテレ（生中継）、NHK ONE・U-NEXT（配信）",
    isTotoTarget: false,
    isJapan: true,
    status: "finished",
    homeScore: 0,
    awayScore: 1,
    resultNote: "三笘薫が23分に決勝弾！アジア勢初のウェンブリーでの勝利。欧州遠征2連勝",
    resultLink: "/news/england-vs-japan-result-april1",
  },
  {
    id: "jp-2",
    date: "2026-05-31",
    kickoff: "未定",
    homeTeam: "日本",
    awayTeam: "未定",
    venue: "国立競技場",
    city: "東京",
    type: "kirin",
    typeLabel: "キリンチャレンジカップ",
    broadcast: "調整中（地上波・ネット検討中）",
    isTotoTarget: false,
    isJapan: true,
    status: "scheduled",
  },
  {
    id: "jp-6",
    date: "2026-09-24",
    kickoff: "未定",
    homeTeam: "日本",
    awayTeam: "未定",
    venue: "キューアンドエースタジアムみやぎ",
    city: "宮城",
    type: "kirin",
    typeLabel: "キリンチャレンジカップ",
    broadcast: "調整中",
    isTotoTarget: false,
    isJapan: true,
    status: "scheduled",
  },
  {
    id: "jp-7",
    date: "2026-09-28",
    kickoff: "未定",
    homeTeam: "日本",
    awayTeam: "未定",
    venue: "エディオンピースウイング広島",
    city: "広島",
    type: "kirin",
    typeLabel: "キリンチャレンジカップ",
    broadcast: "調整中",
    isTotoTarget: false,
    isJapan: true,
    status: "scheduled",
  },
  {
    id: "jp-8",
    date: "2026-10-01",
    kickoff: "未定",
    homeTeam: "日本",
    awayTeam: "未定",
    venue: "横浜国際総合競技場",
    city: "横浜",
    type: "kirin_cup",
    typeLabel: "キリンカップ",
    broadcast: "調整中",
    isTotoTarget: false,
    isJapan: true,
    status: "scheduled",
  },
  {
    id: "jp-9",
    date: "2026-10-05",
    kickoff: "未定",
    homeTeam: "日本",
    awayTeam: "未定",
    venue: "国立競技場",
    city: "東京",
    type: "kirin_cup",
    typeLabel: "キリンカップ",
    broadcast: "調整中",
    isTotoTarget: false,
    isJapan: true,
    status: "scheduled",
  },
];

// ========================================
// japanMatches — 日本代表の全試合（W杯 + 親善 + カップ戦）
// ========================================

export const japanMatches: Match[] = [
  ...japanNonWcMatches,
  ...allWorldCupMatches.filter((m) => m.isJapan),
].sort((a, b) => a.date.localeCompare(b.date) || a.kickoff.localeCompare(b.kickoff));

// ========================================
// グループ構成（2025年12月FIFA抽選結果に基づく）
// ========================================

export const worldCupGroups = [
  { name: "A", teams: ["メキシコ", "韓国", "南アフリカ", "チェコ"], venue: "メキシコシティ / グアダラハラ" },
  { name: "B", teams: ["カナダ", "カタール", "スイス", "ボスニア・ヘルツェゴビナ"], venue: "トロント / バンクーバー" },
  { name: "C", teams: ["ブラジル", "ハイチ", "スコットランド", "モロッコ"], venue: "ニューヨーク / ボストン" },
  { name: "D", teams: ["アメリカ", "パラグアイ", "オーストラリア", "トルコ"], venue: "ロサンゼルス / シアトル" },
  { name: "E", teams: ["ドイツ", "コートジボワール", "エクアドル", "キュラソー"], venue: "ヒューストン / フィラデルフィア" },
  { name: "F", teams: ["オランダ", "日本", "チュニジア", "スウェーデン"], venue: "ダラス / モンテレイ" },
  { name: "G", teams: ["イラン", "ベルギー", "エジプト", "ニュージーランド"], venue: "ロサンゼルス / シアトル" },
  { name: "H", teams: ["スペイン", "サウジアラビア", "ウルグアイ", "カーボベルデ"], venue: "アトランタ / マイアミ" },
  { name: "I", teams: ["フランス", "セネガル", "ノルウェー", "ボリビア"], venue: "ニューヨーク / ボストン" },
  { name: "J", teams: ["アルゼンチン", "アルジェリア", "オーストリア", "ヨルダン"], venue: "カンザスシティ / ダラス" },
  { name: "K", teams: ["ポルトガル", "ウズベキスタン", "コロンビア", "ジャマイカ"], venue: "ヒューストン / メキシコシティ" },
  { name: "L", teams: ["イングランド", "ガーナ", "パナマ", "クロアチア"], venue: "ダラス / トロント" },
];

// ========================================
// 放送情報
// ========================================

export const broadcastInfo = {
  dazn: {
    name: "DAZN",
    matches: 104,
    description: "全104試合を独占ライブ配信。日本代表戦は無料配信。",
    plans: [
      { name: "DAZN Standard", price: "月額4,200円（税込）", note: "年間プランなら月額2,917円相当" },
      { name: "DMM×DAZNホーダイ", price: "月額3,480円（税込）", note: "DMMプレミアム + DAZNのセットでお得" },
    ],
  },
  nhk: {
    name: "NHK総合",
    matches: 33,
    description: "開幕戦・決勝含む33試合を地上波生中継。受信料のみで視聴可能。",
  },
  ntv: {
    name: "日本テレビ",
    matches: 15,
    description: "15試合を地上波生中継。無料。",
  },
  fuji: {
    name: "フジテレビ",
    matches: 10,
    description: "10試合を地上波生中継。無料。",
  },
  nhkbs: {
    name: "NHK BSプレミアム4K",
    matches: 104,
    description: "全104試合を4K画質で生中継＋録画放送。BS受信環境が必要。",
  },
};

// ========================================
// ユーティリティ関数
// ========================================

export function formatMatchDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const dayOfWeek = days[date.getUTCDay()];
  return `${year}/${month}/${day}（${dayOfWeek}）`;
}

export function getMatchTypeColor(type: MatchType): string {
  switch (type) {
    case "worldcup_gl":
    case "worldcup_ko":
      return "bg-amber-500 text-white";
    case "friendly":
      return "bg-blue-500 text-white";
    case "kirin":
    case "kirin_cup":
      return "bg-green-600 text-white";
    default:
      return "bg-gray-500 text-white";
  }
}

export function getGroupMatches(group: string): Match[] {
  return allGroupStageMatches.filter((m) => m.group === group);
}

export function getMatchesByDate(date: string): Match[] {
  return allWorldCupMatches.filter((m) => m.date === date);
}

export function getMatchesByRound(round: KnockoutRound): Match[] {
  return allKnockoutMatches.filter((m) => m.knockoutRound === round);
}
