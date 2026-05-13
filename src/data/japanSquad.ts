// ========================================
// 日本代表 W杯2026 メンバー（26名）
// ========================================
// メンバー発表会見：2026年5月15日（金）14:00 JFAハウス
// 現在は本紙予想（2026-05-13時点 最新版）。発表後は phase: "official" に切り替え、
// 公式26名で playerSquad を更新する。
//
// データソース：
// - 予想記事「【速報予告・本紙予想26名公開】」(slug: japan-squad-announcement-may-15-2026)

export type SquadPosition = "GK" | "DF" | "MF" | "FW";

export interface SquadPlayer {
  name: string;
  position: SquadPosition;
  club: string;
  league: string;
  /** 既存「選手の素顔」コラム slug（あれば内部リンク表示） */
  columnSlug?: string;
  /** 注目バッジ：「衝撃の予想復帰」「電撃抜擢」など */
  badge?: string;
  /** 簡易プロフィールコメント */
  comment: string;
}

/** メンバー発表会見：2026年5月15日（金）14:00 JST */
export const SQUAD_ANNOUNCEMENT_AT = "2026-05-15T14:00:00+09:00";

/** 現フェーズ。発表後に "official" に切り替え。 */
export const SQUAD_PHASE: "prediction" | "official" = "prediction";

/**
 * 本紙予想26名（2026-04-25 公開）。
 * 発表後は公式26名で書き換え、SQUAD_PHASE を "official" に変更すること。
 */
