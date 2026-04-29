import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import SourceAttribution from "@/components/SourceAttribution";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/JsonLd";
import { allWorldCupMatches, japanMatches, formatMatchDate, type Match } from "@/data/matches";

const BASE_URL = "https://www.wc2026report.com";

// 時間帯バケット定義（JST）
type Bucket = {
  id: string;
  label: string;
  range: string;
  description: string;
  startHour: number; // inclusive
  endHour: number;   // exclusive
  emoji: string;
  color: string;
};

const TIME_BUCKETS: Bucket[] = [
  { id: "deep-night", label: "深夜帯", range: "0:00〜4:00", description: "就寝時間に重なる時間帯。録画／追っかけ再生に向く", startHour: 0, endHour: 4, emoji: "🌙", color: "bg-indigo-50 border-indigo-200 text-indigo-900" },
  { id: "early-morning", label: "早朝帯", range: "4:00〜8:00", description: "起床直後の生視聴に向く時間帯。日本代表のオランダ戦もこの帯", startHour: 4, endHour: 8, emoji: "🌅", color: "bg-orange-50 border-orange-200 text-orange-900" },
  { id: "morning", label: "午前帯", range: "8:00〜12:00", description: "出勤・通学前後の生視聴。日本戦も配置されやすい", startHour: 8, endHour: 12, emoji: "☀️", color: "bg-yellow-50 border-yellow-200 text-yellow-900" },
  { id: "afternoon", label: "午後帯", range: "12:00〜18:00", description: "ランチタイム〜夕方。仕事中の人は録画推奨", startHour: 12, endHour: 18, emoji: "🌤️", color: "bg-sky-50 border-sky-200 text-sky-900" },
  { id: "evening", label: "夜間帯", range: "18:00〜24:00", description: "夜のリビング視聴に最適。試合数は少ない", startHour: 18, endHour: 24, emoji: "🌃", color: "bg-purple-50 border-purple-200 text-purple-900" },
];

function getBucket(kickoff: string): Bucket | null {
  const hour = parseInt(kickoff.slice(0, 2), 10);
  return TIME_BUCKETS.find((b) => hour >= b.startHour && hour < b.endHour) ?? null;
}

function bucketCount(matches: Match[], bucket: Bucket): number {
  return matches.filter((m) => {
    const b = getBucket(m.kickoff);
    return b?.id === bucket.id;
  }).length;
}

export const metadata: Metadata = {
  title: "W杯2026 日本時間キックオフ早見表｜全104試合の時間帯別まとめ（JST）",
  description: "FIFAワールドカップ2026の全104試合を日本時間（JST）の時間帯別にまとめた早見表。早朝・午前・深夜・夜間どの時間帯にどの試合があるか、生視聴に向く試合・録画推奨の試合を一覧で確認できます。日本代表3戦の日本時間も掲載。",
  alternates: { canonical: `${BASE_URL}/kickoff` },
  openGraph: {
    title: "W杯2026 日本時間キックオフ早見表｜全104試合の時間帯別まとめ",
    description: "全104試合を日本時間の時間帯別に分類。早朝・午前・深夜・夜間どの時間帯にどの試合があるか早見表でチェック。",
    url: `${BASE_URL}/kickoff`,
    type: "website",
  },
};

const FAQ_ITEMS = [
  {
    question: "W杯2026は日本時間で何時から始まりますか？",
    answer: "開幕戦のメキシコ vs 南アフリカは2026年6月12日（金）の日本時間4:00キックオフです。米国・カナダ・メキシコ共催のため、ほとんどの試合が日本時間の早朝〜午前にかけて行われます。",
  },
  {
    question: "日本代表の試合は日本時間で何時ですか？",
    answer: "第1戦 オランダ戦：6/15（月）5:00キックオフ。第2戦 チュニジア戦：6/21（日）13:00キックオフ。第3戦 スウェーデン戦：6/26（金）8:00キックオフ。すべて日本時間（JST）。",
  },
  {
    question: "深夜時間帯（0〜4時）の試合は多いですか？",
    answer: "グループステージは深夜帯にも複数試合が組まれています。仕事や学校がある方は録画／追っかけ再生での視聴が現実的です。",
  },
  {
    question: "全試合を見るならどの放送がおすすめですか？",
    answer: "DAZNが全104試合を独占ライブ配信します。地上波ではNHK総合・日本テレビ・フジテレビが計58試合を生中継予定です。",
  },
];

