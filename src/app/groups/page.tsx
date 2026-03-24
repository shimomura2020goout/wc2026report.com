import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import SourceAttribution from "@/components/SourceAttribution";
import { worldCupGroups, getGroupMatches, formatMatchDate } from "@/data/matches";
import { getTeamByName } from "@/data/teams";
import { getLocaleFromCookies, getDictionary, createTranslator } from "@/i18n/index";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);
  return {
    title: t("groups.metaTitle"),
    description: t("groups.metaDescription"),
    alternates: { canonical: "https://www.wc2026report.com/groups" },
  };
}

export default async function GroupsPage() {
  const locale = await getLocaleFromCookies();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        {t("groups.pageTitle")}
      </h1>
      <p className="text-gray-500 mb-4">
        {t("groups.pageDescription")}
      </p>

      {/* ページ切り替えタブ */}
      <div className="flex gap-2 mb-8">
        <Link
          href="/teams"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <Icon name="flag" size={16} />
          {t("groups.teamList")}
        </Link>
        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white">
          <Icon name="shield" size={16} />
          {t("groups.groupList")}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {worldCupGroups.map((group) => {
          const matches = getGroupMatches(group.name);
          return (
            <div
              key={group.name}
              id={`group-${group.name}`}
              className={`bg-white rounded-xl shadow-sm border p-5 ${group.name === "F" ? "border-red-300 ring-2 ring-red-200" : "border-gray-100"}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Icon name="shield" size={20} className="text-gray-400" />
                  {t("groups.groupName", { name: group.name })}
                </h2>
                {group.name === "F" && (
                  <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold">
                    {t("common.japanBelong")}
                  </span>
                )}
              </div>

              {/* チーム一覧 */}
              <div className="space-y-2 mb-4">
                {group.teams.map((team, i) => {
                  const teamData = getTeamByName(team);
                  const isPlaceholder = /PO|勝者/.test(team);
                  const content = (
                    <>
                      <span className="text-sm text-gray-400 font-mono w-4">{i + 1}</span>
                      {teamData && <span className="text-lg">{teamData.flag}</span>}
                      <span className={`font-medium flex-1 ${
                        team === "日本" ? "text-red-700" :
                        isPlaceholder ? "text-gray-400 italic text-sm" :
                        "text-gray-800"
                      }`}>
                        {team}
                      </span>
                      {!isPlaceholder && teamData && (
                        <Icon name="chevron_right" size={14} className="text-gray-300" />
                      )}
                    </>
                  );

                  return isPlaceholder || !teamData ? (
                    <div
                      key={team}
                      className={`flex items-center gap-3 py-2 px-3 rounded-lg ${
                        team === "日本" ? "bg-red-50 border border-red-200" : "bg-gray-50"
                      }`}
                    >
                      {content}
                    </div>
                  ) : (
                    <Link
                      key={team}
                      href={`/teams/${teamData.code.toLowerCase()}`}
                      className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors hover:bg-gray-100 ${
                        team === "日本" ? "bg-red-50 border border-red-200 hover:bg-red-100" : "bg-gray-50"
                      }`}
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>

              {/* 試合日程 */}
              {matches.length > 0 && (
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">{t("groups.matchSchedule")}</h3>
                  <div className="space-y-1.5">
                    {[1, 2, 3].map((md) => {
                      const mdMatches = matches.filter((m) => m.matchday === md);
                      if (mdMatches.length === 0) return null;
                      return (
                        <div key={md}>
                          <div className="text-xs text-gray-400 font-medium mb-1">{t("groups.matchday", { matchday: String(md) })}</div>
                          {mdMatches.map((m) => (
                            <div key={m.id} className={`text-xs py-1 px-2 rounded ${
                              m.isJapan ? "bg-red-50 text-red-800" : "text-gray-600"
                            }`}>
                              <span className="text-gray-400 mr-1">{formatMatchDate(m.date).slice(5, -1).split("（")[0]}</span>
                              <span className="font-medium mr-1">{m.kickoff}<span className="text-[10px] text-gray-400 ml-0.5">JST</span></span>
                              <span className={m.isJapan ? "font-bold" : ""}>{m.homeTeam} vs {m.awayTeam}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1 text-sm text-gray-500 border-t border-gray-100 pt-3 mt-3">
                <Icon name="location_on" size={16} className="text-gray-400" />
                {t("groups.venue", { venue: group.venue })}
              </div>
            </div>
          );
        })}
      </div>

      {/* レギュレーション説明 */}
      <div className="mt-12 bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h3 className="font-bold text-amber-900 text-lg mb-3 flex items-center gap-2">
          <Icon name="rule" size={22} className="text-amber-700" />
          {t("groups.regulationTitle")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-800">
          <div>
            <h4 className="font-semibold mb-1">{t("groups.groupStageLabel")}</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>{t("groups.groupStageRule1")}</li>
              <li>{t("groups.groupStageRule2")}</li>
              <li>{t("groups.groupStageRule3")}</li>
              <li>{t("groups.groupStageRule4")}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-1">{t("groups.knockoutStageLabel")}</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>{t("groups.knockoutStageRule1")}</li>
              <li>{t("groups.knockoutStageRule2")}</li>
              <li>{t("groups.knockoutStageRule3")}</li>
            </ul>
          </div>
        </div>
      </div>

      <SourceAttribution
        sources={[
          { label: "FIFA公式 — FIFA World Cup 26 組み合わせ", url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026" },
          { label: "FIFA公式 — 大会レギュレーション", url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026/articles/fifa-world-cup-26-all-you-need-to-know" },
        ]}
        updatedAt="2026年3月25日"
      />
    </div>
  );
}
