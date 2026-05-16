import Link from "next/link";
import Icon from "@/components/Icon";
import SourceAttribution from "@/components/SourceAttribution";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { broadcastInfo } from "@/data/matches";
import { getLocale, getDictionary, createTranslator } from "@/i18n/index";
import { pageAlternates } from "@/lib/i18nLinks";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);
  return {
    title: t("watch.metaTitle"),
    description: t("watch.metaDescription"),
    alternates: pageAlternates(locale, "/watch"),
  };
}

export default async function WatchPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);

  const faqData = [
    { question: t("watch.faq1Question"), answer: t("watch.faq1Answer") },
    { question: t("watch.faq2Question"), answer: t("watch.faq2Answer") },
    { question: t("watch.faq3Question"), answer: t("watch.faq3Answer") },
    { question: t("watch.faq4Question"), answer: t("watch.faq4Answer") },
  ];

  return (
    <>
    <BreadcrumbJsonLd items={[
      { name: t("nav.home"), url: "https://www.wc2026report.com" },
      { name: t("nav.watch"), url: "https://www.wc2026report.com/watch" },
    ]} />
    <FAQJsonLd questions={faqData} />
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Icon name="live_tv" size={32} className="text-gray-700" />
        {t("watch.pageTitle")}
      </h1>
      <p className="text-gray-500 mb-4">
        {t("watch.pageDescription")}
      </p>

      {/* 見逃し配信の訴求 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
        <div className="flex items-start gap-2">
          <Icon name="tips_and_updates" size={20} className="text-amber-600 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900">見逃し配信・ハイライトもDAZNで</p>
            <p className="text-xs text-amber-700 mt-1">リアルタイムで見られなかった試合も、DAZNなら見逃し配信でフルマッチ視聴が可能。日本代表戦のハイライトも配信予定です。</p>
          </div>
        </div>
      </div>

      {/* DAZN Section */}
      <section className="bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] text-white rounded-2xl p-6 sm:p-8 mb-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-white text-black font-bold text-xl px-3 py-1 rounded-lg">DAZN</div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{t("watch.daznTitle")}</h2>
            <p className="text-gray-400 mt-1">{t("watch.daznSubtitle")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="font-bold text-lg mb-2">{t("watch.daznStandard")}</h3>
            <p className="text-2xl font-bold text-white mb-1">{t("watch.daznStandardPrice")}<span className="text-sm font-normal text-gray-400">（{t("watch.taxIncluded")}）</span></p>
            <p className="text-sm text-gray-400">{t("watch.daznStandardNote")}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 border border-green-500/30">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              {t("watch.daznDmmTitle")}
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">{t("watch.daznDmmRecommended")}</span>
            </h3>
            <p className="text-2xl font-bold text-white mb-1">{t("watch.daznDmmPrice")}<span className="text-sm font-normal text-gray-400">（{t("watch.taxIncluded")}）</span></p>
            <p className="text-sm text-gray-400">{t("watch.daznDmmNote")}</p>
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
          <p className="text-green-400 font-bold text-sm mb-1 flex items-center gap-1">
            <Icon name="celebration" size={18} />
            {t("watch.japanFree")}
          </p>
          <p className="text-sm text-gray-300">{t("watch.japanFreeNote")}</p>
        </div>

        <h3 className="font-bold mb-3">{t("watch.daznPointsTitle")}</h3>
        <ul className="space-y-2 text-sm text-gray-300 mb-6">
          {[t("watch.daznPoint1"), t("watch.daznPoint2"), t("watch.daznPoint3"), t("watch.daznPoint4")].map((point, i) => (
            <li key={i} className="flex items-start gap-2">
              <Icon name="check_circle" size={18} className="text-green-400 mt-0.5" />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://h.accesstrade.net/sp/cc?rk=0100ph9q00opav"
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-gray-200 transition-colors text-center"
          >
            <Icon name="open_in_new" size={18} />
            DAZN for BUSINESS 詳細を見る
          </a>
          <img src="https://h.accesstrade.net/sp/rr?rk=0100ph9q00opav" width="1" height="1" alt="" className="hidden" />
        </div>

        {/* DAZN for BUSINESS 説明 */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="business" size={16} className="text-yellow-400" />
            <p className="text-sm text-white font-bold">DAZN for BUSINESS とは？</p>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed mb-3">
            飲食店・スポーツバー・ジム・ホテル・待合室などの<strong className="text-white">商業施設</strong>でDAZNのスポーツコンテンツを放映できる法人向けプランです。
            W杯2026の全試合をお店で上映して盛り上がりたいオーナー様におすすめです。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-[11px] text-gray-400 mb-1">小〜中規模店舗（20名以下）</p>
              <p className="text-sm font-bold text-white">年額 172,500円〜<span className="text-[10px] font-normal text-gray-400">（税込）</span></p>
              <p className="text-[10px] text-gray-500">月あたり約14,375円</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-[11px] text-gray-400 mb-1">中〜大規模店舗（21名以上）</p>
              <p className="text-sm font-bold text-white">年額 345,000円〜<span className="text-[10px] font-normal text-gray-400">（税込）</span></p>
              <p className="text-[10px] text-gray-500">月あたり約28,750円</p>
            </div>
          </div>

          <ul className="text-[11px] text-gray-400 space-y-1">
            <li className="flex items-start gap-1.5">
              <Icon name="check_circle" size={13} className="text-yellow-400 mt-0.5" />
              <span>初期費用・工事費ゼロ、最短即日導入</span>
            </li>
            <li className="flex items-start gap-1.5">
              <Icon name="check_circle" size={13} className="text-yellow-400 mt-0.5" />
              <span>Jリーグ・W杯・NFL・F1など年間10,000試合以上</span>
            </li>
            <li className="flex items-start gap-1.5">
              <Icon name="check_circle" size={13} className="text-yellow-400 mt-0.5" />
              <span>個人契約での店舗放映は規約違反です。法人利用にはfor BUSINESSが必要です</span>
            </li>
          </ul>
        </div>

        {/* 個人向けDAZN（DMM × DAZNホーダイ） */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">個人おすすめ</span>
            <p className="font-bold text-sm">DMM × DAZNホーダイ</p>
          </div>
          <p className="text-sm text-gray-300 mb-2">
            月額 <strong className="text-white text-lg">3,480円</strong><span className="text-xs text-gray-400">（税込）</span>
            でDAZNスタンダード（通常4,200円）＋DMMプレミアム（通常550円）が両方使える超お得プラン！
          </p>
          <ul className="text-xs text-gray-400 space-y-1 mb-3">
            <li className="flex items-start gap-1.5">
              <Icon name="check_circle" size={14} className="text-green-400 mt-0.5" />
              W杯全試合＋Jリーグ・プレミア・ラ・リーガなどスポーツ見放題
            </li>
            <li className="flex items-start gap-1.5">
              <Icon name="check_circle" size={14} className="text-green-400 mt-0.5" />
              DMM TVでアニメ・バラエティ・映画も見放題
            </li>
            <li className="flex items-start gap-1.5">
              <Icon name="check_circle" size={14} className="text-green-400 mt-0.5" />
              通常合計4,750円 → 1,270円もお得
            </li>
          </ul>
          <p className="text-[10px] text-gray-500">※ 個人向けDAZNのリンクは準備中です。確定次第更新します。</p>
        </div>

        <p className="text-xs text-gray-600 mt-3">{t("watch.affiliateNote")}</p>
      </section>

      {/* 地上波・BS */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Icon name="tv" size={24} className="text-gray-600" />
          {t("watch.tvTitle")}
        </h2>
        <p className="text-sm text-gray-500 mb-4">{t("watch.tvDescription")}</p>

        <div className="space-y-4">
          {[
            { info: broadcastInfo.nhk, icon: "satellite_alt" },
            { info: broadcastInfo.ntv, icon: "tv" },
            { info: broadcastInfo.fuji, icon: "tv" },
            { info: broadcastInfo.nhkbs, icon: "satellite_alt" },
          ].map(({ info, icon }) => (
            <div key={info.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Icon name={icon} size={20} className="text-gray-500" />
                  {info.name}
                </h3>
                <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                  {t("common.matchCount", { count: info.matches })}
                </span>
              </div>
              <p className="text-sm text-gray-600">{info.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WOWOW - クラブサッカー */}
      <section className="bg-gradient-to-br from-[#0b1e3d] to-[#162d56] text-white rounded-2xl p-6 sm:p-8 mb-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="bg-white text-[#0b1e3d] font-bold text-lg px-3 py-1 rounded-lg">WOWOW</div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">W杯出場選手のクラブでの活躍も</h2>
            <p className="text-gray-400 mt-1 text-sm">CL・ラ・リーガなど欧州サッカーを楽しむなら</p>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-200 mb-3">
            W杯で活躍するスター選手たちの普段のプレーもチェック！
            WOWOWでは<strong>UEFAチャンピオンズリーグ</strong>、<strong>ラ・リーガ</strong>など世界最高峰のクラブサッカーをライブ配信しています。
          </p>
          <ul className="space-y-1.5 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <Icon name="check_circle" size={16} className="text-blue-400 mt-0.5" />
              <span>UEFAチャンピオンズリーグ 全試合</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="check_circle" size={16} className="text-blue-400 mt-0.5" />
              <span>ラ・リーガ（スペインリーグ）</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="check_circle" size={16} className="text-blue-400 mt-0.5" />
              <span>月額2,530円（税込）で映画・ドラマも見放題</span>
            </li>
          </ul>
        </div>

        <a
          href="https://h.accesstrade.net/sp/cc?rk=0100pjmj00opav"
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-white text-[#0b1e3d] font-bold px-8 py-3 rounded-full hover:bg-gray-200 transition-colors text-center"
        >
          <Icon name="open_in_new" size={18} />
          WOWOWを見てみる
        </a>
        <img src="https://h.accesstrade.net/sp/rr?rk=0100pjmj00opav" width="1" height="1" alt="" className="hidden" />
        <p className="text-xs text-gray-500 mt-3">※ 本リンクはアフィリエイト広告を含みます</p>
      </section>

      {/* W杯前 親善試合 */}
      <section className="bg-blue-50 border border-blue-200 rounded-2xl p-6 sm:p-8 mb-8">
        <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
          <Icon name="sports_soccer" size={24} className="text-blue-700" />
          {t("watch.preMatchTitle")}
        </h2>
        <p className="text-sm text-blue-700 mb-4">{t("watch.preMatchDescription")}</p>
        <div className="space-y-3 text-sm">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <p className="font-bold text-gray-900 mb-1">{t("watch.vsScotland")} <span className="text-[10px] text-gray-400 ml-0.5">JST</span></p>
            <p className="text-gray-500 text-xs mb-1">{t("watch.scotlandVenue")}</p>
            <p className="text-gray-600 flex items-center gap-1">
              <Icon name="live_tv" size={16} className="text-gray-400" />
              {t("watch.scotlandBroadcast")}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <p className="font-bold text-gray-900 mb-1">{t("watch.vsEngland")} <span className="text-[10px] text-gray-400 ml-0.5">JST</span></p>
            <p className="text-gray-500 text-xs mb-1">{t("watch.englandVenue")}</p>
            <p className="text-gray-600 flex items-center gap-1">
              <Icon name="live_tv" size={16} className="text-gray-400" />
              {t("watch.englandBroadcast")}
            </p>
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-3">{t("watch.preMatchSource")}</p>
      </section>

      {/* 日本代表W杯の視聴方法 */}
      <section className="bg-red-50 border border-red-200 rounded-2xl p-6 sm:p-8 mb-8">
        <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
          <Icon name="flag" size={24} className="text-red-700" />
          {t("watch.japanWcTitle")}
        </h2>
        <div className="space-y-3 text-sm">
          <div className="bg-white rounded-lg p-4 border border-red-100">
            <p className="font-bold text-gray-900 mb-1">{t("watch.japanMatch1")} <span className="text-[10px] text-gray-400 ml-0.5">JST</span></p>
            <p className="text-gray-600 flex items-center gap-1">
              <Icon name="live_tv" size={16} className="text-gray-400" />
              {t("watch.japanMatch1Broadcast")}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-red-100">
            <p className="font-bold text-gray-900 mb-1">{t("watch.japanMatch2")} <span className="text-[10px] text-gray-400 ml-0.5">JST</span></p>
            <p className="text-gray-600 flex items-center gap-1">
              <Icon name="live_tv" size={16} className="text-gray-400" />
              {t("watch.japanMatch2Broadcast")}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-red-100">
            <p className="font-bold text-gray-900 mb-1">{t("watch.japanMatch3")} <span className="text-[10px] text-gray-400 ml-0.5">JST</span></p>
            <p className="text-gray-600 flex items-center gap-1">
              <Icon name="live_tv" size={16} className="text-gray-400" />
              {t("watch.japanMatch3Broadcast")}
            </p>
          </div>
        </div>
        <p className="text-sm text-red-700 mt-4 font-medium">{t("watch.japanWcNote")}</p>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Icon name="help" size={24} className="text-gray-600" />
          {t("watch.faqTitle")}
        </h2>
        <div className="space-y-4">
          {faqData.map(({ question, answer }) => (
            <div key={question} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                <Icon name="quiz" size={20} className="text-blue-500 mt-0.5" />
                {question}
              </h3>
              <p className="text-sm text-gray-600 ml-7">{answer}</p>
            </div>
          ))}
        </div>
      </section>

      <SourceAttribution
        sources={[
          { label: "DAZN — Plans", url: "https://www.dazn.com/ja-JP" },
          { label: "NHK — FIFA World Cup", url: "https://www.nhk.or.jp/" },
          { label: "NTV — World Cup", url: "https://www.ntv.co.jp/" },
        ]}
        updatedAt="2026年4月15日"
      />
    </div>
    </>
  );
}
