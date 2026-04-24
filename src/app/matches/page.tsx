import type { Metadata } from "next";
import Link from "next/link";
import MatchScheduleView from "@/components/MatchScheduleView";
import PlayoffSection from "@/components/PlayoffSection";
import CalendarView from "@/components/CalendarView";
import SourceAttribution from "@/components/SourceAttribution";
import Icon from "@/components/Icon";
import { BreadcrumbJsonLd, SportsEventJsonLd } from "@/components/JsonLd";
import { japanMatches, allGroupStageMatches, allKnockoutMatches } from "@/data/matches";
import { getLocaleFromCookies, getDictionary, createTranslator } from "@/i18n/index";

export const metadata: Metadata = {
  title: "W杯2026 試合日程・スケジュール一覧｜全104試合 日本時間（JST）対応",
  description: "W杯2026（FIFAワールドカップ）全104試合の日程・スケジュールを日本時間で一覧表��。日本代表戦のキックオフ時間・会場・テレビ放送予定を網羅。グループステージ72試合＋ノックアウト32試合。",
  alternates: { canonical: "https://www.wc2026report.com/matches" },
};

export default async function MatchesPage() {
  const locale = await getLocaleFromCookies();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t("nav.home"), url: "https://www.wc2026report.com" },
        { name: t("nav.matches"), url: "https://www.wc2026report.com/matches" },
      ]} />

      {/* 日本戦のSportsEvent JSON-LD（リッチリザルト狙い） */}
      <SportsEventJsonLd
        name="W杯2026 グループF第1節: オランダ vs 日本"
        startDate="2026-06-15T05:00:00+09:00"
        location="AT&T スタジアム（ダラス）"
        homeTeam="オランダ"
        awayTeam="日本"
        description="FIFAワールドカップ2026 グループF第1節。日本代表の初戦。"
        url="https://www.wc2026report.com/matches"
      />
      <SportsEventJsonLd
        name="W杯2026 グループF第2節: チュニ��ア vs 日本"
        startDate="2026-06-21T13:00:00+09:00"
        location="BBVA スタジアム（モンテレイ）"
        homeTeam="チュニジア"
        awayTeam="日本"
        description="FIFAワールドカ���プ2026 グループF第2節。"
        url="https://www.wc2026report.com/matches"
      />
      <SportsEventJsonLd
        name="W杯2026 グループF第3節: 日本 vs スウェーデン"
        startDate="2026-06-26T08:00:00+09:00"
        location="AT&T スタジアム（ダラス）"
        homeTeam="日本"
        awayTeam="スウェーデン"
        description="FIFAワールド���ップ2026 グループF第3節。グループステージ最終戦。"
        url="https://www.wc2026report.com/matches"
      />

      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {t("matches.pageTitle")}
        </h1>
        <p className="text-gray-500 mb-8">
          {t("matches.pageDescription")}
        </p>

        {/* 視聴ガイドへの誘導バナー */}
        <Link
          href="/watch"
          className="flex items-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl px-4 py-3 mb-6 hover:from-gray-800 hover:to-gray-700 transition-all"
        >
          <Icon name="live_tv" size={20} className="text-green-400" />
          <span className="text-sm font-medium">W杯の放送・配信情報をチェック</span>
          <Icon name="arrow_forward" size={16} className="ml-auto text-gray-400" />
        </Link>

        {/* サッカーカレンダー 2026（最上位） */}
        <section id="calendar" className="mb-10 scroll-mt-20">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Icon name="calendar_month" size={24} className="text-blue-600" />
              {t("calendar.pageTitle")}
            </h2>
            <p className="text-gray-500 text-sm">
              {t("calendar.pageDescription")}
            </p>
          </div>

          <CalendarView />

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <Icon name="info" size={18} className="text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium mb-1">{t("calendar.aboutTitle")}</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>{t("calendar.aboutNote1")}</li>
                  <li>{t("calendar.aboutNote2")}</li>
                  <li>{t("calendar.aboutNote3")}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* メインスケジュールビュー */}
        <MatchScheduleView
          japanMatches={japanMatches}
          groupStageMatches={allGroupStageMatches}
          knockoutMatches={allKnockoutMatches}
        />

        {/* 注意書き */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <Icon name="info" size={18} className="text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium mb-1">{t("matches.noticeTitle")}</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>{t("matches.noticeJST")}</li>
                <li>{t("matches.noticePlaceholder")}</li>
                <li>{t("matches.noticeBroadcast")}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 関連リンク */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/groups"
            className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg"
          >
            <Icon name="shield" size={16} />
            {t("matches.linkGroups")}
          </Link>
          <Link
            href="/results"
            className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg"
          >
            <Icon name="scoreboard" size={16} />
            {t("matches.linkResults")}
          </Link>
          <Link
            href="/watch"
            className="inline-flex items-center gap-1 text-sm text-green-600 font-medium hover:text-green-800 bg-green-50 px-3 py-2 rounded-lg"
          >
            <Icon name="live_tv" size={16} />
            視聴ガイド
          </Link>
        </div>

        {/* プレーオフ結果（最下部・アコーディオン） */}
        <details className="mt-10 group bg-gray-50 rounded-xl border border-gray-200">
          <summary className="flex items-center gap-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl">
            <Icon name="emoji_events" size={18} className="text-gray-500" />
            プレーオフ結果（UEFA・大陸間）
            <span className="text-xs text-gray-400 ml-auto mr-2">8枠確定済み</span>
            <Icon name="expand_more" size={20} className="text-gray-400 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="px-4 pb-4 pt-2">
            <PlayoffSection />
          </div>
        </details>

        <SourceAttribution
          sources={[
            { label: "FIFA公式 — FIFA World Cup 26", url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026" },
            { label: "JFA公式 — SAMURAI BLUE", url: "https://www.jfa.jp/samuraiblue/" },
            { label: "DAZN — 放映スケジュール", url: "https://www.dazn.com/ja-JP" },
          ]}
          updatedAt="2026年4月24日"
        />
      </div>
    </>
  );
}
