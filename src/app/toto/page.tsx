import type { Metadata } from "next";
import MatchCard from "@/components/MatchCard";
import Icon from "@/components/Icon";
import SourceAttribution from "@/components/SourceAttribution";
import { japanMatches } from "@/data/matches";

export const metadata: Metadata = {
  title: "totoゾーン｜W杯2026 toto対象試合・購入ガイド・予想のコツ",
  description: "FIFA ワールドカップ 2026 のtoto対象試合一覧と購入方法を完全ガイド。toto・mini toto・toto GOAL3・WINNERの違い、ネット購入方法、W杯toto予想のコツを解説。",
  alternates: { canonical: "https://www.wc2026report.com/toto" },
};

export default function TotoPage() {
  const totoMatches = japanMatches.filter((m) => m.isTotoTarget);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Icon name="confirmation_number" size={32} className="text-purple-700" />
        totoゾーン
      </h1>
      <p className="text-gray-500 mb-8">
        W杯の試合でtotoを楽しもう！対象試合の確認から購入方法まで。
      </p>

      {/* toto対象試合 */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full">toto対象</span>
          W杯 toto対象試合（日本戦）
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {totoMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
        <p className="text-sm text-gray-500">
          ※ W杯全試合のtoto対象試合情報は、toto公式サイトの発表後に随時更新します。
        </p>
      </section>

      {/* toto購入ガイド */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Icon name="menu_book" size={24} className="text-gray-600" />
          totoの買い方ガイド
        </h2>

        {/* totoの種類 */}
        <div className="space-y-4 mb-8">
          <h3 className="font-bold text-gray-800">totoの種類</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                name: "toto",
                price: "1口 100円",
                desc: "指定された13試合の結果（勝ち・負け・引き分け）を予想",
                maxPrize: "最高5億円（キャリーオーバー時）",
                difficulty: "上級",
                icon: "trophy",
              },
              {
                name: "mini toto",
                price: "1口 100円",
                desc: "指定された5試合の結果を予想",
                maxPrize: "約1万円〜数十万円",
                difficulty: "初級",
                icon: "star",
              },
              {
                name: "toto GOAL3",
                price: "1口 100円",
                desc: "3試合の各チームの得点数（0/1/2/3以上）を予想",
                maxPrize: "約10万円〜100万円",
                difficulty: "中級",
                icon: "sports_score",
              },
              {
                name: "WINNER",
                price: "1口 100円〜",
                desc: "1試合の結果を予想するシンプルなくじ",
                maxPrize: "試合により異なる",
                difficulty: "初級",
                icon: "bolt",
              },
            ].map((type) => (
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

        {/* 購入方法 */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-800 mb-4">購入方法</h3>
          <div className="space-y-3">
            {[
              {
                step: "1",
                title: "ネットで購入（おすすめ）",
                desc: "楽天toto、ドコモスポーツくじなどのサイトから、スマホやPCで簡単に購入できます。24時間いつでも購入可能。",
                icon: "smartphone",
                highlight: true,
              },
              {
                step: "2",
                title: "コンビニで購入",
                desc: "ローソン・ミニストップのLoppi端末から購入可能。",
                icon: "store",
                highlight: false,
              },
              {
                step: "3",
                title: "toto取扱銀行で購入",
                desc: "一部の銀行ATMやインターネットバンキングから購入できます。",
                icon: "account_balance",
                highlight: false,
              },
            ].map(({ step, title, desc, icon, highlight }) => (
              <div
                key={step}
                className={`rounded-xl p-5 ${highlight ? "bg-purple-50 border-2 border-purple-200" : "bg-white border border-gray-100 shadow-sm"}`}
              >
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

        {/* 購入リンク */}
        <div className="bg-gradient-to-br from-purple-700 to-purple-900 text-white rounded-2xl p-6 sm:p-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="shopping_cart" size={24} />
            ネットでtotoを購入する
          </h3>
          <div className="space-y-3">
            <a
              href="#"
              className="block bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-colors"
              rel="nofollow noopener"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">楽天toto</p>
                  <p className="text-sm text-purple-200">楽天ポイントが貯まる・使える</p>
                </div>
                <Icon name="arrow_forward" size={24} />
              </div>
            </a>
            <a
              href="#"
              className="block bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-colors"
              rel="nofollow noopener"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">ドコモスポーツくじ</p>
                  <p className="text-sm text-purple-200">dポイントが貯まる・使える</p>
                </div>
                <Icon name="arrow_forward" size={24} />
              </div>
            </a>
          </div>
          <p className="text-xs text-purple-300 mt-4">※ 上記リンクはアフィリエイトリンクです（ASP準備中）</p>
        </div>
      </section>

      {/* totoのコツ */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Icon name="lightbulb" size={24} className="text-amber-500" />
          W杯totoのポイント
        </h2>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <ul className="space-y-3 text-sm text-amber-900">
            <li className="flex items-start gap-2">
              <Icon name="tips_and_updates" size={18} className="text-amber-600 mt-0.5" />
              <span><strong>W杯はジャイアントキリングが多い</strong> — グループリーグでは番狂わせが頻発。「引き分け」も積極的に検討しましょう。</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="tips_and_updates" size={18} className="text-amber-600 mt-0.5" />
              <span><strong>初心者はmini totoやWINNERから</strong> — 5試合や1試合の予想から始めるのがおすすめ。</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="tips_and_updates" size={18} className="text-amber-600 mt-0.5" />
              <span><strong>締切時間に注意</strong> — totoは試合開始前に締め切られます。早めの購入を。</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="tips_and_updates" size={18} className="text-amber-600 mt-0.5" />
              <span><strong>当サイトで対象試合を確認</strong> — toto対象試合は発表され次第、本ページで随時更新します。</span>
            </li>
          </ul>
        </div>
      </section>

      <SourceAttribution
        sources={[
          { label: "toto公式サイト — スポーツ振興くじ", url: "https://www.toto-dream.com/" },
          { label: "楽天toto", url: "https://toto.rakuten.co.jp/" },
        ]}
        updatedAt="2026年3月9日"
      />
    </div>
  );
}
