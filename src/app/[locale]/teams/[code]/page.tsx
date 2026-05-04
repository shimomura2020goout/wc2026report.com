import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import MatchCard from "@/components/MatchCard";
import CoachTooltip from "@/components/CoachTooltip";
import PlayerTooltip from "@/components/PlayerTooltip";
import SourceAttribution from "@/components/SourceAttribution";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { allTeams } from "@/data/teams";
import { getTeamDetail, hasTeamDetail, playerColumnSlugs } from "@/data/teamDetails";
import { allWorldCupMatches } from "@/data/matches";
import { getLocale, getDictionary, createTranslator } from "@/i18n/index";
import { pageAlternates } from "@/lib/i18nLinks";
import { localizedTeamName, localizedRegionLabel, localizedBestResult, localizedTeamDetail } from "@/data/teamsI18n";

// ========================================
// 静的パス生成
// ========================================
export function generateStaticParams() {
  return allTeams
    .filter((t) => !t.isPlaceholder)
    .map((t) => ({ code: t.code.toLowerCase() }));
}

// ========================================
// メタデータ
// ========================================
type Props = { params: Promise<{ locale: string; code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);
  const team = allTeams.find((t) => t.code.toLowerCase() === code.toLowerCase());
  if (!team) return { title: t("teamDetail.teamInfo") };

  const rawDetail = getTeamDetail(team.code);
  const detail = rawDetail ? localizedTeamDetail(rawDetail, locale) : undefined;
  const localizedName = localizedTeamName(team, locale);
  const title = locale === "ja"
    ? `${team.flag} ${team.name}｜W杯2026 チーム情報・注目選手・試合日程`
    : locale === "en"
      ? `${team.flag} ${localizedName} | World Cup 2026 — Squad, Schedule, Star Players`
      : `${team.flag} ${localizedName}｜월드컵 2026 — 대표팀 정보·주목 선수·경기 일정`;
  const description = detail
    ? locale === "ja"
      ? `${team.name}のW杯2026情報。監督: ${detail.coach}、注目選手: ${detail.starPlayers.join("・")}。${detail.description.slice(0, 80)}...`
      : locale === "en"
        ? `${localizedName} at FIFA World Cup 2026: head coach, star players, group ${team.group} schedule and squad analysis.`
        : `${localizedName}의 월드컵 2026 정보. 감독, 주목 선수, ${team.group}조 일정과 대표팀 분석.`
    : locale === "ja"
      ? `${team.name}のW杯2026情報。FIFAランキング${team.fifaRanking}位、グループ${team.group}。`
      : locale === "en"
        ? `${localizedName} at FIFA World Cup 2026. FIFA ranking #${team.fifaRanking}, Group ${team.group}.`
        : `${localizedName}의 월드컵 2026 정보. FIFA 랭킹 ${team.fifaRanking}위, ${team.group}조.`;

  return {
    title,
    description,
    alternates: pageAlternates(locale, `/teams/${team.code.toLowerCase()}`),
  };
}