export const playerSquad: SquadPlayer[] = [
  // ─── GK 3 ───
  {
    name: "鈴木彩艶",
    position: "GK",
    club: "パルマ",
    league: "セリエA（伊）",
    columnSlug: "player-story-zion-suzuki",
    comment: "セリエAで正GK、守護神の座ほぼ確定",
  },
  {
    name: "大迫敬介",
    position: "GK",
    club: "サンフレッチェ広島",
    league: "Jリーグ",
    columnSlug: "osako-keisuke-japan-column-2026",
    comment: "国内GKのセカンド、2024年J1ベストイレブン・E-1選手権2025最優秀GK受賞",
  },
  {
    name: "早川友基",
    position: "GK",
    club: "鹿島アントラーズ",
    league: "Jリーグ",
    columnSlug: "hayakawa-tomoki-japan-column-2026",
    comment: "3番手争いを抜け出し第三GKを確保。2025 J1MVP・鹿島9年ぶりのリーグ優勝に貢献",
  },

  // ─── DF 8 ───
  {
    name: "板倉滉",
    position: "DF",
    club: "アヤックス・アムステルダム",
    league: "エールディヴィジ（蘭）",
    columnSlug: "itakura-ko-japan-column-2026",
    comment: "3バック中央、守備の大黒柱。2025/8 にボルシアMG→アヤックス（史上初の日本人）",
  },
  {
    name: "冨安健洋",
    position: "DF",
    club: "アヤックス・アムステルダム",
    league: "エールディヴィジ（蘭）",
    columnSlug: "tomiyasu-takehiro-japan-column-2026",
    comment: "復帰後即レギュラー、3バック右。2025/12 にアーセナル→アヤックスへ（半年契約）",
  },
  {
    name: "渡辺剛",
    position: "DF",
    club: "フェイエノールト",
    league: "エールディヴィジ（蘭）",
    badge: "町田負傷代替",
    comment: "上田綺世とともにフェイエノールトでプレー。3/31イングランド戦CB先発、4/29-5/4節でCBヘディングゴールも記録し代表アピール成功。町田負傷の3バック左候補として急浮上",
  },
  {
    name: "谷口彰悟",
    position: "DF",
    club: "シント＝トロイデンVV",
    league: "ジュピラー・プロ・リーグ（ベルギー）",
    columnSlug: "taniguchi-shogo-japan-column-2026",
    comment: "34歳。2024/7 にアル・ラーヤン→STVV、25/26シーズン新キャプテン就任。ベテランの経験でCB陣を補完",
  },
  {
    name: "菅原由勢",
    position: "DF",
    club: "ヴェルダー・ブレーメン",
    league: "ブンデスリーガ（独）",
    columnSlug: "sugawara-yukinari-japan-column-2026",
    comment: "右WB第一候補。2025/8 にサウサンプトン→ブレーメンへ期限付き移籍",
  },
  {
    name: "伊藤洋輝",
    position: "DF",
    club: "バイエルン・ミュンヘン",
    league: "ブンデスリーガ（独）",
    columnSlug: "ito-hiroki-japan-column-2026",
    comment: "左WB／CB兼任、バイエルンで2連覇に貢献",
  },
  {
    name: "瀬古歩夢",
    position: "DF",
    club: "ル・アーヴルAC",
    league: "リーグ・アン（仏）",
    columnSlug: "seko-ayumu-japan-column-2026",
    comment: "CB第4枚、若手突き上げ。2025/7 にグラスホッパー→ル・アーヴルへ移籍（クラブ史上初の日本人）",
  },
  {
    name: "長友佑都",
    position: "DF",
    club: "FC東京",
    league: "Jリーグ",
    columnSlug: "nagatomo-yuto-japan-column-2026",
    badge: "衝撃の予想復帰",
    comment: "39歳レジェンド、W杯5度目へ。左SBバックアップと精神的支柱",
  },
  {
    name: "鈴木淳之介",
    position: "DF",
    club: "FCコペンハーゲン",
    league: "スーペルリーガ（デンマーク）",
    columnSlug: "suzuki-junnosuke-japan-column-2026",
    badge: "電撃抜擢",
    comment: "ブラジル戦で左CB先発しチェルシーのエステバンを完封した22歳、CL本戦7試合経験",
  },

  // ─── MF 11 ───
  {
    name: "守田英正",
    position: "MF",
    club: "スポルティングCP",
    league: "プリメイラ・リーガ（葡）",
    columnSlug: "morita-hidemasa-japan-column-2026",
    comment: "インサイドハーフの軸、従来の中盤",
  },
  {
    name: "田中碧",
    position: "MF",
    club: "リーズ",
    league: "プレミアリーグ（英）",
    columnSlug: "tanaka-ao-japan-column-2026",
    comment: "ボランチ、配球の起点",
  },
  {
    name: "鎌田大地",
    position: "MF",
    club: "クリスタル・パレス",
    league: "プレミアリーグ（英）",
    columnSlug: "kamada-daichi-japan-column-2026",
    comment: "トップ下、得点力向上",
  },
  {
    name: "佐野海舟",
    position: "MF",
    club: "マインツ",
    league: "ブンデスリーガ（独）",
    columnSlug: "sano-kaishu-japan-column-2026",
    comment: "守備的MF、遠藤の抜けた穴を埋める存在",
  },
  {
    name: "藤田譲瑠チマ",
    position: "MF",
    club: "FCザンクト・パウリ",
    league: "ブンデスリーガ（独）",
    columnSlug: "fujita-joelchima-japan-column-2026",
    comment: "ボランチのポリバレント。2025年7月にフェイエノールト→ザンクト・パウリへ移籍",
  },
  {
    name: "遠藤航",
    position: "MF",
    club: "リヴァプール",
    league: "プレミアリーグ（英）",
    columnSlug: "endo-wataru-japan-column-2026",
    badge: "滑り込み選出",
    comment: "33歳キャプテン、土壇場で復帰。リヴァプールでローテーション起用も、佐野・守田・田中の経験不足を補う精神的支柱として5月13日時点で選出ラインへ滑り込む",
  },
  {
    name: "南野拓実",
    position: "MF",
    club: "モナコ",
    league: "リーグ・アン（仏）",
    columnSlug: "minamino-takumi-japan-column-2026",
    badge: "電撃選出",
    comment: "31歳。昨年12月から離脱中だったが5月にボール使った練習を再開し復帰へ前進。三笘の長期離脱（全治2カ月）を受け左シャドーの即戦力として電撃選出",
  },
  {
    name: "久保建英",
    position: "MF",
    club: "レアル・ソシエダ",
    league: "ラ・リーガ（西）",
    columnSlug: "player-story-takefusa-kubo",
    comment: "右WG／シャドー、創造性の象徴",
  },
  {
    name: "堂安律",
    position: "MF",
    club: "フランクフルト",
    league: "ブンデスリーガ（独）",
    columnSlug: "doan-ritsu-japan-column-2026-04-21",
    comment: "右WG／シャドー、得点力",
  },
  {
    name: "伊東純也",
    position: "MF",
    club: "KRCヘンク",
    league: "ジュピラー・プロ・リーグ（ベルギー）",
    columnSlug: "ito-junya-japan-column-2026",
    comment: "右WBの切り札、スコットランド戦決勝弾。2025年8月にヘンクへ復帰",
  },
  {
    name: "中村敬斗",
    position: "MF",
    club: "スタッド・ランス",
    league: "リーグ・ドゥ（仏2部）",
    columnSlug: "player-story-keito-nakamura",
    comment: "左WG、シャドーでの躍動。ランスは24/25で2部降格し25/26はリーグ・ドゥで戦う",
  },

  // ─── FW 4 ───
  {
    name: "上田綺世",
    position: "FW",
    club: "フェイエノールト",
    league: "エールディヴィジ（蘭）",
    columnSlug: "ayase-ueda-japan-column-2026",
    comment: "1トップ本命",
  },
  {
    name: "前田大然",
    position: "FW",
    club: "セルティック",
    league: "プレミアシップ（スコットランド）",
    columnSlug: "maeda-daizen-japan-column-2026",
    comment: "スピードタイプ、ハイプレス要員。24/25キャリアハイ33得点でプレミアシップMVP",
  },
  {
    name: "小川航基",
    position: "FW",
    club: "NECナイメヘン",
    league: "エールディヴィジ（蘭）",
    columnSlug: "ogawa-koki-japan-column-2026",
    comment: "ポスト型2番手、最終予選6戦4ゴール得点ランクトップ。中国戦ヘッドで2得点",
  },
];

