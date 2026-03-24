import Link from "next/link";
import Countdown from "@/components/Countdown";
import MatchCard from "@/components/MatchCard";
import SourceAttribution from "@/components/SourceAttribution";
import Icon from "@/components/Icon";
import { japanMatches, worldCupGroups } from "@/data/matches";
import { getTeamByName } from "@/data/teams";
import { getLocaleFromCookies, getDictionary, createTranslator } from "@/i18n/index";

export default async function Home() {
  const locale = await getLocaleFromCookies();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);

  const worldCupMatches = japanMatches.filter((m) => m.type === "worldcup_gl");

  return (
    <>
      {/* Hero Section */}
      <section className="hero-gradient text-white py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
            {t("home.heroTitle")}
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-2">
            {t("home.heroSubtitle")}
          </p>
          <p className="text-base text-gray-400 mb-8">
            {t("home.heroDescription")}
          </p>

          <div className="mb-8">
            <p className="text-sm text-gray-400 mb-3">{t("home.countdownLabel")}</p>
            <Countdown />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link
              href="/matches"
              className="inline-flex items-center gap-2 bg-white text-[#1a1a2e] font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors w-full sm:w-auto justify-center"
            >
              <Icon name="calendar_month" size={20} />
              {t("home.ctaMatches")}
            </Link>
            <Link
              href="/watch"
              className="inline-flex items-center gap-2 border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white/10 transition-colors w-full sm:w-auto justify-center"
            >
              <Icon name="live_tv" size={20} />
              {t("home.ctaWatch")}
            </Link>
          </div>
        </div>
      </section>

      {/* Japan Schedule Section */}
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t("home.japanScheduleTitle")}
          </h2>
          <p className="text-gray-500">{t("home.japanScheduleSubtitle")}</p>
        </div>

        {/* W杯 GL matches highlighted */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-amber-700 mb-4 flex items-center gap-2">
            <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">{t("home.wcMainLabel")}</span>
            {t("home.groupHJapan")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {worldCupMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>

        {/* All Japan matches */}
        <div>
          <h3 className="text-lg font-bold text-gray-700 mb-4">{t("home.allSchedule")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {japanMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>

        <SourceAttribution
          sources={[
            { label: "FIFA公式 — FIFA World Cup 26", url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026" },
            { label: "JFA公式 — 日本サッカー協会", url: "https://www.jfa.jp/samuraiblue/" },
          ]}
          updatedAt="2026年3月25日"
        />

        <div className="text-center mt-8">
          <Link
            href="/matches"
            className="inline-flex items-center gap-2 bg-[#1a1a2e] text-white font-medium px-8 py-3 rounded-full hover:bg-[#16213e] transition-colors"
          >
            {t("home.seeAll104")}
            <Icon name="arrow_forward" size={18} />
          </Link>
        </div>
      </section>

      {/* Group Stage Overview */}
      <section className="bg-gray-50 py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {t("home.groupStageTitle")}
            </h2>
            <p className="text-gray-500">{t("home.groupStageSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {worldCupGroups.map((group) => (
              <div
                key={group.name}
                className={`match-card bg-white rounded-xl shadow-sm border p-4 ${group.name === "F" ? "border-red-300 ring-2 ring-red-200" : "border-gray-100"}`}
              >
                <Link href={`/groups#group-${group.name}`} className="flex items-center justify-between mb-3 hover:opacity-80">
                  <h3 className="font-bold text-lg">
                    {t("common.group")} {group.name}
                  </h3>
                  {group.name === "F" && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                      {t("common.japan")}
                    </span>
                  )}
                </Link>
                <ul className="space-y-1">
                  {group.teams.map((team) => {
                    const teamData = getTeamByName(team);
                    const isPlaceholder = /PO|勝者/.test(team);

                    return isPlaceholder || !teamData ? (
                      <li
                        key={team}
                        className="text-sm py-1 px-2 rounded text-gray-400 italic"
                      >
                        {team}
                      </li>
                    ) : (
                      <li key={team}>
                        <Link
                          href={`/teams/${teamData.code.toLowerCase()}`}
                          className={`flex items-center gap-2 text-sm py-1 px-2 rounded transition-colors ${
                            team === "日本"
                              ? "bg-red-50 text-red-700 font-bold hover:bg-red-100"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span>{teamData.flag}</span>
                          <span className="flex-1">{team}</span>
                          <Icon name="chevron_right" size={12} className="text-gray-300" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <p className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                  <Icon name="location_on" size={14} />
                  {group.venue}
                </p>
              </div>
            ))}
          </div>

          <SourceAttribution
            sources={[
              { label: "FIFA公式 — 組み合わせ抽選結果", url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026" },
            ]}
            updatedAt="2026年3月25日"
          />

          <div className="text-center mt-8">
            <Link
              href="/groups"
              className="inline-flex items-center gap-2 bg-[#1a1a2e] text-white font-medium px-8 py-3 rounded-full hover:bg-[#16213e] transition-colors"
            >
              {t("home.seeGroupDetail")}
              <Icon name="arrow_forward" size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Sections */}
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DAZN CTA */}
          <div className="bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] text-white rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 flex items-center gap-2">
              <Icon name="live_tv" size={28} />
              {t("home.daznTitle")}
            </h3>
            <p className="text-gray-300 mb-4 text-sm leading-relaxed">
              {t("home.daznDescription")}
            </p>
            <ul className="text-sm text-gray-400 space-y-2 mb-6">
              <li className="flex items-center gap-2"><Icon name="check_circle" size={18} className="text-green-400" /> {t("home.daznFeature1")}</li>
              <li className="flex items-center gap-2"><Icon name="check_circle" size={18} className="text-green-400" /> {t("home.daznFeature2")}</li>
              <li className="flex items-center gap-2"><Icon name="check_circle" size={18} className="text-green-400" /> {t("home.daznFeature3")}</li>
              <li className="flex items-center gap-2"><Icon name="check_circle" size={18} className="text-green-400" /> {t("home.daznFeature4")}</li>
            </ul>
            <Link
              href="/watch"
              className="inline-flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-full hover:bg-gray-200 transition-colors"
            >
              {t("home.daznCta")}
              <Icon name="arrow_forward" size={18} />
            </Link>
          </div>

          {/* toto CTA */}
          <div className="bg-gradient-to-br from-purple-700 to-purple-900 text-white rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 flex items-center gap-2">
              <Icon name="confirmation_number" size={28} />
              {t("home.totoTitle")}
            </h3>
            <p className="text-gray-200 mb-4 text-sm leading-relaxed">
              {t("home.totoDescription")}
            </p>
            <ul className="text-sm text-gray-300 space-y-2 mb-6">
              <li className="flex items-center gap-2"><Icon name="check_circle" size={18} className="text-green-300" /> {t("home.totoFeature1")}</li>
              <li className="flex items-center gap-2"><Icon name="check_circle" size={18} className="text-green-300" /> {t("home.totoFeature2")}</li>
              <li className="flex items-center gap-2"><Icon name="check_circle" size={18} className="text-green-300" /> {t("home.totoFeature3")}</li>
              <li className="flex items-center gap-2"><Icon name="check_circle" size={18} className="text-green-300" /> {t("home.totoFeature4")}</li>
            </ul>
            <Link
              href="/toto"
              className="inline-flex items-center gap-2 bg-white text-purple-800 font-bold px-6 py-3 rounded-full hover:bg-gray-200 transition-colors"
            >
              {t("home.totoCta")}
              <Icon name="arrow_forward" size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* WOWOW CTA */}
      <section className="max-w-4xl mx-auto px-4 mb-12">
        <a
          href="https://h.accesstrade.net/sp/cc?rk=0100pjmj00opav"
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="block bg-gradient-to-r from-[#0b1e3d] to-[#1a3a5c] rounded-2xl p-5 sm:p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white text-[#0b1e3d] font-bold text-sm px-2.5 py-1 rounded-lg shrink-0">WOWOW</div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm sm:text-base">W杯出場選手のクラブでの活躍もチェック</p>
              <p className="text-gray-400 text-xs mt-0.5">CL・ラ・リーガなど欧州サッカーをライブ配信</p>
            </div>
            <Icon name="arrow_forward" size={20} className="text-white/60 shrink-0" />
          </div>
        </a>
        <img src="https://h.accesstrade.net/sp/rr?rk=0100pjmj00opav" width="1" height="1" alt="" className="hidden" />
        <p className="text-[10px] text-gray-400 mt-1 text-right">※ アフィリエイト広告を含みます</p>
      </section>
    </>
  );
}
