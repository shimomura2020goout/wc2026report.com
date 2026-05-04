import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import SourceAttribution from "@/components/SourceAttribution";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/JsonLd";
import { formatMatchDate } from "@/data/matches";
import {
  playerSquad,
  predictedExclusions,
  squadByPosition,
  squadCounts,
  columnsCoveredCount,
  SQUAD_PHASE,
  SQUAD_ANNOUNCEMENT_AT,
  type SquadPlayer,
  type SquadPosition,
} from "@/data/japanSquad";
import { getLocale, getDictionary, createTranslator } from "@/i18n/index";
import { pageAlternates, absoluteLocaleUrl } from "@/lib/i18nLinks";

const BASE_URL = "https://www.wc2026report.com";
const PREDICTION_ARTICLE_SLUG = "japan-squad-announcement-may-15-2026";

const POSITION_META: Record<SquadPosition, { label: string; longLabel: string; color: string }> = {
  GK: { label: "GK", longLabel: "ゴールキーパー", color: "bg-yellow-100 text-yellow-900 border-yellow-300" },
  DF: { label: "DF", longLabel: "ディフェンダー", color: "bg-blue-100 text-blue-900 border-blue-300" },
  MF: { label: "MF", longLabel: "ミッドフィルダー", color: "bg-green-100 text-green-900 border-green-300" },
  FW: { label: "FW", longLabel: "フォワード", color: "bg-red-100 text-red-900 border-red-300" },
};

const FAQ_ITEMS = [
  {
    question: "日本代表のW杯2026メンバーは何人で発表されますか？",
    answer: "従来の23名から拡大し、26名（FIFA規定）。GK 3名を含む構成は変わらず、大会期間中の負傷交代もより柔軟に対応可能となります。",
  },
  {
    question: "メンバー発表会見はいつ・どこで開催されますか？",
    answer: "2026年5月15日（金）14:00〜（JST）、JFAハウス（東京都文京区サッカー通り）。森保一監督が出席し、JFA公式YouTube・NHK・民放各局で生中継予定です。",
  },
  {
    question: "発表後、日本代表のW杯初戦はいつですか？",
    answer: "2026年6月15日（月）日本時間5:00キックオフ、AT&Tスタジアム（ダラス）にてオランダと対戦します。グループF初戦です。",
  },
  {
    question: "2022年カタール大会のメンバーから誰が外れる予想ですか？",
    answer: "本紙予想では遠藤航（リヴァプール）、南野拓実（モナコ）が予想落選。佐野海舟・守田英正・田中碧が中盤の軸に定着し、長友佑都の衝撃復帰や鈴木淳之介・大橋祐紀の電撃抜擢を予想しています。",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);
  const phaseSuffix = SQUAD_PHASE === "official" ? "Official" : "Prediction";
  return {
    title: t(`japanSquad.metaTitle${phaseSuffix}`),
    description: t(`japanSquad.metaDescription${phaseSuffix}`),
    alternates: pageAlternates(locale, "/japan-squad"),
    openGraph: {
      title: t("japanSquad.ogTitle"),
      description: t("japanSquad.ogDescription"),
      url: absoluteLocaleUrl(locale, "/japan-squad"),
      type: "website",
    },
  };
}

