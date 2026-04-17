import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import SourceAttribution from "@/components/SourceAttribution";
import MyPredictionsSummary from "@/components/MyPredictionsSummary";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { groupFMatches, getInitialStandings, groupFScenarios } from "@/data/results";
import { formatMatchDate } from "@/data/matches";
import { getLocaleFromCookies, getDictionary, createTranslator } from "@/i18n/index";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);
  return {
    title: t("results.metaTitle"),
    description: t("results.metaDescription"),
    alternates: { canonical: "https://www.wc2026report.com/results" },
  };
}

const standings = getInitialStandings(["日本", "オランダ", "チュニジア", "スウェーデン"]);

export default async function ResultsPage() {
  const locale = await getLocaleFromCookies();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t("common.top"), url: "https://www.wc2026report.com" },
        { name: t("results.pageTitle"), url: "https://www.wc2026report.com/results" },
      ]} />

      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Icon name="scoreboard" size={32} className="text-gray-700" />
          {t("results.pageTitle")}
        </h1>
        <p className="text-gray-500 mb-8">
          {t("results.pageDescription")}
        </p>

        {/* グループF 順位表 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="leaderboard" size={24} className="text-amber-600" />
            {t("results.standingsTitle")}
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600">
                  <th className="text-left px-4 py-3 font-semibold w-8">#</th>
                  <th className="text-left px-4 py-3 font-semibold">{t("results.thTeam")}</th>
                  <th className="text-center px-2 py-3 font-semibold" title={t("results.titlePlayed")}>{t("results.thPlayed")}</th>
                  <th className="text-center px-2 py-3 font-semibold" title={t("results.titleWon")}>{t("results.thWon")}</th>
                  <th className="text-center px-2 py-3 font-semibold" title={t("results.titleDrawn")}>{t("results.thDrawn")}</th>
                  <th className="text-center px-2 py-3 font-semibold" title={t("results.titleLost")}>{t("results.thLost")}</th>
                  <th className="text-center px-2 py-3 font-semibold" title={t("results.titleGoalsFor")}>{t("results.thGoalsFor")}</th>
                  <th className="text-center px-2 py-3 font-semibold" title={t("results.titleGoalsAgainst")}>{t("results.thGoalsAgainst")}</th>
                  <th className="text-center px-2 py-3 font-semibold" title={t("results.titleGoalDifference")}>{t("results.thGoalDifference")}</th>
                  <th className="text-center px-3 py-3 font-semibold" title={t("results.titlePoints")}>{t("results.thPoints")}</th>
                  <th className="text-center px-2 py-3 font-semibold hidden sm:table-cell">{t("results.thForm")}</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((team, i) => (
                  <tr
                    key={team.team}
                    className={`border-t border-gray-50 ${
                      team.team === "日本" ? "bg-red-50/50" : ""
                    } ${i < 2 ? "border-l-3 border-l-green-500" : ""}`}
                  >
                    <td className="px-4 py-3 font-mono text-gray-400">{i + 1}</td>
                    <td className={`px-4 py-3 font-medium ${team.team === "日本" ? "text-red-700" : "text-gray-900"}`}>
                      {team.team}
                    </td>
                    <td className="text-center px-2 py-3 text-gray-600">{team.played}</td>
                    <td className="text-center px-2 py-3 text-gray-600">{team.won}</td>
                    <td className="text-center px-2 py-3 text-gray-600">{team.drawn}</td>
                    <td className="text-center px-2 py-3 text-gray-600">{team.lost}</td>
                    <td className="text-center px-2 py-3 text-gray-600">{team.goalsFor}</td>
                    <td className="text-center px-2 py-3 text-gray-600">{team.goalsAgainst}</td>
                    <td className="text-center px-2 py-3 font-medium text-gray-800">{team.goalDifference}</td>
                    <td className="text-center px-3 py-3 font-bold text-gray-900">{team.points}</td>
                    <td className="text-center px-2 py-3 hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        {team.form.map((f, j) => (
                          <span key={j} className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
                            f === "W" ? "bg-green-500 text-white" :
                            f === "D" ? "bg-gray-400 text-white" :
                            f === "L" ? "bg-red-500 text-white" :
                            "bg-gray-200 text-gray-400"
                          }`}>{f}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-green-500 inline-block"></span>
              {t("results.autoQualify")}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-yellow-500 inline-block"></span>
              {t("results.thirdPlaceQualify")}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {t("results.preSeasonNote")}
          </p>
        </section>

        {/* 試合結果・日程 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="sports_soccer" size={24} className="text-gray-600" />
            {t("results.allMatchesTitle")}
          </h2>

          <MyPredictionsSummary matchIds={groupFMatches.map((m) => m.id)} />

          {[1, 2, 3].map((matchday) => {
            const matches = groupFMatches.filter((m) => m.matchday === matchday);
            return (
              <div key={matchday} className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">
                  {t("results.matchday", { matchday: String(matchday), date: formatMatchDate(matches[0].date) })}
                </h3>
                <div className="space-y-3">
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      className={`bg-white rounded-xl shadow-sm border p-4 ${
                        match.homeTeam === "日本" || match.awayTeam === "日本"
                          ? "border-red-200 japan-accent"
                          : "border-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <span className={`font-bold text-sm sm:text-base flex-1 text-right ${
                            match.homeTeam === "日本" ? "text-red-700" : "text-gray-900"
                          }`}>
                            {match.homeTeam}
                          </span>

                          {match.status === "finished" ? (
                            <div className="bg-gray-900 text-white px-3 py-1 rounded-lg text-center min-w-[70px]">
                              <span className="text-lg font-bold">{match.homeScore} - {match.awayScore}</span>
                            </div>
                          ) : match.status === "live" ? (
                            <div className="bg-red-600 text-white px-3 py-1 rounded-lg text-center min-w-[70px] animate-pulse">
                              <span className="text-lg font-bold">{match.homeScore ?? 0} - {match.awayScore ?? 0}</span>
                              <span className="block text-xs">{t("results.live")}</span>
                            </div>
                          ) : (
                            <div className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-center min-w-[70px]">
                              <span className="text-sm font-medium">{match.kickoff}<span className="text-[10px] text-gray-400 ml-0.5">JST</span></span>
                              <span className="block text-xs">{t("common.ko")}</span>
                            </div>
                          )}

                          <span className={`font-bold text-sm sm:text-base flex-1 ${
                            match.awayTeam === "日本" ? "text-red-700" : "text-gray-900"
                          }`}>
                            {match.awayTeam}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                        <Icon name="location_on" size={14} />
                        {match.venue}
                      </div>

                      {/* イベント（ゴール・カードなど） */}
                      {match.events && match.events.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          {match.events.map((event, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-gray-600 py-0.5">
                              <span className="font-mono text-gray-400 w-8">{event.minute}&apos;</span>
                              <Icon
                                name={
                                  event.type === "goal" || event.type === "penalty_goal" ? "sports_soccer" :
                                  event.type === "yellow" ? "square" :
                                  event.type === "red" ? "square" :
                                  event.type === "own_goal" ? "sports_soccer" :
                                  "swap_horiz"
                                }
                                size={14}
                                className={
                                  event.type === "goal" || event.type === "penalty_goal" ? "text-gray-700" :
                                  event.type === "yellow" ? "text-yellow-500" :
                                  event.type === "red" ? "text-red-600" :
                                  event.type === "own_goal" ? "text-red-400" :
                                  "text-gray-400"
                                }
                              />
                              <span>{event.player}（{event.team}）</span>
                              {event.detail && <span className="text-gray-400">{event.detail}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* 累積警告・出場停止 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="warning" size={24} className="text-yellow-500" />
            {t("results.warningsTitle")}
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-3">
              {t("results.warningsDescription")}
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="info" size={18} className="text-yellow-600" />
                <span className="font-medium">{t("results.warningsPreSeason")}</span>
              </div>
              <p>{t("results.warningsPreSeasonNote")}</p>
            </div>
          </div>
        </section>

        {/* グループ突破シナリオ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="calculate" size={24} className="text-blue-600" />
            {t("results.scenariosTitle")}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {t("results.scenariosDescription")}
          </p>
          <div className="space-y-3">
            {groupFScenarios.map((scenario, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 mt-1 w-3 h-3 rounded-full ${
                    scenario.probability === "high" ? "bg-green-500" :
                    scenario.probability === "medium" ? "bg-yellow-500" :
                    "bg-red-500"
                  }`}></span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{scenario.condition}</p>
                    <p className="text-sm text-gray-600 mt-1">{scenario.outcome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <Icon name="info" size={18} className="text-blue-500 mt-0.5" />
              <p>{t("results.scenariosUpdateNote")}</p>
            </div>
          </div>
        </section>

        {/* 視聴ガイドへの誘導 */}
        <Link
          href="/watch"
          className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mt-6 hover:bg-gray-100 transition-colors"
        >
          <Icon name="live_tv" size={18} className="text-green-600" />
          <span className="text-sm text-gray-700">見逃した試合もDAZNで視聴可能 →</span>
          <span className="text-xs text-blue-600 font-medium ml-auto">視聴ガイド</span>
        </Link>

        <SourceAttribution
          sources={[
            { label: "FIFA公式 — FIFA World Cup 26", url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026" },
            { label: "FIFA公式 — 大会レギュレーション", url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026/articles/fifa-world-cup-26-all-you-need-to-know" },
          ]}
          updatedAt="2026年4月15日"
        />
      </div>
    </>
  );
}
