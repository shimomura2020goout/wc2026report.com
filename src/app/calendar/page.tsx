import type { Metadata } from "next";
import Link from "next/link";
import CalendarView from "@/components/CalendarView";
import SourceAttribution from "@/components/SourceAttribution";
import Icon from "@/components/Icon";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "サッカーカレンダー 2026｜W杯・日本代表・CL 主要イベント一覧",
  description:
    "2026年のサッカー主要イベントをカレンダー形式で一覧表示。FIFA ワールドカップ 2026、日本代表戦、UEFAチャンピオンズリーグ、プレーオフ日程をまとめてチェック。",
  alternates: { canonical: "https://www.wc2026report.com/calendar" },
};

export default function CalendarPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "トップ", url: "https://www.wc2026report.com" },
          { name: "カレンダー", url: "https://www.wc2026report.com/calendar" },
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Icon name="calendar_month" size={32} className="text-blue-600" />
            サッカーカレンダー 2026
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            W杯2026を中心に、日本代表戦・クラブ大会・プレーオフなどサッカーの主要イベントを一覧表示。
            カテゴリで絞り込み、日付をクリックして詳細を確認できます。
          </p>
        </div>

        {/* カレンダーコンポーネント */}
        <CalendarView />

        {/* 凡例・補足 */}
        <div className="mt-10 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <Icon name="info" size={18} className="text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium mb-1">カレンダーについて</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>日程は変更される場合があります。最新情報は各大会公式サイトをご確認ください</li>
                <li>キックオフ時間はすべて日本時間（JST）です</li>
                <li>カテゴリボタンでイベントの絞り込みが可能です</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 関連リンク */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/matches"
            className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg"
          >
            <Icon name="sports_soccer" size={16} />
            W杯 全試合日程 →
          </Link>
          <Link
            href="/teams"
            className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg"
          >
            <Icon name="flag" size={16} />
            出場国一覧 →
          </Link>
          <Link
            href="/watch"
            className="inline-flex items-center gap-1 text-sm text-green-600 font-medium hover:text-green-800 bg-green-50 px-3 py-2 rounded-lg"
          >
            <Icon name="live_tv" size={16} />
            視聴ガイド →
          </Link>
        </div>

        <SourceAttribution
          sources={[
            { label: "FIFA公式 — FIFA World Cup 26", url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026" },
            { label: "UEFA公式 — Champions League", url: "https://www.uefa.com/uefachampionsleague/" },
            { label: "JFA公式 — SAMURAI BLUE", url: "https://www.jfa.jp/samuraiblue/" },
          ]}
          updatedAt="2026年3月20日"
        />
      </div>
    </>
  );
}
