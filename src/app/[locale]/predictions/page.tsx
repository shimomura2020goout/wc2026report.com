import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import TotoGuideSection from "@/components/TotoGuideSection";
import { allWorldCupMatches } from "@/data/matches";
import PredictionsClient from "./PredictionsClient";
import { getLocale, getDictionary, createTranslator } from "@/i18n/index";
import { pageAlternates } from "@/lib/i18nLinks";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);
  return {
    title: t("predictions.metaTitle"),
    description: t("predictions.metaDescription"),
    alternates: pageAlternates(locale, "/predictions"),
  };
}

export const revalidate = 300;

export default function PredictionsPage() {
  // 全104試合を対象（プレースホルダーのKO対戦は表示するが投票UIはロックされる）
  const matches = [...allWorldCupMatches].sort(
    (a, b) => a.date.localeCompare(b.date) || a.kickoff.localeCompare(b.kickoff)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Icon name="poll" size={32} className="text-gray-700" />
        勝敗予想 & totoゾーン
      </h1>
      <p className="text-gray-500 mb-6 text-sm">
        全{matches.length}試合の勝敗をタップで予想。的中率はマイページ、totoの買い方は下部で確認できます。
      </p>

      {/* toto販売開始間近 告知バナー */}
      <Link
        href="/news/wcup-toto-launch-prediction-may-june-2026"
        className="group block mb-6 rounded-2xl border-2 border-pink-300 bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 p-4 sm:p-5 hover:border-pink-400 hover:shadow-md transition-all"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-md">
            <Icon name="local_fire_department" size={28} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-pink-600 text-white font-bold">
                販売開始間近
              </span>
              <span className="text-[10px] sm:text-xs text-pink-700 font-medium">5/28〜6/1濃厚 ／ 6/1が最有力</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
              W杯2026 toto・WINNER販売開始の公式発表は「5/28〜6/1」が濃厚
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
              2022年カタール大会の「開幕14日前ルール」から逆算した独自予測。楽天totoのチェックリスト＆カレンダー登録リンクを掲載中。
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-pink-700 font-semibold mt-2 group-hover:translate-x-1 transition-transform">
              予測記事を読む
              <Icon name="arrow_forward" size={14} />
            </span>
          </div>
        </div>
      </Link>

      <PredictionsClient matches={matches} />

      {/* toto 買い方ガイド（旧 /toto ページを統合） */}
      <TotoGuideSection />
    </div>
  );
}
