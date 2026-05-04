import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import MatchCard from "@/components/MatchCard";
import SourceAttribution from "@/components/SourceAttribution";
import { BreadcrumbJsonLd, SportsEventJsonLd } from "@/components/JsonLd";
import { allWorldCupMatches, formatMatchDate } from "@/data/matches";
import { getLocale, getDictionary, createTranslator } from "@/i18n/index";
import { pageAlternates, absoluteLocaleUrl } from "@/lib/i18nLinks";
import { localizedTeamNameByJa } from "@/data/teamsI18n";

const BASE_URL = "https://www.wc2026report.com";

// "20260615" → "2026-06-15"
function parseDateParam(yyyymmdd: string): string | null {
  if (!/^\d{8}$/.test(yyyymmdd)) return null;
  const y = yyyymmdd.slice(0, 4);
  const m = yyyymmdd.slice(4, 6);
  const d = yyyymmdd.slice(6, 8);
  return `${y}-${m}-${d}`;
}

function dateParamFromIso(iso: string): string {
  return iso.replace(/-/g, "");
}

// ========================================
// 静的パス生成 — 大会期間中の全ユニーク日付
// ========================================
export function generateStaticParams() {
  const uniqueDates = Array.from(new Set(allWorldCupMatches.map((m) => m.date)));
  return uniqueDates.map((d) => ({ yyyymmdd: dateParamFromIso(d) }));
}

// ========================================
// メタデータ
// ========================================
type Props = { params: Promise<{ locale: string; yyyymmdd: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { yyyymmdd } = await params;
  const locale = await getLocale();
  const isoDate = parseDateParam(yyyymmdd);
  if (!isoDate) return { title: "日付が見つかりません" };

  const matches = allWorldCupMatches.filter((m) => m.date === isoDate);
  if (matches.length === 0) return { title: "日付が見つかりません" };

  const formatted = formatMatchDate(isoDate);
  const title = `${formatted} W杯2026 試合日程・キックオフ時間（日本時間）｜全${matches.length}試合`;

  // 主要対戦カードを抜粋して description に
  const featured = matches
    .slice(0, 3)
    .map((m) => `${m.homeTeam} vs ${m.awayTeam}`)
    .join("、");
  const description = `${formatted}に行われるFIFAワールドカップ2026の全${matches.length}試合の日本時間キックオフ・会場・テレビ放送一覧。${featured}など。`;

  const path = `/matches/date/${yyyymmdd}`;
  return {
    title,
    description,
    alternates: pageAlternates(locale, path),
    openGraph: {
      title,
      description,
      url: absoluteLocaleUrl(locale, path),
      type: "website",
    },
  };
}

// ========================================
// ページ本体
// ========================================
export default async function DateMatchesPage({ params }: Props) {
  const { yyyymmdd } = await params;
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);
  const isoDate = parseDateParam(yyyymmdd);
  if (!isoDate) notFound();

  const matches = allWorldCupMatches
    .filter((m) => m.date === isoDate)
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff));

  if (matches.length === 0) notFound();

  const formatted = formatMatchDate(isoDate);

  // 前後日へのナビゲーション
  const allDates = Array.from(new Set(allWorldCupMatches.map((m) => m.date))).sort();
  const currentIdx = allDates.indexOf(isoDate);
  const prevDate = currentIdx > 0 ? allDates[currentIdx - 1] : null;
  const nextDate = currentIdx < allDates.length - 1 ? allDates[currentIdx + 1] : null;

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t("nav.home"), url: BASE_URL },
        { name: t("nav.matches"), url: `${BASE_URL}/matches` },
        { name: formatted, url: `${BASE_URL}/matches/date/${yyyymmdd}` },
      ]} />

      {matches.map((m) => {
        const homeName = localizedTeamNameByJa(m.homeTeam, locale);
        const awayName = localizedTeamNameByJa(m.awayTeam, locale);
        return (
          <SportsEventJsonLd
            key={m.id}
            name={`W杯2026 ${m.typeLabel}: ${homeName} vs ${awayName}`}
            startDate={`${m.date}T${m.kickoff}:00+09:00`}
            location={`${m.venue}（${m.city}）`}
            homeTeam={homeName}
            awayTeam={awayName}
            description={`FIFAワールドカップ2026 ${m.typeLabel}。${homeName} vs ${awayName}.`}
            url={`${BASE_URL}/matches/date/${yyyymmdd}`}
          />
        );
      })}

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* パンくず */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-gray-600">{t("nav.home")}</Link>
          <span>/</span>
          <Link href="/matches" className="hover:text-gray-600">{t("nav.matches")}</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">{formatted}</span>
        </nav>

        {/* ── ヘッダー ── */}
        <div className="rounded-2xl p-6 sm:p-8 mb-8 bg-gradient-to-br from-amber-50 via-white to-orange-50 border border-amber-200">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="calendar_today" size={28} className="text-amber-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {formatted} W杯2026 試合日程
            </h1>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            この日に行われるFIFAワールドカップ2026の全{matches.length}試合のキックオフ時刻（日本時間／JST）と会場・放送予定です。
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-semibold">
              全{matches.length}試合
            </span>
          </div>
        </div>

        {/* ── 日付ナビ ── */}
        <div className="flex items-center justify-between mb-6 gap-3">
          {prevDate ? (
            <Link
              href={`/matches/date/${dateParamFromIso(prevDate)}`}
              className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg"
            >
              <Icon name="arrow_back" size={16} />
              前日（{formatMatchDate(prevDate)}）
            </Link>
          ) : <span />}
          {nextDate ? (
            <Link
              href={`/matches/date/${dateParamFromIso(nextDate)}`}
              className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg"
            >
              翌日（{formatMatchDate(nextDate)}）
              <Icon name="arrow_forward" size={16} />
            </Link>
          ) : <span />}
        </div>

        {/* ── 試合一覧 ── */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="sports_soccer" size={20} className="text-amber-600" />
            キックオフ順 全{matches.length}試合
          </h2>
          <div className="space-y-3">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>

        {/* 関連リンク */}
        <div className="flex flex-wrap gap-3 mb-8">
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
          dataNote="試合スケジュールは2025年12月のFIFA抽選結果に基づく。日本時間表記。"
        />
      </div>
    </>
  );
}
