export interface PlayoffTeam {
  name: string;
  fifaRanking: number;
  region: string;
  qualificationNote: string;
  keyPlayers: {
    name: string;
    position: string;
    club: string;
    note: string;
  }[];
  strengths: string[];
  weaknesses: string[];
}

export interface PlayoffMatch {
  id: string;
  round: "semi" | "final";
  date: string;
  kickoff: string; // 日本時間
  homeTeam: string;
  awayTeam: string;
  venue: string;
  status: "upcoming" | "finished";
  homeScore?: number;
  awayScore?: number;
}

// UEFA プレーオフ パスB 対象チーム
export const playoffTeams: Record<string, PlayoffTeam> = {
  ウクライナ: {
    name: "ウクライナ",
    fifaRanking: 22,
    region: "UEFA（ヨーロッパ）",
    qualificationNote: "UEFA予選グループでの成績により、プレーオフに回った。戦時下でのサッカー活動を続けるウクライナは、国民の希望を背負ってW杯出場を目指す。",
    keyPlayers: [
      { name: "ムドリク", position: "FW/MF", club: "チェルシー", note: "スピードとドリブルが武器の左ウイング。ビッグマッチでの決定力が鍵" },
      { name: "ドヴビク", position: "FW", club: "ローマ", note: "2023-24ラ・リーガ得点王。ゴール前の嗅覚が光るストライカー" },
      { name: "ルニン", position: "GK", club: "レアル・マドリード", note: "CLでの経験豊富な守護神。ビッグセーブでチームを救える" },
    ],
    strengths: ["個人能力の高いアタッカー陣", "戦時下で培われた精神力", "カウンターアタックの鋭さ"],
    weaknesses: ["国内リーグの中断による実戦不足", "DF陣の安定性"],
  },
  スウェーデン: {
    name: "スウェーデン",
    fifaRanking: 30,
    region: "UEFA（ヨーロッパ）",
    qualificationNote: "イブラヒモビッチ引退後の新世代チーム。予選では堅守速攻を武器に勝ち上がった。",
    keyPlayers: [
      { name: "イサク", position: "FW", club: "ニューカッスル", note: "プレミアリーグで得点量産中。長身ながらテクニカルなプレーが持ち味" },
      { name: "クルセフスキ", position: "MF/FW", club: "トッテナム", note: "右サイドからの突破とクロスが武器。創造性のあるアタッカー" },
      { name: "リンデレフ", position: "DF", club: "マンチェスター・ユナイテッド", note: "守備の要。経験豊富なCBでラインを統率" },
    ],
    strengths: ["プレミアリーグで活躍する選手多数", "組織的な守備", "セットプレーの強さ"],
    weaknesses: ["世代交代の過渡期", "創造性のある中盤の層が薄い"],
  },
  ポーランド: {
    name: "ポーランド",
    fifaRanking: 23,
    region: "UEFA（ヨーロッパ）",
    qualificationNote: "レヴァンドフスキ擁するポーランド。予選では得点力を見せつけたが、守備面に課題を残した。",
    keyPlayers: [
      { name: "レヴァンドフスキ", position: "FW", club: "バルセロナ", note: "世界屈指のストライカー。37歳ながらゴール量産を続ける。W杯ではチームの命運を握る" },
      { name: "ジエリンスキ", position: "MF", club: "インテル", note: "中盤の司令塔。パスセンスとミドルシュートが武器" },
      { name: "ザレフスキ", position: "MF/FW", club: "ローマ", note: "左サイドのドリブラー。スピードと推進力で局面を打開" },
    ],
    strengths: ["レヴァンドフスキの圧倒的得点力", "セリエAで活躍する選手が多い", "W杯経験が豊富"],
    weaknesses: ["レヴァンドフスキへの依存度が高い", "DF陣のスピード不足"],
  },
  アルバニア: {
    name: "アルバニア",
    fifaRanking: 56,
    region: "UEFA（ヨーロッパ）",
    qualificationNote: "EURO 2024出場の勢いでW杯初出場を狙う。規律ある守備と全員攻撃のスタイルが持ち味。",
    keyPlayers: [
      { name: "ブロヤ", position: "FW", club: "エヴァートン", note: "身体能力の高いストライカー。プレミアでの経験を活かす" },
      { name: "アサニ", position: "MF/FW", club: "グワンジュFC", note: "テクニカルなアタッカー。アジアでの経験も" },
      { name: "ジムシティ", position: "DF", club: "アタランタ", note: "セリエAの強豪で守備の柱。経験値が高い" },
    ],
    strengths: ["組織的な守備", "チームとしての結束力", "監督の戦術浸透度が高い"],
    weaknesses: ["個人能力で上位国に劣る", "W杯出場経験なし", "得点力不足"],
  },
};