export default async function KickoffPage() {
  // 日本代表のW杯3戦のみ抽出
  const japanWcMatches = japanMatches.filter(
    (m) => m.type === "worldcup_gl" || m.type === "worldcup_ko"
  );

  // 各バケットの試合数
  const bucketStats = TIME_BUCKETS.map((b) => ({
    bucket: b,
    count: bucketCount(allWorldCupMatches, b),
  }));

  // 各バケットの代表的な試合（最大8件）
  const bucketSamples = TIME_BUCKETS.map((b) => ({
    bucket: b,
    matches: allWorldCupMatches
      .filter((m) => {
        const bk = getBucket(m.kickoff);
        return bk?.id === b.id;
      })
      .sort((a, b2) => a.date.localeCompare(b2.date) || a.kickoff.localeCompare(b2.kickoff))
      .slice(0, 8),
  }));

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "ホーム", url: BASE_URL },
        { name: "日本時間キックオフ早見表", url: `${BASE_URL}/kickoff` },
      ]} />
      <FAQJsonLd questions={FAQ_ITEMS} />

      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* パンくず */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-gray-600">ホーム</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">日本時間キックオフ早見表</span>
        </nav>

        {/* ── ヘッダー ── */}
        <div className="rounded-2xl p-6 sm:p-8 mb-8 bg-gradient-to-br from-amber-50 via-white to-orange-50 border border-amber-200">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="schedule" size={28} className="text-amber-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              W杯2026 日本時間キックオフ早見表
            </h1>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            FIFAワールドカップ2026 全104試合を、日本時間（JST）の時間帯別にまとめました。
            米国・カナダ・メキシコ共催のため、多くの試合が日本時間の早朝〜午前に集中します。
            生視聴に向く試合と録画推奨の試合を確認して、観戦計画にお役立てください。
          </p>
        </div>

        {/* ── 日本代表3戦サマリー ── */}
        {japanWcMatches.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">🇯🇵</span>
              日本代表 グループF 3戦の日本時間
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {japanWcMatches.slice(0, 3).map((m) => {
                const opponent = m.homeTeam === "日本" ? m.awayTeam : m.homeTeam;
                const bucket = getBucket(m.kickoff);
                return (
                  <div key={m.id} className="bg-white rounded-xl border-2 border-red-200 p-4 shadow-sm">
                    <div className="text-xs text-red-700 font-semibold mb-1">
                      {m.typeLabel}
                    </div>
                    <div className="text-base font-bold text-gray-900 mb-1">
                      vs {opponent}
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      {formatMatchDate(m.date)}
                    </div>
                    <div className="text-2xl font-mono font-bold text-red-700 mb-1">
                      {m.kickoff} <span className="text-xs font-sans text-gray-500">JST</span>
                    </div>
                    {bucket && (
                      <div className="text-xs text-gray-600">
                        {bucket.emoji} {bucket.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 時間帯別ヒートマップ ── */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Icon name="bar_chart" size={20} className="text-amber-600" />
            時間帯別 試合数（全104試合）
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            キックオフ時刻（日本時間）の時間帯別にグルーピング。試合数の多い時間帯を一目で確認できます。
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {bucketStats.map(({ bucket, count }) => (
              <a
                key={bucket.id}
                href={`#bucket-${bucket.id}`}
                className={`block rounded-xl border-2 p-4 hover:shadow-md transition-all ${bucket.color}`}
              >
                <div className="text-2xl mb-1">{bucket.emoji}</div>
                <div className="text-sm font-bold mb-1">{bucket.label}</div>
                <div className="text-xs font-mono opacity-70 mb-2">{bucket.range}</div>
                <div className="text-2xl font-bold">{count}<span className="text-xs font-normal ml-1">試合</span></div>
              </a>
            ))}
          </div>
        </section>

        {/* ── 時間帯別 試合サンプル ── */}
        {bucketSamples.map(({ bucket, matches }) => (
          <section key={bucket.id} id={`bucket-${bucket.id}`} className="mb-10 scroll-mt-20">
            <div className={`rounded-xl border-2 p-4 mb-4 ${bucket.color}`}>
              <h2 className="text-lg font-bold flex items-center gap-2 mb-1">
                <span className="text-2xl">{bucket.emoji}</span>
                {bucket.label}（{bucket.range} JST）
              </h2>
              <p className="text-xs opacity-80">{bucket.description}</p>
            </div>
            {matches.length === 0 ? (
              <p className="text-sm text-gray-500 px-1">この時間帯の試合はありません。</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">日付</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">JST</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">対戦</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs hidden sm:table-cell">会場</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((m) => {
                      const dateParam = m.date.replace(/-/g, "");
                      const isJapan = m.isJapan;
                      return (
                        <tr key={m.id} className={`border-t border-gray-100 ${isJapan ? "bg-red-50" : "hover:bg-gray-50"}`}>
                          <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                            <Link href={`/matches/date/${dateParam}`} className="hover:underline text-blue-700">
                              {formatMatchDate(m.date)}
                            </Link>
                          </td>
                          <td className="px-3 py-2 font-mono font-semibold text-gray-900 whitespace-nowrap">{m.kickoff}</td>
                          <td className="px-3 py-2">
                            <span className={isJapan ? "font-bold text-red-700" : "text-gray-900"}>
                              {m.homeTeam}
                            </span>
                            <span className="text-gray-400 mx-1">vs</span>
                            <span className={isJapan ? "font-bold text-red-700" : "text-gray-900"}>
                              {m.awayTeam}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-500 hidden sm:table-cell">
                            {m.city}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {bucketCount(allWorldCupMatches, bucket) > matches.length && (
                  <p className="text-xs text-gray-500 mt-2 px-1">
                    ※上記は最初の{matches.length}試合。全{bucketCount(allWorldCupMatches, bucket)}試合は
                    <Link href="/matches" className="text-blue-600 hover:underline ml-1">日程一覧</Link>
                    でご確認ください。
                  </p>
                )}
              </div>
            )}
          </section>
        ))}

        {/* ── FAQ ── */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Icon name="help_outline" size={20} className="text-amber-600" />
            よくある質問
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item) => (
              <div key={item.question} className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="font-semibold text-sm text-gray-900 mb-2">Q. {item.question}</p>
                <p className="text-sm text-gray-700 leading-relaxed">A. {item.answer}</p>
              </div>
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
            href="/matches/team/jpn"
            className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg"
          >
            <span>🇯🇵</span>
            日本代表 試合日程
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
