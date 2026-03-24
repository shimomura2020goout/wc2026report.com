import type { Metadata } from "next";
import Link from "next/link";
import MatchScheduleView from "@/components/MatchScheduleView";
import PlayoffSection from "@/components/PlayoffSection";
import SourceAttribution from "@/components/SourceAttribution";
import Icon from "@/components/Icon";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { japanMatches, allGroupStageMatches, allKnockoutMatches } from "@/data/matches";
import { getLocaleFromCookies, getDictionary, createTranslator } from "@/i18n/index";

export const metadata: Metadata = {
  title: "全104試合 試合日程｜W杯2026 グループステージ・ノックアウトステージ",
  description: "FIFA ワールドカップ 2026 全104試合の日程一覧。日本代表戦、グループステージ全72試合、ノックアウトステージ32試合のキックオフ時間（日本時間）・会場・放映情報を網羅。",
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

      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {t("matches.pageTitle")}
        </h1>
        <p className="text-gray-500 mb-8">
          {t("matches.pageDescription")}
        </p>

        {/* メインスケジュールビュー */}
        <MatchScheduleView
          japanMatches={japanMatches}
          groupStageMatches={allGroupStageMatches}
          knockoutMatches={allKnockoutMatches}
        />

        {/* UEFA PO B */}
        <div className="mt-10">
          <PlayoffSection />
        </div>

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
            href="/toto"
            className="inline-flex items-center gap-1 text-sm text-purple-600 font-medium hover:text-purple-800 bg-purple-50 px-3 py-2 rounded-lg"
          >
            <Icon name="confirmation_number" size={16} />
            {t("matches.linkToto")}
          </Link>
        </div>

        <SourceAttribution
          sources={[
            { label: "FIFA公式 — FIFA World Cup 26", url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026" },
            { label: "JFA公式 — SAMURAI BLUE", url: "https://www.jfa.jp/samuraiblue/" },
            { label: "DAZN — 放映スケジュール", url: "https://www.dazn.com/ja-JP" },
          ]}
          updatedAt="2026年3月25日"
        />
      </div>
    </>
  );
}
