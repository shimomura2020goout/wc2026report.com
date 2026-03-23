import Link from "next/link";
import Icon from "@/components/Icon";
import SourceAttribution from "@/components/SourceAttribution";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { broadcastInfo } from "@/data/matches";
import { getLocaleFromCookies, getDictionary, createTranslator } from "@/i18n/index";

export async function generateMetadata() {
  const locale = await getLocaleFromCookies();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);
  return {
    title: t("watch.metaTitle"),
    description: t("watch.metaDescription"),
    alternates: { canonical: "https://www.wc2026report.com/watch" },
  };
}

export default async function WatchPage() {
  const locale = await getLocaleFromCookies();
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
      <p className="text-gray-500 mb-8">
        {t("watch.pageDescription")}
      </p>

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
          <a href="#" className="inline-flex items-center justify-center gap-2 bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-gray-200 transition-colors text-center" rel="nofollow noopener">
            <Icon name="open_in_new" size={18} />
            {t("watch.daznRegister")}
          </a>
          <a href="#" className="inline-flex items-center justify-center gap-2 bg-green-600 text-white font-bold px-8 py-3 rounded-full hover:bg-green-700 transition-colors text-center" rel="nofollow noopener">
            <Icon name="open_in_new" size={18} />
            {t("watch.daznDmmRegister")}
          </a>
        </div>
        <p className="text-xs text-gray-600 mt-3">※ {t("watch.affiliateNote")}</p>
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
        updatedAt="2026年3月16日"
      />
    </div>
    </>
  );
}