function PlayerCard({ player }: { player: SquadPlayer }) {
  const meta = POSITION_META[player.position];
  const Inner = (
    <article className={`bg-white rounded-xl border-2 ${meta.color.replace(/bg-\S+/, "border-").split(" ")[0]} p-4 h-full flex flex-col gap-2 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full border ${meta.color}`}>
              {meta.label}
            </span>
            {player.badge && (
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                {player.badge}
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-gray-900 mt-1.5 truncate">{player.name}</h3>
          <p className="text-xs text-gray-600 truncate">{player.club}</p>
          <p className="text-[11px] text-gray-400">{player.league}</p>
        </div>
      </div>
      <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">{player.comment}</p>
      <div className="mt-auto pt-2">
        {player.columnSlug ? (
          <span className="inline-flex items-center gap-1 text-xs text-blue-700 font-medium">
            <Icon name="article" size={14} />
            選手の素顔を読む
            <Icon name="arrow_forward" size={12} />
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
            <Icon name="schedule" size={14} />
            コラム準備中
          </span>
        )}
      </div>
    </article>
  );

  if (player.columnSlug) {
    return (
      <Link href={`/news/${player.columnSlug}`} className="block h-full">
        {Inner}
      </Link>
    );
  }
  return <div className="h-full">{Inner}</div>;
}

function PositionSection({ position }: { position: SquadPosition }) {
  const players = squadByPosition(position);
  const meta = POSITION_META[position];
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span className={`inline-flex items-center justify-center text-xs font-bold w-9 h-9 rounded-full border-2 ${meta.color}`}>
          {meta.label}
        </span>
        {meta.longLabel}（{players.length}名）
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {players.map((p) => (
          <PlayerCard key={p.name} player={p} />
        ))}
      </div>
    </section>
  );
}

export default async function JapanSquadPage() {
  const counts = squadCounts();
  const totalCount = playerSquad.length;
  const coveredCount = columnsCoveredCount();
  const isPrediction = SQUAD_PHASE === "prediction";

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "ホーム", url: BASE_URL },
        { name: "日本代表 W杯2026 メンバー", url: `${BASE_URL}/japan-squad` },
      ]} />
      <FAQJsonLd questions={FAQ_ITEMS} />

      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* パンくず */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-gray-600">ホーム</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">日本代表 W杯2026 メンバー</span>
        </nav>

        {/* ── ヘッダー ── */}
        <div className="rounded-2xl p-6 sm:p-8 mb-8 bg-gradient-to-br from-red-50 via-white to-blue-50 border-2 border-red-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🇯🇵</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              日本代表 W杯2026 メンバー26人
            </h1>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            FIFAワールドカップ2026における日本代表（SAMURAI BLUE）の{isPrediction ? "本紙予想" : "公式登録"}26名をポジション別にまとめました。
            各選手の所属クラブ、特徴、深掘りコラム記事へのリンクを掲載しています。
          </p>

          <div className="flex flex-wrap gap-2 text-xs mb-4">
            {isPrediction ? (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full font-semibold">
                ⏳ 本紙予想（公式発表は2026年5月15日 14:00）
              </span>
            ) : (
              <span className="bg-green-100 text-green-900 border border-green-300 px-2.5 py-1 rounded-full font-semibold">
                ✓ 公式発表メンバー
              </span>
            )}
            <span className="bg-red-100 text-red-900 border border-red-300 px-2.5 py-1 rounded-full font-semibold">
              GK {counts.GK}
            </span>
            <span className="bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-1 rounded-full font-semibold">
              DF {counts.DF}
            </span>
            <span className="bg-green-100 text-green-900 border border-green-300 px-2.5 py-1 rounded-full font-semibold">
              MF {counts.MF}
            </span>
            <span className="bg-orange-100 text-orange-900 border border-orange-300 px-2.5 py-1 rounded-full font-semibold">
              FW {counts.FW}
            </span>
            <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
              合計 {totalCount}名
            </span>
            <span className="bg-blue-50 text-blue-800 px-2.5 py-1 rounded-full">
              選手コラム公開済 {coveredCount}/{totalCount}
            </span>
          </div>
        </div>

        {/* ── 発表会見の予告（予想モード時のみ） ── */}
        {isPrediction && (
          <SquadAnnouncementBanner announcementAt={SQUAD_ANNOUNCEMENT_AT} />
        )}

        {/* ── ポジション別26名 ── */}
        <PositionSection position="GK" />
        <PositionSection position="DF" />
        <PositionSection position="MF" />
        <PositionSection position="FW" />

        {/* ── 予想落選（予想モード時のみ） ── */}
        {isPrediction && predictedExclusions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="warning" size={20} className="text-orange-500" />
              本紙予想落選（ボーダーラインから外れると予想する5名）
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              長年の代表主軸でありつつも、4月時点での代表離れや若手台頭を理由に外れると本紙が予想する選手。森保監督の最終決断は5月15日に下されます。
            </p>
            <div className="space-y-2">
              {predictedExclusions.map((p) => (
                <div key={p.name} className="bg-orange-50 rounded-xl border border-orange-200 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-bold text-gray-900">{p.name}</span>
                    <span className="text-xs text-gray-500">{p.club}</span>
                    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-200 text-orange-900">予想落選</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{p.reason}</p>
                </div>
              ))}
            </div>
          </section>
        )}

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
            href={`/news/${PREDICTION_ARTICLE_SLUG}`}
            className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg"
          >
            <Icon name="article" size={16} />
            予想記事の詳細を読む
          </Link>
          <Link
            href="/teams/jpn"
            className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg"
          >
            <span>🇯🇵</span>
            日本代表 チーム情報
          </Link>
          <Link
            href="/matches/team/jpn"
            className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg"
          >
            <Icon name="calendar_month" size={16} />
            日本代表 試合日程
          </Link>
          <Link
            href="/news?tag=日本代表"
            className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg"
          >
            <Icon name="newspaper" size={16} />
            日本代表 関連記事
          </Link>
        </div>

        <SourceAttribution
          sources={[
            { label: "JFA公式 — SAMURAI BLUE", url: "https://www.jfa.jp/samuraiblue/" },
            { label: "Sports Nippon", url: "https://www.sponichi.co.jp/" },
            { label: "スポーツ報知", url: "https://hochi.news/" },
            { label: "Transfermarkt", url: "https://www.transfermarkt.jp/" },
          ]}
          updatedAt={formatMatchDate("2026-04-30")}
          dataNote={isPrediction
            ? "本紙予想26名は2026-04-25時点の編集部予想。最終決定は5月15日14:00のJFA発表に準拠。"
            : "公式登録メンバーは2026-05-15のJFA発表に準拠。"}
        />
      </div>
    </>
  );
}

// ========================================
// 発表会見へのカウントダウンバナー
// ========================================
function SquadAnnouncementBanner({ announcementAt }: { announcementAt: string }) {
  // SSRで初期表示する静的バージョン。残日数はクライアント側でJSによる更新は行わない
  // （静的ページのキャッシュ整合性を優先）。
  // "残り何日" は formatMatchDate と現在のbuild日時から逆算しても良いが、
  // 日本時間の表示文字列のみを記載してSSR完結とする。
  const [datePart, timePart] = announcementAt.split("T");
  const formatted = formatMatchDate(datePart);
  const time = timePart.slice(0, 5);
  return (
    <div className="rounded-xl p-5 mb-8 bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 border-2 border-amber-300">
      <div className="flex items-start gap-3">
        <Icon name="campaign" size={28} className="text-amber-700 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs font-bold text-amber-900 mb-1">公式発表会見の予定</p>
          <p className="text-base sm:text-lg font-bold text-gray-900 mb-1">
            {formatted} {time}〜（JST） JFAハウス
          </p>
          <p className="text-xs text-gray-700 leading-relaxed">
            森保一監督が出席し、W杯2026 最終登録メンバー26名を発表予定。
            JFA公式YouTube・NHK・民放各局で生中継予定。発表後、本ページは公式メンバーで自動更新します。
          </p>
        </div>
      </div>
    </div>
  );
}
