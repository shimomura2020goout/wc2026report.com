// ========================================
// サッカーカレンダー イベントデータ
// W杯以外の主要サッカーイベント + プレーオフ等
// ========================================

export type EventCategory =
  | "worldcup"      // W杯本大会
  | "playoff"       // プレーオフ・大陸間PO
  | "japan"         // 日本代表（親善試合・キリンカップ等）
  | "club"          // クラブ大会（CL・EL等）
  | "international" // その他国際大会
  | "transfer"      // 移籍市場
  | "other";        // その他

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;   // YYYY-MM-DD
  endDate?: string;     // YYYY-MM-DD（期間イベント用）
  category: EventCategory;
  description?: string;
  isHighlight?: boolean; // カレンダー上で強調表示
  link?: string;         // 内部リンク
}

// カテゴリ表示情報
export const categoryConfig: Record<EventCategory, { label: string; color: string; bgColor: string; dotColor: string }> = {
  worldcup:      { label: "W杯本大会",       color: "text-amber-700",  bgColor: "bg-amber-100",  dotColor: "bg-amber-500" },
  playoff:       { label: "プレーオフ",        color: "text-orange-700", bgColor: "bg-orange-100", dotColor: "bg-orange-500" },
  japan:         { label: "日本代表",          color: "text-red-700",    bgColor: "bg-red-100",    dotColor: "bg-red-500" },
  club:          { label: "クラブ大会",        color: "text-blue-700",   bgColor: "bg-blue-100",   dotColor: "bg-blue-500" },
  international: { label: "国際大会",          color: "text-green-700",  bgColor: "bg-green-100",  dotColor: "bg-green-500" },
  transfer:      { label: "移籍マーケット",     color: "text-purple-700", bgColor: "bg-purple-100", dotColor: "bg-purple-500" },
  other:         { label: "その他",            color: "text-gray-700",   bgColor: "bg-gray-100",   dotColor: "bg-gray-400" },
};

// ========================================
// 2026年 主要サッカーイベント
// ========================================