/**
 * 予想落選した主軸選手（ボーダーラインから外れると予想）。
 * 発表後は実際の落選者で書き換える。
 */
export const predictedExclusions: { name: string; club: string; reason: string }[] = [
  {
    name: "三笘薫",
    club: "ブライトン（英）",
    reason: "5月9日のウルブス戦で左足を負傷し全治2カ月との診断。W杯GL初戦（6月15日）までの復帰は絶望的と判断され、森保監督が苦渋の非選出を決断する見込み",
  },
  {
    name: "町田浩樹",
    club: "TSG 1899ホッフェンハイム（独）",
    reason: "2025/8 開幕戦で左ヒザ前十字靭帯断裂、4月にチーム部分合流まで戻したが実戦感覚はまだ不十分。W杯本大会で90分稼働できる確証がなく、本紙は無念の非選出と予測。3バック左は渡辺剛が代替へ",
  },
  {
    name: "大橋祐紀",
    club: "ブラックバーン（英2部）",
    reason: "三笘の代役として一時候補に挙がるも、遠藤航の滑り込み選出と南野拓実の電撃復帰により26名の枠から押し出される",
  },
  {
    name: "橋岡大樹",
    club: "ルートン・タウン（英）",
    reason: "長友の予想復帰と菅原・伊藤洋輝の盤石ぶりでボーダーから外れる",
  },
  {
    name: "毎熊晟矢",
    club: "C大阪",
    reason: "鈴木淳之介の左利き＋マルチロールが評価され、国内組SBの最後の1枠を譲る",
  },
  {
    name: "旗手怜央",
    club: "セルティック",
    reason: "中盤・サイドのユーティリティだが、遠藤航と南野拓実の同時復活で攻撃ユニットの枠から押し出される",
  },
];

// ========================================
// ユーティリティ
// ========================================

export function squadByPosition(pos: SquadPosition): SquadPlayer[] {
  return playerSquad.filter((p) => p.position === pos);
}

export function squadCounts(): Record<SquadPosition, number> {
  return {
    GK: squadByPosition("GK").length,
    DF: squadByPosition("DF").length,
    MF: squadByPosition("MF").length,
    FW: squadByPosition("FW").length,
  };
}

export function columnsCoveredCount(): number {
  return playerSquad.filter((p) => p.columnSlug).length;
}
