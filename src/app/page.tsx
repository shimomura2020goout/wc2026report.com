import Link from "next/link";
import Countdown from "@/components/Countdown";
import MatchCard from "@/components/MatchCard";
import SourceAttribution from "@/components/SourceAttribution";
import Icon from "@/components/Icon";
import { japanMatches, worldCupGroups } from "@/data/matches";

export default function Home() {
  const worldCupMatches = japanMatches.filter((m) => m.type === "worldcup_gl");

  return (
    <>
      {/* Hero Section */}
      <section className="hero-gradient text-white py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
            FIFA ワールドカップ 2026
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-2">
            北中米3カ国共催 — 史上初の48カ国・全104試合
          </p>
          <p className="text-base text-gray-400 mb-8">
            試合情報を見て、totoを買って、DAZNで観る
          </p>

          <div className="mb-8">
            <p className="text-sm text-gray-400 mb-3">開幕まであと</p>
            <Countdown />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link
              href="/matches"
              className="inline-flex items-center gap-2 bg-white text-[#1a1a2e] font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors w-full sm:w-auto justify-center"
            >
              <Icon name="calendar_month" size={20} />
              試合日程を見る
            </Link>
            <Link
              href="/watch"
              className="inline-flex items-center gap-2 border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white/10 transition-colors w-full sm:w-auto justify-center"
            >
              <Icon name="live_tv" size={20} />
              視聴ガイド
            </Link>
          </div>
        </div>
      </section>

      {/* Japan Schedule Section */}
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            日本代表 2026年 試合日程
          </h2>
          <p className="text-gray-500">W杯本大会 + 親善試合・キリンカップ</p>
        </div>

        {/* W杯 GL matches highlighted */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-amber-700 mb-4 flex items-center gap-2">
            <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">W杯本大会</span>
            グループH — 日本の対戦カード
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {worldCupMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>

        {/* All Japan matches */}
        <div>
          <h3 className="text-lg font-bold text-gray-700 mb-4">全試合スケジュール</h3>
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
          updatedAt="2026年3月9日"
        />

        <div className="text-center mt-8">
          <Link
            href="/matches"
            className="inline-flex items-center gap-2 bg-[#1a1a2e] text-white font-medium px-8 py-3 rounded-full hover:bg-[#16213e] transition-colors"
          >
            全104試合の日程を見る
            <Icon name="arrow_forward" size={18} />
          </Link>
        </div>
      </section>

      {/* Group Stage Overview */}
      <section className="bg-gray-50 py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              グループステージ 全12グループ
            </h2>
            <p className="text-gray-500">史上初の48カ国参加・12グループ制</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {worldCupGroups.map((group) => (
              <Link
                key={group.name}
                href={`/groups#group-${group.name}`}
                className={`match-card bg-white rounded-xl shadow-sm border p-4 ${group.name === "H" ? "border-red-300 ring-2 ring-red-200" : "border-gray-100"}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">
                    グループ {group.name}
                  </h3>
                  {group.name === "H" && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                      日本
                    </span>
                  )}
                </div>
                <ul className="space-y-1">
                  {group.teams.map((team) => (
                    <li
                      key={team}
                      className={`text-sm py-1 px-2 rounded ${team === "日本" ? "bg-red-50 text-red-700 font-bold" : "text-gray-700"}`}
                    >
                      {team}
                    </li>
                  ))}
                </ul>
                <p className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                  <Icon name="location_on" size={14} />
                  {group.venue}
                </p>
              </Link>
            ))}
          </div>

          <SourceAttribution
            sources={[
              { label: "FIFA公式 — 組み合わせ抽選結果", url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026" },
            ]}
            updatedAt="2026年3月9日"
          />

          <div className="text-center mt-8">
            <Link
              href="/groups"
              className="inline-flex items-center gap-2 bg-[#1a1a2e] text-white font-medium px-8 py-3 rounded-full hover:bg-[#16213e] transition-colors"
            >
              グループ詳細を見る
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
              全104試合をDAZNで観よう
            </h3>
            <p className="text-gray-300 mb-4 text-sm leading-relaxed">
              FIFA ワールドカップ 2026 は DAZNが全試合を独占ライブ配信。
              日本代表戦は無料で視聴可能！
            </p>
            <ul className="text-sm text-gray-400 space-y-2 mb-6">
              <li className="flex items-center gap-2"><Icon name="check_circle" size={18} className="text-green-400" /> 全104試合をライブ配信</li>
              <li className="flex items-center gap-2"><Icon name="check_circle" size={18} className="text-green-400" /> 日本代表戦は無料</li>
              <li className="flex items-center gap-2"><Icon name="check_circle" size={18} className="text-green-400" /> 見逃し配信・ハイライト対応</li>
              <li className="flex items-center gap-2"><Icon name="check_circle" size={18} className="text-green-400" /> スマホ・タブレット・TVで視聴可</li>
            </ul>
            <Link
              href="/watch"
              className="inline-flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-full hover:bg-gray-200 transition-colors"
            >
              視聴方法を詳しく見る
              <Icon name="arrow_forward" size={18} />
            </Link>
          </div>

          {/* toto CTA */}
          <div className="bg-gradient-to-br from-purple-700 to-purple-900 text-white rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 flex items-center gap-2">
              <Icon name="confirmation_number" size={28} />
              W杯をもっと楽しむ！toto
            </h3>
            <p className="text-gray-200 mb-4 text-sm leading-relaxed">
              W杯の試合結果を予想してtotoを購入！
              的中すれば最大6億円の大チャンス。
            </p>
            <ul className="text-sm text-gray-300 space-y-2 mb-6">
              <li className="flex items-center gap-2"><Icon name="check_circle" size={18} className="text-green-300" /> W杯の試合がtoto対象に</li>
              <li className="flex items-center gap-2"><Icon name="check_circle" size={18} className="text-green-300" /> 1口100円から購入可能</li>
              <li className="flex items-center gap-2"><Icon name="check_circle" size={18} className="text-green-300" /> ネットでかんたん購入</li>
              <li className="flex items-center gap-2"><Icon name="check_circle" size={18} className="text-green-300" /> 当サイトで対象試合を確認</li>
            </ul>
            <Link
              href="/toto"
              className="inline-flex items-center gap-2 bg-white text-purple-800 font-bold px-6 py-3 rounded-full hover:bg-gray-200 transition-colors"
            >
              totoゾーンへ
              <Icon name="arrow_forward" size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
