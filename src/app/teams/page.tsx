import type { Metadata } from "next";
import Link from "next/link";
import TeamsView from "@/components/TeamsView";
import SourceAttribution from "@/components/SourceAttribution";
import Icon from "@/components/Icon";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { allTeams } from "@/data/teams";
import { getLocaleFromCookies, getDictionary, createTranslator } from "@/i18n/index";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);
  return {
    title: t("teams.metaTitle"),
    description: t("teams.metaDescription"),
    alternates: { canonical: "https://www.wc2026report.com/teams" },
  };
}

export default async function TeamsPage() {
  const locale = await getLocaleFromCookies();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t("common.top"), url: "https://www.wc2026report.com" },
        { name: t("teams.pageTitle"), url: "https://www.wc2026report.com/teams" },
      ]} />

      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {t("teams.pageTitle")}
        </h1>
        <p className="text-gray-500 mb-4">
          {t("teams.pageDescription")}
        </p>

        {/* ページ切り替えタブ */}
        <div className="flex gap-2 mb-8">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white">
            <Icon name="flag" size={16} />
            {t("groups.teamList")}
          </span>
          <Link
            href="/groups"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Icon name="shield" size={16} />
            {t("groups.groupList")}
          </Link>
        </div>

        <TeamsView teams={allTeams} />

        {/* 関連リンク */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/groups"
            className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg"
          >
            <Icon name="shield" size={16} />
            {t("teams.linkGroups")}
          </Link>
          <Link
            href="/matches"
            className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg"
          >
            <Icon name="calendar_month" size={16} />
            {t("teams.linkMatches")}
          </Link>
        </div>

        <SourceAttribution
          sources={[
            { label: "FIFA公式 — FIFA World Ranking", url: "https://www.fifa.com/fifa-world-ranking" },
            { label: "FIFA公式 — FIFA World Cup 26", url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026" },
          ]}
          updatedAt="2026年4月1日"
          dataNote="チームデータ（FIFAランキング・監督・注目選手等）は2026年4月1日付FIFAランキング準拠"
        />
      </div>
    </>
  );
}