export const calendarEvents: CalendarEvent[] = [
  // ── 3月：UEFAプレーオフ & 日本代表親善試合 ──
  {
    id: "evt-po-semi",
    title: "UEFA プレーオフ 準決勝【終了】",
    startDate: "2026-03-26",
    category: "playoff",
    description: "イタリア2-0北アイルランド、スウェーデン3-1ウクライナ（ギュレシュ3得点）、トルコ1-0ルーマニア、デンマーク4-0北マケドニア、ボスニアPK勝ち、コソボ4-3スロバキア、チェコPK勝ち、ポーランド2-1アルバニア",
    isHighlight: true,
  },
  {
    id: "evt-jp-sco",
    title: "🇯🇵 スコットランド 0-1 日本【勝利】",
    startDate: "2026-03-29",
    category: "japan",
    description: "伊東純也が84分に決勝ゴール！ハムデン・パーク（グラスゴー）でW杯前に白星",
    isHighlight: true,
    link: "/matches",
  },
  {
    id: "evt-po-final",
    title: "UEFA プレーオフ 決勝【終了】全4枠確定",
    startDate: "2026-03-31",
    category: "playoff",
    description: "スウェーデン3-2ポーランド（→日本と同組F）、トルコ1-0コソボ、チェコPK勝ちデンマーク、ボスニアPK勝ちイタリア（イタリア3大会連続不出場）",
    isHighlight: true,
  },

  // ── 4月：日本代表 & クラブ大会 ──
  {
    id: "evt-jp-eng",
    title: "🇯🇵 イングランド 0-1 日本【勝利】",
    startDate: "2026-04-01",
    category: "japan",
    description: "三笘薫23分決勝弾！アジア勢初のウェンブリー勝利。欧州遠征2連勝でW杯に弾み",
    isHighlight: true,
    link: "/news/england-vs-japan-result-april1",
  },
  {
    id: "evt-cl-qf",
    title: "UEFAチャンピオンズリーグ 準々決勝",
    startDate: "2026-04-07",
    endDate: "2026-04-16",
    category: "club",
    description: "CL準々決勝（1stレグ & 2ndレグ）",
  },
  {
    id: "evt-ipo",
    title: "FIFA 大陸間プレーオフ【終了】全48チーム確定",
    startDate: "2026-03-31",
    endDate: "2026-04-01",
    category: "playoff",
    description: "ジャマイカがDRコンゴを下しGroup Kへ（28年ぶり出場）、ボリビアがイラクを下しGroup Iへ（32年ぶり出場）。W杯2026全48チームが確定！",
    isHighlight: true,
  },

  // ── 5月：クラブ大会クライマックス ──
  {
    id: "evt-cl-sf",
    title: "UEFAチャンピオンズリーグ 準決勝",
    startDate: "2026-04-28",
    endDate: "2026-05-07",
    category: "club",
    description: "CL準決勝（1stレグ & 2ndレグ）",
  },
  {
    id: "evt-el-final",
    title: "UEFAヨーロッパリーグ 決勝",
    startDate: "2026-05-20",
    category: "club",
    description: "EL決勝",
  },
  {
    id: "evt-cl-final",
    title: "UEFAチャンピオンズリーグ 決勝",
    startDate: "2026-05-27",
    category: "club",
    description: "CL決勝。W杯に向けたクラブシーズン最後のビッグイベント",
    isHighlight: true,
  },
  {
    id: "evt-jp-kirin-may",
    title: "🇯🇵 日本 vs アイスランド（W杯壮行試合）",
    startDate: "2026-05-31",
    category: "japan",
    description: "キリンチャレンジカップ2026。W杯開幕約10日前の最終強化マッチ。19:20 KO 国立競技場",
    isHighlight: true,
    link: "/matches",
  },

  // ── 6月：W杯本大会 ──
  {
    id: "evt-wc-opening",
    title: "⚽ W杯2026 開幕（開幕戦）",
    startDate: "2026-06-11",
    category: "worldcup",
    description: "FIFA ワールドカップ 2026 開幕！メキシコシティで開幕戦",
    isHighlight: true,
    link: "/matches",
  },
  {
    id: "evt-wc-gl",
    title: "W杯 グループステージ",
    startDate: "2026-06-11",
    endDate: "2026-06-28",
    category: "worldcup",
    description: "グループステージ全72試合（12グループ×6試合）",
    link: "/matches",
  },
  {
    id: "evt-jp-ned",
    title: "🇯🇵 日本 vs オランダ（GL第1節）",
    startDate: "2026-06-15",
    category: "japan",
    description: "グループF 第1節。AT&Tスタジアム（ダラス）",
    isHighlight: true,
    link: "/matches",
  },
  {
    id: "evt-jp-tun",
    title: "🇯🇵 日本 vs チュニジア（GL第2節）",
    startDate: "2026-06-21",
    category: "japan",
    description: "グループF 第2節。エスタディオBBVA（モンテレイ）",
    isHighlight: true,
    link: "/matches",
  },
  {
    id: "evt-jp-pob",
    title: "🇯🇵 日本 vs スウェーデン（GL第3節）",
    startDate: "2026-06-26",
    category: "japan",
    description: "グループF 第3節。AT&Tスタジアム（ダラス）",
    isHighlight: true,
    link: "/matches",
  },

  // ── 7月：W杯ノックアウトステージ ──
  {
    id: "evt-wc-r32",
    title: "W杯 ラウンド32",
    startDate: "2026-06-29",
    endDate: "2026-07-04",
    category: "worldcup",
    description: "ラウンド32（16試合）",
    link: "/matches",
  },
  {
    id: "evt-wc-r16",
    title: "W杯 ラウンド16",
    startDate: "2026-07-05",
    endDate: "2026-07-08",
    category: "worldcup",
    description: "ラウンド16（8試合）",
    link: "/matches",
  },
  {
    id: "evt-wc-qf",
    title: "W杯 準々決勝",
    startDate: "2026-07-10",
    endDate: "2026-07-12",
    category: "worldcup",
    description: "準々決勝（4試合）",
    isHighlight: true,
    link: "/matches",
  },
  {
    id: "evt-wc-sf",
    title: "W杯 準決勝",
    startDate: "2026-07-15",
    endDate: "2026-07-16",
    category: "worldcup",
    description: "準決勝（2試合）",
    isHighlight: true,
    link: "/matches",
  },
  {
    id: "evt-wc-3rd",
    title: "W杯 3位決定戦",
    startDate: "2026-07-19",
    category: "worldcup",
    description: "3位決定戦。ハードロック・スタジアム（マイアミ）",
    link: "/matches",
  },
  {
    id: "evt-wc-final",
    title: "🏆 W杯2026 決勝",
    startDate: "2026-07-20",
    category: "worldcup",
    description: "FIFA ワールドカップ 2026 決勝。メットライフ・スタジアム（ニューヨーク）",
    isHighlight: true,
    link: "/matches",
  },

  // ── 夏の移籍市場 ──
  {
    id: "evt-transfer-summer",
    title: "夏の移籍ウィンドウ",
    startDate: "2026-07-01",
    endDate: "2026-08-31",
    category: "transfer",
    description: "主要リーグの夏の移籍市場。W杯での活躍が移籍に直結",
  },

  // ── 9〜10月：日本代表 秋シリーズ ──
  {
    id: "evt-jp-kirin-sep1",
    title: "🇯🇵 キリンチャレンジカップ（宮城）",
    startDate: "2026-09-24",
    category: "japan",
    description: "W杯後初の代表戦。キューアンドエースタジアムみやぎ",
    link: "/matches",
  },
  {
    id: "evt-jp-kirin-sep2",
    title: "🇯🇵 キリンチャレンジカップ（広島）",
    startDate: "2026-09-28",
    category: "japan",
    description: "エディオンピースウイング広島",
    link: "/matches",
  },
  {
    id: "evt-jp-kirin-cup1",
    title: "🇯🇵 キリンカップ（横浜）",
    startDate: "2026-10-01",
    category: "japan",
    description: "横浜国際総合競技場",
    link: "/matches",
  },
  {
    id: "evt-jp-kirin-cup2",
    title: "🇯🇵 キリンカップ（東京）",
    startDate: "2026-10-05",
    category: "japan",
    description: "国立競技場",
    link: "/matches",
  },

  // ── クラブシーズン開幕 ──
  {
    id: "evt-epl-start",
    title: "プレミアリーグ 2026-27 開幕",
    startDate: "2026-08-15",
    category: "club",
    description: "イングランド・プレミアリーグ新シーズン開幕",
  },
  {
    id: "evt-laliga-start",
    title: "ラ・リーガ 2026-27 開幕",
    startDate: "2026-08-22",
    category: "club",
    description: "スペイン・ラ・リーガ新シーズン開幕",
  },
  {
    id: "evt-cl-gp-start",
    title: "UEFAチャンピオンズリーグ 2026-27 開幕",
    startDate: "2026-09-16",
    category: "club",
    description: "CL新シーズン リーグフェーズ開幕",
  },
];

