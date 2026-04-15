export interface Team {
  name: string;
  code: string;
  group: string;
  fifaRanking: number;
  fifaPoints: number;
  fifaPrevPoints: number;
  region: string;
  regionLabel: string;
  wcAppearances: number;
  bestResult: string;
  flag: string;
  isPlaceholder?: boolean;
}

// ========================================
// 全48チーム（2026年4月15日更新 / FIFAランキング2026年4月1日付準拠 / JAM→COD差し替え、監督情報更新）
// ========================================

export const allTeams: Team[] = [
  // --- グループ A ---
  { name: "メキシコ", code: "MEX", group: "A", fifaRanking: 15, fifaPoints: 1681.03, fifaPrevPoints: 1676, region: "CONCACAF", regionLabel: "北中米カリブ海", wcAppearances: 17, bestResult: "ベスト8（1970, 1986）", flag: "🇲🇽" },
  { name: "韓国", code: "KOR", group: "A", fifaRanking: 25, fifaPoints: 1588.67, fifaPrevPoints: 1599, region: "AFC", regionLabel: "アジア", wcAppearances: 11, bestResult: "4位（2002）", flag: "🇰🇷" },
  { name: "南アフリカ", code: "RSA", group: "A", fifaRanking: 59, fifaPoints: 1429.73, fifaPrevPoints: 1433, region: "CAF", regionLabel: "アフリカ", wcAppearances: 4, bestResult: "GL敗退（1998-2010）", flag: "🇿🇦" },
  { name: "チェコ", code: "CZE", group: "A", fifaRanking: 41, fifaPoints: 1513.74, fifaPrevPoints: 1487, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 2, bestResult: "準優勝（1962 ※チェコスロバキア時代）", flag: "🇨🇿" },

  // --- グループ B ---
  { name: "カナダ", code: "CAN", group: "B", fifaRanking: 30, fifaPoints: 1556.48, fifaPrevPoints: 1559, region: "CONCACAF", regionLabel: "北中米カリブ海", wcAppearances: 3, bestResult: "GL敗退（1986, 2022）", flag: "🇨🇦" },
  { name: "カタール", code: "QAT", group: "B", fifaRanking: 55, fifaPoints: 1454.96, fifaPrevPoints: 1455, region: "AFC", regionLabel: "アジア", wcAppearances: 2, bestResult: "GL敗退（2022）", flag: "🇶🇦" },
  { name: "スイス", code: "SUI", group: "B", fifaRanking: 19, fifaPoints: 1649.40, fifaPrevPoints: 1655, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 13, bestResult: "ベスト8（1934-1954）", flag: "🇨🇭" },
  { name: "ボスニア・ヘルツェゴビナ", code: "BIH", group: "B", fifaRanking: 63, fifaPoints: 1398.23, fifaPrevPoints: 1362, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 1, bestResult: "初出場", flag: "🇧🇦" },

  // --- グループ C ---
  { name: "ブラジル", code: "BRA", group: "C", fifaRanking: 6, fifaPoints: 1761.16, fifaPrevPoints: 1760, region: "CONMEBOL", regionLabel: "南米", wcAppearances: 23, bestResult: "優勝（1958-2002・5回）", flag: "🇧🇷" },
  { name: "ハイチ", code: "HAI", group: "C", fifaRanking: 83, fifaPoints: 1291.71, fifaPrevPoints: 1294, region: "CONCACAF", regionLabel: "北中米カリブ海", wcAppearances: 2, bestResult: "GL敗退（1974）", flag: "🇭🇹" },
  { name: "スコットランド", code: "SCO", group: "C", fifaRanking: 43, fifaPoints: 1498.35, fifaPrevPoints: 1507, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 9, bestResult: "GL敗退（1954-1998）", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { name: "モロッコ", code: "MAR", group: "C", fifaRanking: 8, fifaPoints: 1756.80, fifaPrevPoints: 1737, region: "CAF", regionLabel: "アフリカ", wcAppearances: 7, bestResult: "4位（2022）", flag: "🇲🇦" },

  // --- グループ D ---
  { name: "アメリカ", code: "USA", group: "D", fifaRanking: 16, fifaPoints: 1673.13, fifaPrevPoints: 1682, region: "CONCACAF", regionLabel: "北中米カリブ海", wcAppearances: 12, bestResult: "ベスト8（1930, 2002）", flag: "🇺🇸" },
  { name: "パラグアイ", code: "PAR", group: "D", fifaRanking: 40, fifaPoints: 1503.51, fifaPrevPoints: 1502, region: "CONMEBOL", regionLabel: "南米", wcAppearances: 9, bestResult: "ベスト8（2010）", flag: "🇵🇾" },
  { name: "オーストラリア", code: "AUS", group: "D", fifaRanking: 27, fifaPoints: 1580.68, fifaPrevPoints: 1574, region: "AFC", regionLabel: "アジア", wcAppearances: 6, bestResult: "ベスト16（2006, 2022）", flag: "🇦🇺" },
  { name: "トルコ", code: "TUR", group: "D", fifaRanking: 22, fifaPoints: 1599.03, fifaPrevPoints: 1583, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 3, bestResult: "3位（2002）", flag: "🇹🇷" },

  // --- グループ E ---
  { name: "ドイツ", code: "GER", group: "E", fifaRanking: 10, fifaPoints: 1730.37, fifaPrevPoints: 1724, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 21, bestResult: "優勝（1954-2014・4回）", flag: "🇩🇪" },
  { name: "コートジボワール", code: "CIV", group: "E", fifaRanking: 34, fifaPoints: 1532.97, fifaPrevPoints: 1522, region: "CAF", regionLabel: "アフリカ", wcAppearances: 4, bestResult: "GL敗退（2006-2014）", flag: "🇨🇮" },
  { name: "エクアドル", code: "ECU", group: "E", fifaRanking: 23, fifaPoints: 1594.79, fifaPrevPoints: 1592, region: "CONMEBOL", regionLabel: "南米", wcAppearances: 5, bestResult: "ベスト16（2006）", flag: "🇪🇨" },
  { name: "キュラソー", code: "CUW", group: "E", fifaRanking: 82, fifaPoints: 1294.66, fifaPrevPoints: 1303, region: "CONCACAF", regionLabel: "北中米カリブ海", wcAppearances: 1, bestResult: "初出場", flag: "🇨🇼" },

  // --- グループ F（日本所属）---
  { name: "オランダ", code: "NED", group: "F", fifaRanking: 7, fifaPoints: 1757.87, fifaPrevPoints: 1756, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 12, bestResult: "準優勝（1974-2010・3回）", flag: "🇳🇱" },
  { name: "日本", code: "JPN", group: "F", fifaRanking: 18, fifaPoints: 1660.43, fifaPrevPoints: 1650, region: "AFC", regionLabel: "アジア", wcAppearances: 8, bestResult: "ベスト16（2002-2022）", flag: "🇯🇵" },
  { name: "チュニジア", code: "TUN", group: "F", fifaRanking: 44, fifaPoints: 1483.05, fifaPrevPoints: 1479, region: "CAF", regionLabel: "アフリカ", wcAppearances: 7, bestResult: "GL敗退（1978-2022）", flag: "🇹🇳" },
  { name: "スウェーデン", code: "SWE", group: "F", fifaRanking: 38, fifaPoints: 1514.77, fifaPrevPoints: 1487, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 14, bestResult: "準優勝（1958）", flag: "🇸🇪" },

  // --- グループ G ---
  { name: "イラン", code: "IRN", group: "G", fifaRanking: 21, fifaPoints: 1615.30, fifaPrevPoints: 1617, region: "AFC", regionLabel: "アジア", wcAppearances: 7, bestResult: "GL敗退（1978-2022）", flag: "🇮🇷" },
  { name: "ベルギー", code: "BEL", group: "G", fifaRanking: 9, fifaPoints: 1734.72, fifaPrevPoints: 1731, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 15, bestResult: "3位（2018）", flag: "🇧🇪" },
  { name: "エジプト", code: "EGY", group: "G", fifaRanking: 29, fifaPoints: 1563.24, fifaPrevPoints: 1557, region: "CAF", regionLabel: "アフリカ", wcAppearances: 4, bestResult: "GL敗退（1934-2018）", flag: "🇪🇬" },
  { name: "ニュージーランド", code: "NZL", group: "G", fifaRanking: 85, fifaPoints: 1281.57, fifaPrevPoints: 1279, region: "OFC", regionLabel: "オセアニア", wcAppearances: 3, bestResult: "GL敗退（1982-2010）", flag: "🇳🇿" },

  // --- グループ H ---
  { name: "スペイン", code: "ESP", group: "H", fifaRanking: 2, fifaPoints: 1876.40, fifaPrevPoints: 1877, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 17, bestResult: "優勝（2010）", flag: "🇪🇸" },
  { name: "サウジアラビア", code: "KSA", group: "H", fifaRanking: 61, fifaPoints: 1421.43, fifaPrevPoints: 1429, region: "AFC", regionLabel: "アジア", wcAppearances: 7, bestResult: "ベスト16（1994）", flag: "🇸🇦" },
  { name: "ウルグアイ", code: "URU", group: "H", fifaRanking: 17, fifaPoints: 1673.07, fifaPrevPoints: 1673, region: "CONMEBOL", regionLabel: "南米", wcAppearances: 15, bestResult: "優勝（1930, 1950）", flag: "🇺🇾" },
  { name: "カーボベルデ", code: "CPV", group: "H", fifaRanking: 68, fifaPoints: 1371.13, fifaPrevPoints: 1370, region: "CAF", regionLabel: "アフリカ", wcAppearances: 1, bestResult: "初出場", flag: "🇨🇻" },

  // --- グループ I ---
  { name: "フランス", code: "FRA", group: "I", fifaRanking: 1, fifaPoints: 1877.32, fifaPrevPoints: 1870, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 17, bestResult: "優勝（1998, 2018）", flag: "🇫🇷" },
  { name: "セネガル", code: "SEN", group: "I", fifaRanking: 14, fifaPoints: 1691.97, fifaPrevPoints: 1707, region: "CAF", regionLabel: "アフリカ", wcAppearances: 4, bestResult: "ベスト8（2002）", flag: "🇸🇳" },
  { name: "ノルウェー", code: "NOR", group: "I", fifaRanking: 31, fifaPoints: 1550.95, fifaPrevPoints: 1553, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 4, bestResult: "ベスト16（1998）", flag: "🇳🇴" },
  { name: "ボリビア", code: "BOL", group: "I", fifaRanking: 76, fifaPoints: 1329.41, fifaPrevPoints: 1331, region: "CONMEBOL", regionLabel: "南米", wcAppearances: 4, bestResult: "GL敗退（1930-1994）", flag: "🇧🇴" },

  // --- グループ J ---
  { name: "アルゼンチン", code: "ARG", group: "J", fifaRanking: 3, fifaPoints: 1874.82, fifaPrevPoints: 1873, region: "CONMEBOL", regionLabel: "南米", wcAppearances: 19, bestResult: "優勝（1978-2022・3回）", flag: "🇦🇷" },
  { name: "アルジェリア", code: "ALG", group: "J", fifaRanking: 28, fifaPoints: 1564.26, fifaPrevPoints: 1561, region: "CAF", regionLabel: "アフリカ", wcAppearances: 5, bestResult: "ベスト16（2014）", flag: "🇩🇿" },
  { name: "オーストリア", code: "AUT", group: "J", fifaRanking: 24, fifaPoints: 1593.45, fifaPrevPoints: 1586, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 8, bestResult: "3位（1954）", flag: "🇦🇹" },
  { name: "ヨルダン", code: "JOR", group: "J", fifaRanking: 64, fifaPoints: 1391.45, fifaPrevPoints: 1389, region: "AFC", regionLabel: "アジア", wcAppearances: 1, bestResult: "初出場", flag: "🇯🇴" },

  // --- グループ K ---
  { name: "ポルトガル", code: "POR", group: "K", fifaRanking: 5, fifaPoints: 1763.83, fifaPrevPoints: 1760, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 9, bestResult: "3位（1966）", flag: "🇵🇹" },
  { name: "ウズベキスタン", code: "UZB", group: "K", fifaRanking: 50, fifaPoints: 1469.40, fifaPrevPoints: 1462, region: "AFC", regionLabel: "アジア", wcAppearances: 1, bestResult: "初出場", flag: "🇺🇿" },
  { name: "コロンビア", code: "COL", group: "K", fifaRanking: 13, fifaPoints: 1693.09, fifaPrevPoints: 1701, region: "CONMEBOL", regionLabel: "南米", wcAppearances: 7, bestResult: "ベスト8（2014）", flag: "🇨🇴" },
  { name: "コンゴ民主共和国", code: "COD", group: "K", fifaRanking: 46, fifaPoints: 1480.00, fifaPrevPoints: 1475, region: "CAF", regionLabel: "アフリカ", wcAppearances: 2, bestResult: "GL敗退（1974 ※ザイール時代）", flag: "🇨🇩" },

  // --- グループ L ---
  { name: "イングランド", code: "ENG", group: "L", fifaRanking: 4, fifaPoints: 1825.97, fifaPrevPoints: 1834, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 17, bestResult: "優勝（1966）", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { name: "ガーナ", code: "GHA", group: "L", fifaRanking: 73, fifaPoints: 1346.31, fifaPrevPoints: 1351, region: "CAF", regionLabel: "アフリカ", wcAppearances: 5, bestResult: "ベスト8（2010）", flag: "🇬🇭" },
  { name: "パナマ", code: "PAN", group: "L", fifaRanking: 33, fifaPoints: 1540.64, fifaPrevPoints: 1539, region: "CONCACAF", regionLabel: "北中米カリブ海", wcAppearances: 3, bestResult: "GL敗退（2018, 2026）", flag: "🇵🇦" },
  { name: "クロアチア", code: "CRO", group: "L", fifaRanking: 11, fifaPoints: 1717.06, fifaPrevPoints: 1717, region: "UEFA", regionLabel: "ヨーロッパ", wcAppearances: 7, bestResult: "準優勝（2018）", flag: "🇭🇷" },
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
