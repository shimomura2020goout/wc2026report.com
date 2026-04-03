export interface Team {
  name: string;
  code: string;
  group: string;
  fifaRanking: number;
  region: string;
  regionLabel: string;
  wcAppearances: number;
  bestResult: string;
  flag: string;
  isPlaceholder?: boolean;
}

// ========================================
// 全48チーム（2026年4月4日更新 / FIFAランキング2026年4月1日付準拠）
// ========================================

export const allTeams: Team[] = [
  // --- グループ A ---
  { name: "メキシコ", code: "MEX", group: "A", fifaRanking: 15, region: "CONCACAF", regionLabel: "北中米カリブ海", wcAppearances: 17, bestResult: "ベスト8（1970, 1986）", flag: "🇲🇽" },
  { name: "韓国", code: "KOR", group: "A", fifaRanking: 22, region: "AFC", regionLabel: "アジア", wcAppearances: 11, bestResult: "4位（2002）", flag: "🇰🇷" },
  { name: "南アフリカ", code: "RSA", group: "A", fifaRanking: 59, region: "CAF", regionLabel: "アフリカ", wcAppearances: 4, bestResult: "GL敗退（1998-2010）", flag: "🇿🇦" },
  { name: "チェコ", code: "CZE", group: "A", fifaRanking: 36, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 2, bestResult: "準優勝（1962 ※チェコスロバキア時代）", flag: "🇨🇿" },

  // --- グループ B ---
  { name: "カナダ", code: "CAN", group: "B", fifaRanking: 30, region: "CONCACAF", regionLabel: "北中米カリブ海", wcAppearances: 3, bestResult: "GL敗退（1986, 2022）", flag: "🇨🇦" },
  { name: "カタール", code: "QAT", group: "B", fifaRanking: 56, region: "AFC", regionLabel: "アジア", wcAppearances: 2, bestResult: "GL敗退（2022）", flag: "🇶🇦" },
  { name: "スイス", code: "SUI", group: "B", fifaRanking: 19, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 13, bestResult: "ベスト8（1934-1954）", flag: "🇨🇭" },
  { name: "ボスニア・ヘルツェゴビナ", code: "BIH", group: "B", fifaRanking: 57, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 1, bestResult: "初出場", flag: "🇧🇦" },

  // --- グループ C ---
  { name: "ブラジル", code: "BRA", group: "C", fifaRanking: 6, region: "CONMEBOL", regionLabel: "南米", wcAppearances: 23, bestResult: "優勝（1958-2002・5回）", flag: "🇧🇷" },
  { name: "ハイチ", code: "HAI", group: "C", fifaRanking: 83, region: "CONCACAF", regionLabel: "北中米カリブ海", wcAppearances: 2, bestResult: "GL敗退（1974）", flag: "🇭🇹" },
  { name: "スコットランド", code: "SCO", group: "C", fifaRanking: 40, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 9, bestResult: "GL敗退（1954-1998）", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { name: "モロッコ", code: "MAR", group: "C", fifaRanking: 8, region: "CAF", regionLabel: "アフリカ", wcAppearances: 7, bestResult: "4位（2022）", flag: "🇲🇦" },

  // --- グループ D ---
  { name: "アメリカ", code: "USA", group: "D", fifaRanking: 16, region: "CONCACAF", regionLabel: "北中米カリブ海", wcAppearances: 12, bestResult: "ベスト8（1930, 2002）", flag: "🇺🇸" },
  { name: "パラグアイ", code: "PAR", group: "D", fifaRanking: 38, region: "CONMEBOL", regionLabel: "南米", wcAppearances: 9, bestResult: "ベスト8（2010）", flag: "🇵🇾" },
  { name: "オーストラリア", code: "AUS", group: "D", fifaRanking: 27, region: "AFC", regionLabel: "アジア", wcAppearances: 6, bestResult: "ベスト16（2006, 2022）", flag: "🇦🇺" },
  { name: "トルコ", code: "TUR", group: "D", fifaRanking: 42, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 3, bestResult: "3位（2002）", flag: "🇹🇷" },

  // --- グループ E ---
  { name: "ドイツ", code: "GER", group: "E", fifaRanking: 10, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 21, bestResult: "優勝（1954-2014・4回）", flag: "🇩🇪" },
  { name: "コートジボワール", code: "CIV", group: "E", fifaRanking: 35, region: "CAF", regionLabel: "アフリカ", wcAppearances: 4, bestResult: "GL敗退（2006-2014）", flag: "🇨🇮" },
  { name: "エクアドル", code: "ECU", group: "E", fifaRanking: 23, region: "CONMEBOL", regionLabel: "南米", wcAppearances: 5, bestResult: "ベスト16（2006）", flag: "🇪🇨" },
  { name: "キュラソー", code: "CUW", group: "E", fifaRanking: 81, region: "CONCACAF", regionLabel: "北中米カリブ海", wcAppearances: 1, bestResult: "初出場", flag: "🇨🇼" },

  // --- グループ F（日本所属）---
  { name: "オランダ", code: "NED", group: "F", fifaRanking: 7, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 12, bestResult: "準優勝（1974-2010・3回）", flag: "🇳🇱" },
  { name: "日本", code: "JPN", group: "F", fifaRanking: 18, region: "AFC", regionLabel: "アジア", wcAppearances: 8, bestResult: "ベスト16（2002-2022）", flag: "🇯🇵" },
  { name: "チュニジア", code: "TUN", group: "F", fifaRanking: 45, region: "CAF", regionLabel: "アフリカ", wcAppearances: 7, bestResult: "GL敗退（1978-2022）", flag: "🇹🇳" },
  { name: "スウェーデン", code: "SWE", group: "F", fifaRanking: 30, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 14, bestResult: "準優勝（1958）", flag: "🇸🇪" },

  // --- グループ G ---
  { name: "イラン", code: "IRN", group: "G", fifaRanking: 21, region: "AFC", regionLabel: "アジア", wcAppearances: 7, bestResult: "GL敗退（1978-2022）", flag: "🇮🇷" },
  { name: "ベルギー", code: "BEL", group: "G", fifaRanking: 9, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 15, bestResult: "3位（2018）", flag: "🇧🇪" },
  { name: "エジプト", code: "EGY", group: "G", fifaRanking: 29, region: "CAF", regionLabel: "アフリカ", wcAppearances: 4, bestResult: "GL敗退（1934-2018）", flag: "🇪🇬" },
  { name: "ニュージーランド", code: "NZL", group: "G", fifaRanking: 85, region: "OFC", regionLabel: "オセアニア", wcAppearances: 3, bestResult: "GL敗退（1982-2010）", flag: "🇳🇿" },

  // --- グループ H ---
  { name: "スペイン", code: "ESP", group: "H", fifaRanking: 2, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 17, bestResult: "優勝（2010）", flag: "🇪🇸" },
  { name: "サウジアラビア", code: "KSA", group: "H", fifaRanking: 60, region: "AFC", regionLabel: "アジア", wcAppearances: 7, bestResult: "ベスト16（1994）", flag: "🇸🇦" },
  { name: "ウルグアイ", code: "URU", group: "H", fifaRanking: 17, region: "CONMEBOL", regionLabel: "南米", wcAppearances: 15, bestResult: "優勝（1930, 1950）", flag: "🇺🇾" },
  { name: "カーボベルデ", code: "CPV", group: "H", fifaRanking: 68, region: "CAF", regionLabel: "アフリカ", wcAppearances: 1, bestResult: "初出場", flag: "🇨🇻" },

  // --- グループ I ---
  { name: "フランス", code: "FRA", group: "I", fifaRanking: 1, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 17, bestResult: "優勝（1998, 2018）", flag: "🇫🇷" },
  { name: "セネガル", code: "SEN", group: "I", fifaRanking: 14, region: "CAF", regionLabel: "アフリカ", wcAppearances: 4, bestResult: "ベスト8（2002）", flag: "🇸🇳" },
  { name: "ノルウェー", code: "NOR", group: "I", fifaRanking: 31, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 4, bestResult: "ベスト16（1998）", flag: "🇳🇴" },
  { name: "ボリビア", code: "BOL", group: "I", fifaRanking: 83, region: "CONMEBOL", regionLabel: "南米", wcAppearances: 4, bestResult: "GL敗退（1930-1994）", flag: "🇧🇴" },

  // --- グループ J ---
  { name: "アルゼンチン", code: "ARG", group: "J", fifaRanking: 3, region: "CONMEBOL", regionLabel: "南米", wcAppearances: 19, bestResult: "優勝（1978-2022・3回）", flag: "🇦🇷" },
  { name: "アルジェリア", code: "ALG", group: "J", fifaRanking: 28, region: "CAF", regionLabel: "アフリカ", wcAppearances: 5, bestResult: "ベスト16（2014）", flag: "🇩🇿" },
  { name: "オーストリア", code: "AUT", group: "J", fifaRanking: 25, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 8, bestResult: "3位（1954）", flag: "🇦🇹" },
  { name: "ヨルダン", code: "JOR", group: "J", fifaRanking: 64, region: "AFC", regionLabel: "アジア", wcAppearances: 1, bestResult: "初出場", flag: "🇯🇴" },

  // --- グループ K ---
  { name: "ポルトガル", code: "POR", group: "K", fifaRanking: 5, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 9, bestResult: "3位（1966）", flag: "🇵🇹" },
  { name: "ウズベキスタン", code: "UZB", group: "K", fifaRanking: 51, region: "AFC", regionLabel: "アジア", wcAppearances: 1, bestResult: "初出場", flag: "🇺🇿" },
  { name: "コロンビア", code: "COL", group: "K", fifaRanking: 13, region: "CONMEBOL", regionLabel: "南米", wcAppearances: 7, bestResult: "ベスト8（2014）", flag: "🇨🇴" },
  { name: "ジャマイカ", code: "JAM", group: "K", fifaRanking: 62, region: "CONCACAF", regionLabel: "北中米カリブ海", wcAppearances: 2, bestResult: "GL敗退（1998）", flag: "🇯🇲" },

  // --- グループ L ---
  { name: "イングランド", code: "ENG", group: "L", fifaRanking: 4, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 17, bestResult: "優勝（1966）", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { name: "ガーナ", code: "GHA", group: "L", fifaRanking: 72, region: "CAF", regionLabel: "アフリカ", wcAppearances: 5, bestResult: "ベスト8（2010）", flag: "🇬🇭" },
  { name: "パナマ", code: "PAN", group: "L", fifaRanking: 34, region: "CONCACAF", regionLabel: "北中米カリブ海", wcAppearances: 3, bestResult: "GL敗退（2018, 2026）", flag: "🇵🇦" },
  { name: "クロアチア", code: "CRO", group: "L", fifaRanking: 11, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 7, bestResult: "準優勝（2018）", flag: "🇭🇷" },
];

// ========================================
// ユーティリティ関数
// ========================================

export function getTeamsByGroup(group: string): Team[] {
  return allTeams.filter((t) => t.group === group);
}

export function getTeamsByRegion(region: string): Team[] {
  return allTeams.filter((t) => t.region === region);
}

export function getTeamByName(name: string): Team | undefined {
  return allTeams.find((t) => t.name === name);
}

export function getConfirmedTeams(): Team[] {
  return allTeams.filter((t) => !t.isPlaceholder);
}

export const regions = [
  { id: "UEFA", label: "ヨーロッパ (UEFA)" },
  { id: "CONMEBOL", label: "南米 (CONMEBOL)" },
  { id: "CONCACAF", label: "北中米カリブ海 (CONCACAF)" },
  { id: "CAF", label: "アフリカ (CAF)" },
  { id: "AFC", label: "アジア (AFC)" },
  { id: "OFC", label: "オセアニア (OFC)" },
];