// ========================================
// ページ本体
// ========================================
export default async function TeamDetailPage({ params }: Props) {
  const { code } = await params;
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);

  const team = allTeams.find((t) => t.code.toLowerCase() === code.toLowerCase());
  if (!team || team.isPlaceholder) notFound();

  const rawDetail = getTeamDetail(team.code);
  const detail = rawDetail ? localizedTeamDetail(rawDetail, locale) : undefined;
  const displayName = localizedTeamName(team, locale);
  const displayRegion = localizedRegionLabel(team.region, locale);
  const displayBest = localizedBestResult(team, locale);

  // このチームの試合を取得
  const teamMatches = allWorldCupMatches.filter(
    (m) => m.homeTeam === team.name || m.awayTeam === team.name
  );

  // 同グループのチーム
  const groupTeams = allTeams.filter((t) => t.group === team.group && t.code !== team.code);

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t("teamDetail.breadcrumbTop"), url: "https://www.wc2026report.com" },
        { name: t("teamDetail.breadcrumbTeams"), url: "https://www.wc2026report.com/teams" },
        { name: displayName, url: `https://www.wc2026report.com/teams/${team.code.toLowerCase()}` },
      ]} />

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* パンくず */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-gray-600">{t("teamDetail.breadcrumbTop")}</Link>
          <span>/</span>
          <Link href="/teams" className="hover:text-gray-600">{t("teamDetail.breadcrumbTeams")}</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">{displayName}</span>
        </nav>

        {/* ── ヘッダー ── */}
        <div className={`rounded-2xl p-6 sm:p-8 mb-8 ${
          team.name === "日本"
            ? "bg-gradient-to-br from-red-50 via-white to-blue-50 border-2 border-red-200"
            : "bg-gradient-to-br from-gray-50 to-white border border-gray-200"
        }`}>
          <div className="flex items-start gap-4 sm:gap-6">
            <span className="text-5xl sm:text-6xl">{team.flag}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {displayName}
                </h1>
                <span className="text-sm text-gray-400 font-mono">{team.code}</span>
              </div>

              {detail && (
                <p className="text-sm text-gray-500 mb-3">{detail.nickname}</p>
              )}

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-semibold">
                  {t("teamDetail.fifaRanking", { rank: String(team.fifaRanking) })}
                </span>
                <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-medium">
                  {t("teamDetail.groupLabel", { group: team.group })}
                </span>
                <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                  {displayRegion}
                </span>
                <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                  {t("teamDetail.wcCount", { count: String(team.wcAppearances) })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 基本情報 ── */}
        {detail && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="person" size={16} className="text-gray-400" />
                <span className="text-xs text-gray-500 font-medium">{t("teamDetail.coach")}</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                <CoachTooltip
                  coachName={detail.coach}
                  coachNationality={detail.coachNationality}
                  teamName={team.name}
                />
              </p>
            </div>
            <InfoCard icon="checkroom" label={t("teamDetail.uniform")} value={detail.kitColors} />
            <InfoCard icon="emoji_events" label={t("teamDetail.wcBestResult")} value={displayBest} />
            <InfoCard icon="route" label={t("teamDetail.qualificationPath")} value={detail.qualificationPath} />
          </div>
        )}

        {/* ── チーム紹介 ── */}
        {detail && (
          <section className="mb-8">
            <SectionTitle icon="description" title={t("teamDetail.teamIntro")} />
            <p className="text-sm text-gray-700 leading-relaxed">{detail.description}</p>
          </section>
        )}

        {/* ── 注目選手 ── */}
        {detail && (
          <section className="mb-8">
            <SectionTitle icon="star" title={t("teamDetail.starPlayers")} />
            <div className="flex flex-wrap gap-3">
              {detail.starPlayers.map((player) => (
                <PlayerTooltip
                  key={player}
                  playerName={player}
                  teamName={team.name}
                  teamFlag={team.flag}
                  columnSlug={playerColumnSlugs[player]}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── 強みと課題 ── */}
        {detail && (
          <section className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <h3 className="text-sm font-bold text-green-800 mb-2 flex items-center gap-1.5">
                  <Icon name="thumb_up" size={16} />
                  {t("teamDetail.strengths")}
                </h3>
                <ul className="space-y-1.5">
                  {detail.strengths.map((s) => (
                    <li key={s} className="text-xs text-green-700 flex items-start gap-1.5">
                      <Icon name="check_circle" size={14} className="mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                <h3 className="text-sm font-bold text-orange-800 mb-2 flex items-center gap-1.5">
                  <Icon name="warning" size={16} />
                  {t("teamDetail.weaknesses")}
                </h3>
                <ul className="space-y-1.5">
                  {detail.weaknesses.map((w) => (
                    <li key={w} className="text-xs text-orange-700 flex items-start gap-1.5">
                      <Icon name="error_outline" size={14} className="mt-0.5 shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* ── W杯の歴史 ── */}
        {detail && (
          <section className="mb-8">
            <SectionTitle icon="history" title={t("teamDetail.wcHistory")} />
            <p className="text-sm text-gray-700 leading-relaxed">{detail.worldCupHistory}</p>
          </section>
        )}

        {/* ── 試合日程 ── */}
        {teamMatches.length > 0 && (
          <section className="mb-8">
            <SectionTitle icon="sports_soccer" title={t("teamDetail.matchSchedule", { name: displayName })} />
            <div className="space-y-3">
              {teamMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        )}

        {/* ── 同グループのチーム ── */}
        <section className="mb-8">
          <SectionTitle icon="shield" title={t("teamDetail.otherGroupTeams", { group: team.group })} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {groupTeams.map((gt) => (
              <Link
                key={gt.code}
                href={gt.isPlaceholder ? "#" : `/teams/${gt.code.toLowerCase()}`}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  gt.isPlaceholder
                    ? "border-dashed border-gray-200 bg-gray-50 cursor-default"
                    : "border-gray-200 bg-white hover:shadow-md hover:border-gray-300"
                }`}
              >
                <span className="text-2xl">{gt.flag}</span>
                <div>
                  <p className={`font-semibold text-sm ${gt.isPlaceholder ? "text-gray-400 italic" : "text-gray-900"}`}>
                    {localizedTeamName(gt, locale)}
                  </p>
                  {!gt.isPlaceholder && (
                    <p className="text-xs text-gray-400">
                      {t("teamDetail.fifaRanking", { rank: String(gt.fifaRanking) })} / {localizedRegionLabel(gt.region, locale)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 関連リンク */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href="/teams"
            className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg"
          >
            <Icon name="arrow_back" size={16} />
            {t("teamDetail.backToTeams")}
          </Link>
          <Link
            href={`/groups#group-${team.group}`}
            className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg"
          >
            <Icon name="shield" size={16} />
            {t("teamDetail.groupDetail", { group: team.group })}
          </Link>
          <Link
            href="/matches"
            className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg"
          >
            <Icon name="calendar_month" size={16} />
            {t("teamDetail.allMatches")}
          </Link>
        </div>

        <SourceAttribution
          sources={[
            { label: "FIFA公式 — FIFA World Ranking", url: "https://www.fifa.com/fifa-world-ranking" },
            { label: "FIFA公式 — FIFA World Cup 26", url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026" },
          ]}
          updatedAt="2026年4月15日"
          dataNote="チームデータ（監督・出場国）は2026年4月15日更新（FIFAランキングは2026年4月1日付準拠）"
        />
      </div>
    </>
  );
}

// ========================================
// サブコンポーネント
// ========================================

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
      <Icon name={icon} size={20} className="text-amber-600" />
      {title}
    </h2>
  );
}

function InfoCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Icon name={icon} size={16} className="text-gray-400" />
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
