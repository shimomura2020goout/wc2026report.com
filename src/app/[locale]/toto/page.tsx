import MatchPredictionCard from "@/components/MatchPredictionCard";
import Icon from "@/components/Icon";
import SourceAttribution from "@/components/SourceAttribution";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/JsonLd";
import { japanMatches, allWorldCupMatches } from "@/data/matches";
import { getLocale, getDictionary, createTranslator } from "@/i18n/index";
import { pageAlternates } from "@/lib/i18nLinks";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);
  return {
    title: t("toto.metaTitle"),
    description: t("toto.metaDescription"),
    alternates: pageAlternates(locale, "/toto"),
  };
}

export default async function TotoPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);
  const totoMatches = japanMatches.filter((m) => m.isTotoTarget);

  const totoTypes = [
    { name: t("toto.totoName"), price: t("toto.totoPrice"), desc: t("toto.totoDesc"), maxPrize: t("toto.totoMaxPrize"), difficulty: t("toto.totoDifficulty"), icon: "trophy" },
    { name: t("toto.miniTotoName"), price: t("toto.miniTotoPrice"), desc: t("toto.miniTotoDesc"), maxPrize: t("toto.miniTotoMaxPrize"), difficulty: t("toto.miniTotoDifficulty"), icon: "star" },
    { name: t("toto.goal3Name"), price: t("toto.goal3Price"), desc: t("toto.goal3Desc"), maxPrize: t("toto.goal3MaxPrize"), difficulty: t("toto.goal3Difficulty"), icon: "sports_score" },
    { name: t("toto.winnerName"), price: t("toto.winnerPrice"), desc: t("toto.winnerDesc"), maxPrize: t("toto.winnerMaxPrize"), difficulty: t("toto.winnerDifficulty"), icon: "bolt" },
  ];

  const buyMethods = [
    { step: "1", title: t("toto.buyOnlineTitle"), desc: t("toto.buyOnlineDesc"), icon: "smartphone", highlight: true },
    { step: "2", title: t("toto.buyConvenienceTitle"), desc: t("toto.buyConvenienceDesc"), icon: "store", highlight: false },
    { step: "3", title: t("toto.buyBankTitle"), desc: t("toto.buyBankDesc"), icon: "account_balance", highlight: false },
  ];

  const tips = [
    { bold: t("toto.tip1Bold"), text: t("toto.tip1") },
    { bold: t("toto.tip2Bold"), text: t("toto.tip2") },
    { bold: t("toto.tip3Bold"), text: t("toto.tip3") },
    { bold: t("toto.tip4Bold"), text: t("toto.tip4") },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.wc2026report.com" },
          { name: "toto Zone", url: "https://www.wc2026report.com/toto" },
        ]}
      />
      <FAQJsonLd
        questions={[
          { question: "totoとは？", answer: "toto（スポーツ振興くじ）は、サッカーの試合結果を予想する公営のくじです。1口100円から購入でき、的中すれば最高5億円（キャリーオーバー時）が当たります。" },
          { question: "totoの買い方は？", answer: "楽天totoやドコモスポーツくじなどのオンラインサイト、ローソン・ミニストップのLoppi端末、一部の銀行ATMやネットバンキングで購入できます。オンライン購入が最も手軽で24時間対応です。" },
          { question: "W杯の試合はtoto対象になる？", answer: "はい、FIFA ワールドカップ 2026の試合はtoto対象となる可能性があります。対象試合はtoto公式サイトで発表されます。" },
          { question: "totoは何歳から買える？", answer: "スポーツ振興くじ（toto）の購入は19歳以上の方に限られます。" },
        ]}
      />

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Icon name="confirmation_number" size={32} className="text-purple-700" />
        {t("toto.pageTitle")}
      </h1>
      <p className="text-gray-500 mb-8">{t("toto.pageDescription")}</p>

      {/* toto対象試合 */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full">{t("common.totoTarget")}</span>
          {t("toto.targetMatchesTitle")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {totoMatches.map((match) => (
            <MatchPredictionCard key={match.id} match={match} />
          ))}
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-purple-800">
          <div className="flex items-start gap-2">
            <Icon name="info" size={18} className="text-purple-500 mt-0.5" />
            <div>
              <p className="font-medium">{t("toto.targetMatchesNote", { count: String(allWorldCupMatches.length) })}</p>
              <p className="text-purple-600 mt-1">{t("toto.targetMatchesUpdateNote")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 購入ガイド */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Icon name="menu_book" size={24} className="text-gray-600" />
          {t("toto.buyGuideTitle")}
        </h2>

        <div className="space-y-4 mb-8">
          <h3 className="font-bold text-gray-800">{t("toto.typesTitle")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {totoTypes.map((type) => (
              <div key={type.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Icon name={type.icon} size={20} className="text-purple-600" />
                    {type.name}
                  </h4>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{type.difficulty}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{type.desc}</p>
                <p className="text-sm font-medium text-purple-700">{type.price}</p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Icon name="emoji_events" size={14} className="text-amber-500" />
                  {type.maxPrize}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-gray-800 mb-4">{t("toto.howToBuyTitle")}</h3>
          <div className="space-y-3">
            {buyMethods.map(({ step, title, desc, icon, highlight }) => (
              <div key={step} className={`rounded-xl p-5 ${highlight ? "bg-purple-50 border-2 border-purple-200" : "bg-white border border-gray-100 shadow-sm"}`}>
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${highlight ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                    <Icon name={icon} size={20} />
                  </span>
                  <div>
                    <h4 className="font-bold text-gray-900">{title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-700 to-purple-900 text-white rounded-2xl p-6 sm:p-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="shopping_cart" size={24} />
            {t("toto.buyOnlineCta")}
          </h3>
          <div className="space-y-3">
            <a
              href="https://tr.affiliate-sp.docomo.ne.jp/cl/d0000000359/4739/3"
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="block bg-white/20 hover:bg-white/30 rounded-xl p-4 transition-colors ring-2 ring-white/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold flex items-center gap-2">
                    <span className="bg-white text-purple-800 text-xs px-2 py-0.5 rounded font-bold">おすすめ</span>
                    {t("toto.docomoToto")}
                  </p>
                  <p className="text-sm text-purple-200">{t("toto.docomoTotoNote")}</p>
                </div>
                <Icon name="arrow_forward" size={24} />
              </div>
            </a>
            <a
              href="https://hb.afl.rakuten.co.jp/hsc/27bd08bb.b74c49ca.27b9c67d.af1b1692/?link_type=text&ut=eyJwYWdlIjoic2hvcCIsInR5cGUiOiJ0ZXh0IiwiY29sIjoxLCJjYXQiOjEsImJhbiI6Im5hbWUiLCJhbXAiOmZhbHNlfQ%3D%3D"
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="block bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">{t("toto.rakutenToto")}</p>
                  <p className="text-sm text-purple-200">{t("toto.rakutenTotoNote")}</p>
                </div>
                <Icon name="arrow_forward" size={24} />
              </div>
            </a>
          </div>
          <p className="text-xs text-purple-300 mt-4">{t("watch.affiliateNote")}</p>
        </div>
      </section>

      {/* totoのコツ */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Icon name="lightbulb" size={24} className="text-amber-500" />
          {t("toto.tipsTitle")}
        </h2>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <ul className="space-y-3 text-sm text-amber-900">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <Icon name="tips_and_updates" size={18} className="text-amber-600 mt-0.5" />
                <span><strong>{tip.bold}</strong> -- {tip.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SourceAttribution
        sources={[
          { label: "toto -- Sports Promotion Lottery", url: "https://www.toto-dream.com/" },
          { label: "Rakuten toto", url: "https://toto.rakuten.co.jp/" },
        ]}
        updatedAt="2026年4月1日"
      />
    </div>
  );
}
