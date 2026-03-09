export type MatchType = "friendly" | "kirin" | "worldcup_gl" | "worldcup_ko" | "kirin_cup";

export interface Match {
  id: string;
  date: string; // ISO date
  kickoff: string; // 日本時間表示用
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
}

export const japanMatches: Match[] = [
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
    broadcast: "調整中（※欧州遠征）",
    isTotoTarget: false,
    isJapan: true,
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
  },
  {
    id: "jp-3",
    date: "2026-06-14",
    kickoff: "05:00",
    homeTeam: "オランダ",
    awayTeam: "日本",
    venue: "AT&Tスタジアム",
    city: "ダラス（アメリカ）",
    type: "worldcup_gl",
    typeLabel: "FIFAワールドカップ 2026 GL第1節",
    broadcast: "DAZN（無料配信）、NHK総合（地上波）",
    isTotoTarget: true,
    isJapan: true,
    group: "H",
  },
  {
    id: "jp-4",
    date: "2026-06-21",
    kickoff: "13:00",
    homeTeam: "チュニジア",
    awayTeam: "日本",
    venue: "エスタディオBBVA",
    city: "モンテレイ（メキシコ）",
    type: "worldcup_gl",
    typeLabel: "FIFAワールドカップ 2026 GL第2節",
    broadcast: "DAZN（無料配信）、日本テレビ／NHK BS",
    isTotoTarget: true,
    isJapan: true,
    group: "H",
  },
  {
    id: "jp-5",
    date: "2026-06-26",
    kickoff: "08:00",
    homeTeam: "日本",
    awayTeam: "UEFA PO B勝者",
    venue: "AT&Tスタジアム",
    city: "ダラス（アメリカ）",
    type: "worldcup_gl",
    typeLabel: "FIFAワールドカップ 2026 GL第3節",
    broadcast: "DAZN（無料配信）、NHK総合（地上波）",
    isTotoTarget: true,
    isJapan: true,
    group: "H",
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
  },
];

export const worldCupGroups = [
  {
    name: "A",
    teams: ["アメリカ", "モロッコ", "パナマ", "CONCACAF PO"],
    venue: "ロサンゼルス / マイアミ",
  },
  {
    name: "B",
    teams: ["ポルトガル", "エクアドル", "サウジアラビア", "CONMEBOL-AFC PO"],
    venue: "ニューヨーク / フィラデルフィア",
  },
  {
    name: "C",
    teams: ["ウルグアイ", "メキシコ", "ボリビア", "UEFA PO A"],
    venue: "マイアミ / アトランタ",
  },
  {
    name: "D",
    teams: ["ブラジル", "コロンビア", "パラグアイ", "AFC PO"],
    venue: "サンフランシスコ / シアトル",
  },
  {
    name: "E",
    teams: ["アルゼンチン", "オーストラリア", "インドネシア", "AFC PO"],
    venue: "マイアミ / ヒューストン",
  },
  {
    name: "F",
    teams: ["フランス", "コスタリカ", "ペルー", "OFC PO"],
    venue: "シカゴ / ロサンゼルス",
  },
  {
    name: "G",
    teams: ["スペイン", "トルコ", "中国", "CONCACAF PO"],
    venue: "ダラス / カンザスシティ",
  },
  {
    name: "H",
    teams: ["日本", "オランダ", "チュニジア", "UEFA PO B"],
    venue: "ダラス / モンテレイ",
  },
  {
    name: "I",
    teams: ["ドイツ", "韓国", "セルビア", "CONCACAF PO"],
    venue: "フィラデルフィア / アトランタ",
  },
  {
    name: "J",
    teams: ["イタリア", "エジプト", "ウクライナ", "CAF PO"],
    venue: "ニューヨーク / ボストン",
  },
  {
    name: "K",
    teams: ["イングランド", "セネガル", "カタール", "CONCACAF/CAF PO"],
    venue: "シアトル / バンクーバー",
  },
  {
    name: "L",
    teams: ["ベルギー", "カメルーン", "ガーナ", "OFC PO"],
    venue: "トロント / グアダラハラ",
  },
];

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

export function formatMatchDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00+09:00");
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = days[date.getDay()];
  return `${date.getFullYear()}/${month}/${day}（${dayOfWeek}）`;
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