// UEFAプレーオフ日程・結果（パスB）
export const playoffMatches: PlayoffMatch[] = [
  {
    id: "po-b-semi-1",
    round: "semi",
    date: "2026-03-26",
    kickoff: "04:45",
    homeTeam: "スウェーデン",
    awayTeam: "ウクライナ",
    venue: "フレンズ・アレナ（ストックホルム）",
    status: "finished",
    homeScore: 3,
    awayScore: 1,
  },
  {
    id: "po-b-semi-2",
    round: "semi",
    date: "2026-03-26",
    kickoff: "04:45",
    homeTeam: "ポーランド",
    awayTeam: "アルバニア",
    venue: "PGEナロドヴィ（ワルシャワ）",
    status: "finished",
    homeScore: 2,
    awayScore: 1,
  },
  {
    id: "po-b-final",
    round: "final",
    date: "2026-03-31",
    kickoff: "04:45",
    homeTeam: "スウェーデン",
    awayTeam: "ポーランド",
    venue: "フレンズ・アレナ（ストックホルム）",
    status: "finished",
    homeScore: 3,
    awayScore: 2,
  },
];

// 全UEFAプレーオフ決勝結果サマリー
export const playoffFinalResults = [
  { path: "A", home: "ボスニア・ヘルツェゴビナ", away: "イタリア", score: "1-1 (AET)", penaltyResult: "ボスニアPK勝ち", winner: "ボスニア・ヘルツェゴビナ", group: "B", note: "Kean(15')で先制もバストーニ退場(42')で10人に。Tabakovic(79')で同点。PK戦でボスニアが歴史的初出場を決め、イタリアは3大会連続不出場" },
  { path: "B", home: "スウェーデン", away: "ポーランド", score: "3-2", winner: "スウェーデン", group: "F", note: "Elanga(19'), Lagerbielke(44'), Gyökeres(88') / Zalewski(33'), Swiderski(55')。ギョケレシュの88分劇的決勝弾で2018年以来のW杯出場" },
  { path: "C", home: "トルコ", away: "コソボ", score: "1-0", winner: "トルコ", group: "D", note: "Aktürkoğlu(53')の決勝弾。24年ぶりのW杯出場" },
  { path: "D", home: "チェコ", away: "デンマーク", score: "2-2 (AET)", penaltyResult: "チェコPK 2-1", winner: "チェコ", group: "A", note: "Šulc(3'), Krejčí(100') / Andersen(72'), Høgh(111')。PK戦でチェコが2006年以来のW杯出場" },
];

// 大陸間プレーオフ決勝結果サマリー
export const intercontinentalResults = [
  { path: "1", home: "DRコンゴ", away: "ジャマイカ", winner: "DRコンゴ", group: "K", note: "トゥアンゼベの延長100分弾でDRコンゴが1974年ザイール時代以来52年ぶりのW杯出場を決めた（1-0 AET）" },
  { path: "2", home: "イラク", away: "ボリビア", winner: "ボリビア", group: "I", note: "ボリビアが1994年以来32年ぶりのW杯出場を決めた" },
];