// ========================================
// ユーティリティ
// ========================================

/** 指定月のイベントを取得 */
export function getEventsByMonth(year: number, month: number): CalendarEvent[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return calendarEvents.filter((e) => {
    // 開始月が一致
    if (e.startDate.startsWith(prefix)) return true;
    // 期間イベントで対象月にまたがっている場合
    if (e.endDate) {
      const start = new Date(e.startDate);
      const end = new Date(e.endDate);
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);
      return start <= monthEnd && end >= monthStart;
    }
    return false;
  });
}

/** 指定日のイベントを取得 */
export function getEventsForDate(dateStr: string): CalendarEvent[] {
  return calendarEvents.filter((e) => {
    if (e.startDate === dateStr) return true;
    if (e.endDate) {
      return dateStr >= e.startDate && dateStr <= e.endDate;
    }
    return false;
  });
}

// ========================================
// Googleカレンダー & iCalエクスポート
// ========================================

/** YYYY-MM-DD → YYYYMMDD（終日イベント用） */
function toICalDate(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

/** 翌日の日付を取得（終日イベントのDTEND用） */
function nextDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

/** Googleカレンダー追加URL を生成 */
export function buildGoogleCalendarUrl(event: CalendarEvent): string {
  const title = event.title.replace(/🇯🇵 |⚽ |🏆 /g, "");
  const startDate = toICalDate(event.startDate);
  const endDate = event.endDate
    ? toICalDate(nextDay(event.endDate))
    : toICalDate(nextDay(event.startDate));

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${startDate}/${endDate}`,
    details: event.description
      ? `${event.description}\n\n📅 W杯2026 x toto カレンダー\nhttps://www.wc2026report.com/calendar`
      : "📅 W杯2026 x toto カレンダー\nhttps://www.wc2026report.com/calendar",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** iCalendar (.ics) テキストを生成 — 単一イベント */
function buildICalEvent(event: CalendarEvent): string {
  const title = event.title.replace(/🇯🇵 |⚽ |🏆 /g, "");
  const uid = `${event.id}@wc2026report.com`;
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const startDate = toICalDate(event.startDate);
  const endDate = event.endDate
    ? toICalDate(nextDay(event.endDate))
    : toICalDate(nextDay(event.startDate));

  const lines = [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${startDate}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${title}`,
  ];

  if (event.description) {
    // iCal spec: fold long lines, escape commas/semicolons/newlines
    const desc = event.description.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,");
    lines.push(`DESCRIPTION:${desc}`);
  }

  lines.push(
    `URL:https://www.wc2026report.com/calendar`,
    `CATEGORIES:${categoryConfig[event.category].label}`,
    "END:VEVENT",
  );

  return lines.join("\r\n");
}

/** 指定イベント群の .ics ファイル内容を生成 */
export function buildICalFile(events: CalendarEvent[]): string {
  const header = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//W杯2026 x toto//Soccer Calendar//JA",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:W杯2026 サッカーカレンダー",
    "X-WR-TIMEZONE:Asia/Tokyo",
  ].join("\r\n");

  const body = events.map(buildICalEvent).join("\r\n");

  return `${header}\r\n${body}\r\nEND:VCALENDAR\r\n`;
}

/** 単一イベントの .ics ダウンロードを実行（ブラウザ用） */
export function downloadSingleIcs(event: CalendarEvent): void {
  const content = buildICalFile([event]);
  triggerIcsDownload(content, `wc2026-${event.id}.ics`);
}

/** 全イベントの .ics ダウンロードを実行（ブラウザ用） */
export function downloadAllIcs(events: CalendarEvent[]): void {
  const content = buildICalFile(events);
  triggerIcsDownload(content, "wc2026-soccer-calendar.ics");
}

/** .ics ファイルのダウンロードをトリガー */
function triggerIcsDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
