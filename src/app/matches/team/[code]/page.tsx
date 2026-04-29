import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import MatchCard from "@/components/MatchCard";
import SourceAttribution from "@/components/SourceAttribution";
import { BreadcrumbJsonLd, SportsEventJsonLd } from "@/components/JsonLd";
import { allTeams } from "@/data/teams";
import { allWorldCupMatches, formatMatchDate } from "@/data/matches";

const BASE_URL = "https://www.wc2026report.com";

// 米国・カナダ・メキシコの主要会場と日本との時差（2026年6〜7月はサマータイム期）
// 表示用：日本時間との「ズレ」を絶対値で示す（例：JSTから-13時間）
const VENUE_TIMEZONES: { region: string; offsetFromJst: string; cities: string }[] = [
  { region: "米国東部（EDT）", offsetFromJst: "JST －13時間", cities: "ニューヨーク／ボストン／フィラデルフィア／マイアミ／アトランタ／トロント" },
  { region: "米国中部（CDT）", offsetFromJst: "JST －14時間", cities: "ダラス／ヒューストン／カンザスシティ／メキシコシティ／モンテレイ／グアダラハラ" },
  { region: "米国西部（PDT）", offsetFromJst: "JST －16時間", cities: "ロサンゼルス／サンフランシスコ／シアトル／バンクーバー" },
];

// ========================================
// 静的パス生成 — 48カ国分（プレースホルダー除く）
// ========================================
export function generateStaticParams() {
  return allTeams
    .filter((t) => !t.isPlaceholder)
    .map((t) => ({ code: t.code.toLowerCase() }));
}

// ========================================
// メタデータ
// ========================================
type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const team = allTeams.find((t) => t.code.toLowerCase() === code.toLowerCase());
  if (!team || team.isPlaceholder) return { title: "チームが見つかりません" };

  const title = `${team.name}代表 W杯2026 試合日程・キックオフ時間（日本時間）｜全試合まとめ`;
  const description = `${team.name}代表のFIFAワールドカップ2026 全試合スケジュール。日本時間（JST）でのキックオフ時刻、会場、テレビ放送予定、グループ${team.group}の対戦相手情報。${team.flag} FIFAランキング${team.fifaRanking}位。`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/matches/team/${team.code.toLowerCase()}` },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/matches/team/${team.code.toLowerCase()}`,
      type: "website",
    },
  };
}

// ========================================
// ページ本体
// ========================================
export default async function TeamMatchesPage({ params }: Props) {
  const { code } = await params;
  const team = allTeams.find((t) => t.code.toLowerCase() === code.toLowerCase());
  if (!team || team.isPlaceholder) notFound();

  // このチームの試合（GS3試合 + プレースホルダーKOで該当しそうなもの）
  const teamMatches = allWorldCupMatches.filter(
    (m) => m.homeTeam === team.name || m.awayTeam === team.name
  );

  // 同グループの他チーム
  const groupTeams = allTeams.filter(
    (t) => t.group === team.group && t.code !== team.code && !t.isPlaceholder
  );

  // 構造化データ用：startDateをISO 8601 (JST) に変換
  const sportsEvents = teamMatches.map((m) => {
    const startDate = `${m.date}T${m.kickoff}:00+09:00`;
    return {
      id: m.id,
      name: `W杯2026 ${m.typeLabel}: ${m.homeTeam} vs ${m.awayTeam}`,
      startDate,
      location: `${m.venue}（${m.city}）`,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      description: `FIFAワールドカップ2026 ${m.typeLabel}。${m.homeTeam}と${m.awayTeam}の対戦。`,
    };
  });

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "ホーム", url: BASE_URL },
        { name: "試合日程", url: `${BASE_URL}/matches` },
        { name: `${team.name}代表`, url: `${BASE_URL}/matches/team/${team.code.toLowerCase()}` },
      ]} />

      {sportsEvents.map((ev) => (
        <SportsEventJsonLd
          key={ev.id}
          name={ev.name}
          startDate={ev.startDate}
          location={ev.location}
          homeTeam={ev.homeTeam}
          awayTeam={ev.awayTeam}
          description={ev.description}
          url={`${BASE_URL}/matches/team/${team.code.toLowerCase()}`}
        />
      ))}

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* パンくず */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-gray-600">ホーム</Link>
          <span>/</span>
          <Link href="/matches" className="hover:text-gray-600">試合日程</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">{team.name}代表</span>
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {team.name}代表 W杯2026 試合日程
              </h1>
              <p className="text-sm text-gray-600 mb-3">
                FIFAワールドカップ2026における{team.name}代表の全試合キックオフ時間（日本時間／JST）一覧です。
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-semibold">
                  FIFAランキング {team.fifaRanking}位
                </span>
                <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-medium">
                  グループ {team.group}
                </span>
                <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                  {team.regionLabel}
                </span>
                <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                  W杯出場 {team.wcAppearances}回
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 試合日程一覧 ── */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Icon name="sports_soccer" size={20} className="text-amber-600" />
            {team.name}代表 全試合（日本時間）
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            キックオフ時刻はすべて日本時間（JST）。グループステージ3試合を表示。決勝トーナメント進出時は別ページの組み合わせ表をご参照ください。
          </p>
          <div className="space-y-3">
            {teamMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>

        {/* ── 日本との時差パネル ── */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Icon name="schedule" size={20} className="text-amber-600" />
            開催地と日本との時差
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            2026年W杯は米国・カナダ・メキシコの3カ国共催。会場のタイムゾーンによって日本時間でのキックオフ時刻が変わります。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {VENUE_TIMEZONES.map((tz) => (
              <div key={tz.region} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="text-sm font-bold text-gray-900 mb-1">{tz.region}</div>
                <div className="text-xs text-amber-700 font-mono mb-2">{tz.offsetFromJst}</div>
                <div className="text-xs text-gray-600 leading-relaxed">{tz.cities}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 同グループのチーム ── */}
        {groupTeams.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="shield" size={20} className="text-amber-600" />
              グループ{team.group}の対戦相手
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {groupTeams.map((t) => (
                <Link
                  key={t.code}
                  href={`/matches/team/${t.code.toLowerCase()}`}
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md hover:border-gray-300 transition-all"
                >
                  <span className="text-2xl">{t.flag}</span>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{t.name}代表</p>
                    <p className="text-xs text-gray-400">FIFA {t.fifaRanking}位 / {t.regionLabel}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 関連リンク */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href={`/teams/${team.code.toLowerCase()}`}
            className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg"
          >
            <Icon name="info" size={16} />
            {team.name}代表 チーム情報
          </Link>
          <Link
            href="/matches"
            className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg"
          >
            <Icon name="calendar_month" size={16} />
            全104試合 日程一覧
          </Link>
          <Link
            href="/kickoff"
            className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg"
          >
            <Icon name="schedule" size={16} />
            日本時間 早見表
          </Link>
          <Link
            href="/watch"
            className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg"
          >
            <Icon name="tv" size={16} />
            放送・視聴ガイド
          </Link>
        </div>

        <SourceAttribution
          sources={[
            { label: "FIFA公式 — FIFA World Cup 26", url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026" },
          ]}
          updatedAt={formatMatchDate("2026-04-30")}
          dataNote="試合スケジュールは2025年12月のFIFA抽選結果に基づく。日本時間表記。放送局は変更の可能性あり。"
        />
      </div>
    </>
  );
}
