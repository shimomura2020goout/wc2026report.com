// ========================================
// 日本代表 W杯2026 メンバー（26名）
// ========================================
// メンバー発表会見：2026年5月15日（金）14:00 JFAハウス
// 2026-05-15 に公式発表を反映（scripts/updateOfficialSquad.ts による自動更新）

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
export const SQUAD_PHASE: "prediction" | "official" = "official";

/**
 * 公式26名（2026-05-15 JFA発表反映）
 */
export const playerSquad: SquadPlayer[] = [
  // ─── GK 3 ───
  {
    name: "鈴木彩艶",
    position: "GK",
    club: "パルマ",
    league: "セリエA（伊）",
    columnSlug: "player-story-zion-suzuki",
    comment: "セリエAで正GKを掴んだ守護神。シュートストップとビルドアップに優れ、北中米W杯の絶対的1番手として大会へ",
  },
  {
    name: "大迫敬介",
    position: "GK",
    club: "サンフレッチェ広島",
    league: "Jリーグ",
    columnSlug: "osako-keisuke-japan-column-2026",
    comment: "国内組セカンドGK。2024年J1ベストイレブン、E-1選手権2025最優秀GK受賞の経験豊富な守護神",
  },
  {
    name: "早川友基",
    position: "GK",
    club: "鹿島アントラーズ",
    league: "Jリーグ",
    columnSlug: "hayakawa-tomoki-japan-column-2026",
    comment: "第三GKの座を確保。2025 J1MVP・鹿島9年ぶりのリーグ優勝に貢献した実力派",
  },

  // ─── DF 9 ───
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
    comment: "復帰後即レギュラー、3バック右。2025/12 にアーセナル→アヤックスへ加入",
  },
  {
    name: "谷口彰悟",
    position: "DF",
    club: "シント＝トロイデンVV",
    league: "ジュピラー・プロ・リーグ（ベルギー）",
    columnSlug: "taniguchi-shogo-japan-column-2026",
    comment: "34歳のベテランCB。2024/7 にアル・ラーヤン→STVV、25/26シーズン新キャプテン就任",
  },
  {
    name: "菅原由勢",
    position: "DF",
    club: "ヴェルダー・ブレーメン",
    league: "ブンデスリーガ（独）",
    columnSlug: "sugawara-yukinari-japan-column-2026",
    comment: "右WBの第一候補。2025/8 にサウサンプトン→ブレーメンへ期限付き移籍",
  },
  {
    name: "伊藤洋輝",
    position: "DF",
    club: "バイエルン・ミュンヘン",
    league: "ブンデスリーガ（独）",
    columnSlug: "ito-hiroki-japan-column-2026",
    comment: "左WB／CB兼任、バイエルンでブンデスリーガ2連覇に貢献",
  },
  {
    name: "瀬古歩夢",
    position: "DF",
    club: "ル・アーヴルAC",
    league: "リーグ・アン（仏）",
    columnSlug: "seko-ayumu-japan-column-2026",
    comment: "CB第4枚として若手突き上げ。2025/7 にグラスホッパー→ル・アーヴルへ移籍（クラブ史上初の日本人）",
  },
  {
    name: "長友佑都",
    position: "DF",
    club: "FC東京",
    league: "Jリーグ",
    columnSlug: "nagatomo-yuto-japan-column-2026",
    badge: "衝撃の予想復帰",
    comment: "39歳のレジェンド、W杯5度目の出場へ。左SBバックアップと精神的支柱として最終枠に滑り込み",
  },
  {
    name: "鈴木淳之介",
    position: "DF",
    club: "FCコペンハーゲン",
    league: "スーペルリーガ（デンマーク）",
    columnSlug: "suzuki-junnosuke-japan-column-2026",
    badge: "電撃抜擢",
    comment: "22歳の電撃抜擢。ブラジル戦で左CB先発しチェルシーのエステバンを完封、CL本戦7試合経験",
  },
  {
    name: "渡辺剛",
    position: "DF",
    club: "フェイエノールト",
    league: "エールディヴィジ（蘭）",
    badge: "町田負傷代替",
    comment: "上田綺世とともにフェイエノールトでプレー。3/31イングランド戦CB先発・代表アピール成功。町田負傷の3バック左候補として急浮上し選出",
  },

  // ─── MF 9 ───
  {
    name: "遠藤航",
    position: "MF",
    club: "リヴァプール",
    league: "プレミアリーグ（英）",
    columnSlug: "endo-wataru-japan-column-2026",
    badge: "滑り込み選出",
    comment: "33歳キャプテン。リヴァプールでローテーション起用ながら、佐野・守田の経験を補う精神的支柱として土壇場で復帰",
  },
  {
    name: "伊東純也",
    position: "MF",
    club: "KRCヘンク",
    league: "ジュピラー・プロ・リーグ（ベルギー）",
    columnSlug: "ito-junya-japan-column-2026",
    comment: "右WBの切り札、スコットランド戦決勝弾。2025年8月にランス→ヘンクへ復帰",
  },
  {
    name: "堂安律",
    position: "MF",
    club: "フランクフルト",
    league: "ブンデスリーガ（独）",
    columnSlug: "doan-ritsu-japan-column-2026-04-21",
    comment: "右WG／シャドー、勝負強い決定力。ブンデスリーガで安定した出場機会を確保",
  },
  {
    name: "田中碧",
    position: "MF",
    club: "リーズ",
    league: "プレミアリーグ（英）",
    columnSlug: "tanaka-ao-japan-column-2026",
    comment: "ボランチ、配球の起点。プレミアリーグ昇格組リーズで主力としてプレー",
  },
  {
    name: "鎌田大地",
    position: "MF",
    club: "クリスタル・パレス",
    league: "プレミアリーグ（英）",
    columnSlug: "kamada-daichi-japan-column-2026",
    comment: "トップ下、攻撃のタクト役。プレミアでフィットしさらに得点力に磨き",
  },
  {
    name: "中村敬斗",
    position: "MF",
    club: "スタッド・ランス",
    league: "リーグ・ドゥ（仏2部）",
    columnSlug: "player-story-keito-nakamura",
    comment: "左WG、シャドーでの躍動。ランスは24/25で2部降格し25/26はリーグ・ドゥで戦う",
  },
  {
    name: "佐野海舟",
    position: "MF",
    club: "マインツ",
    league: "ブンデスリーガ（独）",
    columnSlug: "sano-kaishu-japan-column-2026",
    comment: "守備的MF、遠藤の抜けた穴を埋める存在として頭角を現した中盤の新エンジン",
  },
  {
    name: "久保建英",
    position: "MF",
    club: "レアル・ソシエダ",
    league: "ラ・リーガ（西）",
    columnSlug: "player-story-takefusa-kubo",
    comment: "右WG／シャドー、創造性の象徴。スペインで主力としてプレー、日本攻撃の起点",
  },
  {
    name: "鈴木唯人",
    position: "MF",
    club: "SCフライブルク",
    league: "ブンデスリーガ（独）",
    comment: "23歳。5/13に鎖骨骨折の手術を受けたばかりだが、ブレンビーで2年間21得点の活躍を経てフライブルク移籍を決めた攻撃的MF。本大会復帰を見越して滑り込み選出",
  },

  // ─── FW 5 ───
  {
    name: "上田綺世",
    position: "FW",
    club: "フェイエノールト",
    league: "エールディヴィジ（蘭）",
    columnSlug: "ayase-ueda-japan-column-2026",
    comment: "1トップ本命。フェイエノールトでエール得点ランク上位、ポストと裏抜けを兼ね備える絶対的エース",
  },
  {
    name: "前田大然",
    position: "FW",
    club: "セルティック",
    league: "プレミアシップ（スコットランド）",
    columnSlug: "maeda-daizen-japan-column-2026",
    comment: "ハイプレスの先導役。24/25キャリアハイ33得点でプレミアシップMVP",
  },
  {
    name: "小川航基",
    position: "FW",
    club: "NECナイメヘン",
    league: "エールディヴィジ（蘭）",
    columnSlug: "ogawa-koki-japan-column-2026",
    comment: "ポスト型2番手、最終予選6戦4ゴール得点ランクトップ。中国戦ヘッドで2得点",
  },
  {
    name: "塩貝健人",
    position: "FW",
    club: "VfLヴォルフスブルク",
    league: "ブンデスリーガ（独）",
    comment: "23歳。慶大退部から欧州5大リーグへ駆け上がった異色の経歴。2026/1にNEC→ヴォルフスブルクへ18億円規模で完全移籍した若き“最強の負けず嫌い”がW杯本大会の切り札に",
  },
  {
    name: "後藤啓介",
    position: "FW",
    club: "シント＝トロイデンVV",
    league: "ジュピラー・プロ・リーグ（ベルギー）",
    comment: "20歳。アンデルレヒトから期限付き移籍中のSTVVで25/26シーズン2桁ゴール、所属元との対戦で決勝弾を奪うなどの活躍。代表初選出から半年で本大会切符を掴んだ未来のエース候補",
  },
];

/**
 * 公式発表後は previousPrediction として保持（記録／SEO継続）
 * 直前の本紙予想26名との差分は記事側で扱う
 */
export const previousPrediction: { name: string; club: string; reason: string }[] = [];

/**
 * 後方互換用エイリアス（既存コードが参照しているため残す）
 */
export const predictedExclusions = previousPrediction;

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
