// ========================================
// 日本代表 W杯2026 メンバー（26名）
// ========================================
// メンバー発表会見：2026年5月15日（金）14:00 JFAハウス
// 現在は本紙予想（2026-04-25時点）。発表後は phase: "official" に切り替え、
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
    comment: "カタール経験の控え、国内GKのセカンド",
  },
  {
    name: "早川友基",
    position: "GK",
    club: "鹿島アントラーズ",
    league: "Jリーグ",
    comment: "3番手争いを抜け出し第三GKを確保",
  },

  // ─── DF 8 ───
  {
    name: "板倉滉",
    position: "DF",
    club: "ボルシアMG",
    league: "ブンデスリーガ（独）",
    comment: "3バック中央、守備の大黒柱",
  },
  {
    name: "冨安健洋",
    position: "DF",
    club: "アーセナル",
    league: "プレミアリーグ（英）",
    comment: "復帰後即レギュラー、3バック右",
  },
  {
    name: "町田浩樹",
    position: "DF",
    club: "ユニオンSG",
    league: "ジュピラー・プロ・リーグ（ベルギー）",
    comment: "3バック左、欧州移籍で急成長",
  },
  {
    name: "谷口彰悟",
    position: "DF",
    club: "アルラヤン",
    league: "QSL（カタール）",
    columnSlug: "taniguchi-shogo-japan-column-2026",
    comment: "ベテランの経験でCB陣を補完",
  },
  {
    name: "菅原由勢",
    position: "DF",
    club: "サウサンプトン",
    league: "プレミアリーグ（英）",
    comment: "右WB第一候補",
  },
  {
    name: "伊藤洋輝",
    position: "DF",
    club: "バイエルン・ミュンヘン",
    league: "ブンデスリーガ（独）",
    comment: "左WB／CB兼任、バイエルンで経験値",
  },
  {
    name: "瀬古歩夢",
    position: "DF",
    club: "グラスホッパー",
    league: "スーパーリーグ（スイス）",
    comment: "CB第4枚、若手突き上げ",
  },
  {
    name: "長友佑都",
    position: "DF",
    club: "FC東京",
    league: "Jリーグ",
    badge: "衝撃の予想復帰",
    comment: "39歳レジェンド、W杯5度目へ。左SBバックアップと精神的支柱",
  },
  {
    name: "鈴木淳之介",
    position: "DF",
    club: "FCコペンハーゲン",
    league: "スーペルリーガ（デンマーク）",
    badge: "電撃抜擢",
    comment: "ブラジル戦で安定感のある対応を見せた22歳、左利きCB／SBのマルチロール",
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
    club: "フェイエノールト",
    league: "エールディヴィジ（蘭）",
    comment: "ボランチのポリバレント",
  },
  {
    name: "大橋祐紀",
    position: "MF",
    club: "ブラックバーン",
    league: "チャンピオンシップ（英2部）",
    badge: "電撃選出",
    comment: "英チャンピオンシップで得点を重ねる左WG／セカンドストライカー",
  },
  {
    name: "三笘薫",
    position: "MF",
    club: "ブライトン",
    league: "プレミアリーグ（英）",
    columnSlug: "mitoma-kaoru-column-2026-04-20",
    comment: "左WG／シャドー、攻撃の最大の武器（イングランド戦決勝弾）",
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
    league: "リーグ・アン（仏）",
    columnSlug: "player-story-keito-nakamura",
    comment: "左WG、シャドーでの躍動",
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
    comment: "スピードタイプ、ハイプレス要員",
  },
  {
    name: "小川航基",
    position: "FW",
    club: "NECナイメヘン",
    league: "エールディヴィジ（蘭）",
    comment: "ポスト型2番手、2024年以降躍進",
  },
];

/**
 * 予想落選した主軸選手（ボーダーラインから外れると予想）。
 * 発表後は実際の落選者で書き換える。
 */
export const predictedExclusions: { name: string; club: string; reason: string }[] = [
  {
    name: "遠藤航",
    club: "リヴァプール（英）",
    reason: "33歳。リヴァプールで出場機会激減、4月遠征メンバー外。佐野海舟・守田・田中碧が中盤の軸に",
  },
  {
    name: "南野拓実",
    club: "モナコ（仏）",
    reason: "2025-26で出場時間激減。中村敬斗・堂安律が左右シャドーの序列を上げて押し出される",
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
    reason: "大橋祐紀の電撃選出により左サイド攻撃要員枠から押し出される",
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
