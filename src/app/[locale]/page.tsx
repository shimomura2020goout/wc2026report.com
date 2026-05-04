import Link from "next/link";
import Countdown from "@/components/Countdown";
import MatchCard from "@/components/MatchCard";
import SourceAttribution from "@/components/SourceAttribution";
import Icon from "@/components/Icon";
import StickyPromoBanner from "@/components/StickyPromoBanner";
import SquadAnnouncementBanner from "@/components/SquadAnnouncementBanner";
import OrganicTotoBanner from "@/components/OrganicTotoBanner";
import HomeRankingTeaser from "@/components/HomeRankingTeaser";
import { japanMatches, worldCupGroups } from "@/data/matches";
import { calendarEvents } from "@/data/events";
import { getTeamByName } from "@/data/teams";
import { localizedTeamName, localizedTeamNameByJa } from "@/data/teamsI18n";
import { getLocale, getDictionary, createTranslator } from "@/i18n/index";

export default async function Home() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);

  const worldCupMatches = japanMatches.filter((m) => m.type === "worldcup_gl");
  const finishedMatches = japanMatches.filter((m) => m.status === "finished");
  const upcomingMatches = japanMatches.filter((m) => m.status !== "finished");
  const squadAnnouncementEvent = calendarEvents.find((e) => e.id === "evt-jp-squad-announcement");

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
        {squadAnnouncementEvent && (
          <SquadAnnouncementBanner event={squadAnnouncementEvent} />
        )}

        <OrganicTotoBanner />

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

        {/* Finished matches — 2026年 日本代表 試合結果 */}
        {finishedMatches.length > 0 && (
          <div className="mb-8">
            {/* PC: 常に表示 */}
            <div className="hidden sm:block">
              <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Icon name="check_circle" size={20} className="text-green-600" />
                2026年 日本代表 試合結果
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {finishedMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
            {/* SP: アコーディオン */}
            <details className="sm:hidden group">
              <summary className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <Icon name="check_circle" size={20} className="text-green-600" />
                2026年 日本代表 試合結果
                <span className="text-xs text-gray-400 ml-auto">({finishedMatches.length}試合)</span>
                <Icon name="expand_more" size={20} className="text-gray-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="grid grid-cols-1 gap-4">
                {finishedMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </details>
          </div>
        )}

        {/* Upcoming matches — 今後の試合 */}
        <div>
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Icon name="schedule" size={20} className="text-blue-600" />
            {t("home.allSchedule")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>

        <SourceAttribution
          sources={[
            { label: "FIFA公式 — FIFA World Cup 26", url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026" },
            { label: "JFA公式 — 日本サッカー協会", url: "https://www.jfa.jp/samuraiblue/" },
          ]}
          updatedAt="2026年4月15日"
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

      {/* 開催まで盛り上がろうセクション: ランキング集計 + 動線カード */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-rose-50 py-12 sm:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block text-xs font-bold text-rose-600 bg-rose-100 px-3 py-1 rounded-full mb-3">
              🎉 W杯2026 開催まで約2か月
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              みんなでW杯2026を盛り上げよう
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              マイページで名前をつけて、予想ページで対戦結果を予想。ランキング上位を目指して気分を盛り上げましょう。
            </p>
          </div>

          {/* ランキング集計結果 */}
          <div className="mb-10">
            <HomeRankingTeaser />
          </div>

          {/* 4つの動線カード */}
          <h3 className="text-center text-sm font-bold text-gray-600 mb-4 flex items-center justify-center gap-2">
            <Icon name="route" size={18} className="text-indigo-500" />
            開催までの約2か月、こう楽しもう
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Link
              href="/mypage"
              className="group bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:border-green-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-3">
                <Icon name="account_circle" size={22} className="text-white" />
              </div>
              <div className="text-xs font-bold text-green-700 mb-0.5">STEP 1</div>
              <div className="font-bold text-gray-900 text-sm sm:text-base mb-1">マイページ</div>
              <div className="text-xs text-gray-500 leading-snug">ニックネーム登録</div>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-green-600 group-hover:gap-2 transition-all">
                登録する <Icon name="arrow_forward" size={14} />
              </div>
            </Link>

            <Link
              href="/teams"
              className="group bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center mb-3">
                <Icon name="flag" size={22} className="text-white" />
              </div>
              <div className="text-xs font-bold text-blue-700 mb-0.5">STEP 2</div>
              <div className="font-bold text-gray-900 text-sm sm:text-base mb-1">出場国チェック</div>
              <div className="text-xs text-gray-500 leading-snug">対戦相手を予習</div>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600 group-hover:gap-2 transition-all">
                32か国を見る <Icon name="arrow_forward" size={14} />
              </div>
            </Link>

            <Link
              href="/predictions"
              className="group bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:border-orange-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-3">
                <Icon name="poll" size={22} className="text-white" />
              </div>
              <div className="text-xs font-bold text-orange-700 mb-0.5">STEP 3</div>
              <div className="font-bold text-gray-900 text-sm sm:text-base mb-1">勝敗を予想</div>
              <div className="text-xs text-gray-500 leading-snug">全試合でポイント獲得</div>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-orange-600 group-hover:gap-2 transition-all">
                予想する <Icon name="arrow_forward" size={14} />
              </div>
            </Link>

            <Link
              href="/rankings"
              className="group bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:border-amber-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mb-3">
                <Icon name="emoji_events" size={22} className="text-white" />
              </div>
              <div className="text-xs font-bold text-amber-700 mb-0.5">STEP 4</div>
              <div className="font-bold text-gray-900 text-sm sm:text-base mb-1">ランキング</div>
              <div className="text-xs text-gray-500 leading-snug">上位の的中者を見る</div>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-amber-600 group-hover:gap-2 transition-all">
                ランキング <Icon name="arrow_forward" size={14} />
              </div>
            </Link>
          </div>
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
                    const displayName = teamData
                      ? localizedTeamName(teamData, locale)
                      : localizedTeamNameByJa(team, locale);

                    return isPlaceholder || !teamData ? (
                      <li
                        key={team}
                        className="text-sm py-1 px-2 rounded text-gray-400 italic"
                      >
                        {displayName}
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
                          <span className="flex-1">{displayName}</span>
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
            updatedAt="2026年4月15日"
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
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/watch"
                className="inline-flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-full hover:bg-gray-200 transition-colors"
              >
                {t("home.daznCta")}
                <Icon name="arrow_forward" size={18} />
              </Link>
              <a
                href="https://h.accesstrade.net/sp/cc?rk=0100ph9q00opav"
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                className="inline-flex items-center gap-2 border border-white/30 text-white font-medium px-5 py-2.5 rounded-full hover:bg-white/10 transition-colors text-sm"
              >
                <Icon name="business" size={16} />
                法人向け DAZN for BUSINESS
                <Icon name="open_in_new" size={14} />
              </a>
              <img src="https://h.accesstrade.net/sp/rr?rk=0100ph9q00opav" width="1" height="1" alt="" className="hidden" />
            </div>
            <p className="text-[10px] text-gray-500 mt-3">※ アフィリエイト広告を含みます</p>
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
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/toto"
                className="inline-flex items-center gap-2 bg-white text-purple-800 font-bold px-6 py-3 rounded-full hover:bg-gray-200 transition-colors"
              >
                {t("home.totoCta")}
                <Icon name="arrow_forward" size={18} />
              </Link>
              <a
                href="https://tr.affiliate-sp.docomo.ne.jp/cl/d0000000359/4739/3"
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                className="inline-flex items-center gap-2 border-2 border-white text-white font-bold px-6 py-3 rounded-full hover:bg-white/10 transition-colors text-sm"
              >
                ドコモスポーツくじで購入
                <Icon name="open_in_new" size={16} />
              </a>
            </div>
            <p className="text-[10px] text-purple-400 mt-3">※ アフィリエイト広告を含みます</p>
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

        {/* LINE CTA */}
        <div className="mt-6 bg-gradient-to-r from-[#06C755] to-[#05a847] rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#06C755"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm sm:text-base">LINE で最新情報を受け取る</p>
              <p className="text-green-100 text-xs mt-0.5">試合速報・toto予想・代表ニュースをお届け</p>
            </div>
            <a
              href="https://line.me/R/ti/p/@517lriub"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-[#06C755] font-bold text-sm px-5 py-2.5 rounded-full hover:bg-green-50 transition-colors shrink-0 flex items-center gap-1.5"
            >
              友だち追加
              <Icon name="arrow_forward" size={16} />
            </a>
          </div>
        </div>
        <img src="https://h.accesstrade.net/sp/rr?rk=0100pjmj00opav" width="1" height="1" alt="" className="hidden" />
        <p className="text-[10px] text-gray-400 mt-1 text-right">※ アフィリエイト広告を含みます</p>
      </section>

      {/* 追従プロモバナー */}
      <StickyPromoBanner />
    </>
  );
}
