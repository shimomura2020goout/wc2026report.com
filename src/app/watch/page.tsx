import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import SourceAttribution from "@/components/SourceAttribution";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { broadcastInfo } from "@/data/matches";

const faqData = [
  {
    question: "W杯を全試合見るにはどうすればいい？",
    answer: "DAZNに加入すれば全104試合をライブ配信で視聴できます。NHK BSプレミアム4Kでも全試合を放送しますが、4K対応BS環境が必要です。",
  },
  {
    question: "無料で見れる試合はある？",
    answer: "日本代表のグループリーグ3試合はDAZNで無料配信されます。また、NHK総合で33試合、日本テレビで15試合、フジテレビで10試合が地上波で無料放送されます。",
  },
  {
    question: "DAZNの日本代表戦無料配信の見方は？",
    answer: "DAZNの無料アカウントを作成するだけでOK。有料プランに加入しなくても、日本代表戦は視聴できます。",
  },
  {
    question: "海外から視聴できる？",
    answer: "DAZNは契約地域のみでの視聴となります。海外在住の方は現地のDAZNまたは放映局をご確認ください。",
  },
];

export const metadata: Metadata = {
  title: "W杯 2026 視聴ガイド｜DAZN・地上波の放送予定",
  description: "FIFA ワールドカップ 2026 をどこで見る？DAZN全104試合配信、NHK33試合・日テレ15試合・フジ10試合の地上波放送予定、日本代表戦の無料視聴方法を徹底解説。",
  alternates: { canonical: "https://www.wc2026report.com/watch" },
};

export default function WatchPage() {
  return (
    <>
    <BreadcrumbJsonLd items={[
      { name: "トップ", url: "https://www.wc2026report.com" },
      { name: "視聴ガイド", url: "https://www.wc2026report.com/watch" },
    ]} />
    <FAQJsonLd questions={faqData} />
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Icon name="live_tv" size={32} className="text-gray-700" />
        W杯 2026 視聴ガイド
      </h1>
      <p className="text-gray-500 mb-8">
        「この試合はどこで見れる？」を解決。DAZN・地上波・BSの放送予定を完全網羅。
      </p>

      {/* DAZN Section - Main CTA */}
      <section className="bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] text-white rounded-2xl p-6 sm:p-8 mb-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-white text-black font-bold text-xl px-3 py-1 rounded-lg">DAZN</div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">全104試合を独占ライブ配信</h2>
            <p className="text-gray-400 mt-1">W杯を完全に楽しむならDAZN一択</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="font-bold text-lg mb-2">DAZN Standard</h3>
            <p className="text-2xl font-bold text-white mb-1">月額 4,200円<span className="text-sm font-normal text-gray-400">（税込）</span></p>
            <p className="text-sm text-gray-400">年間プランなら月額2,917円相当</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 border border-green-500/30">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              DMM×DAZNホーダイ
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">おすすめ</span>
            </h3>
            <p className="text-2xl font-bold text-white mb-1">月額 3,480円<span className="text-sm font-normal text-gray-400">（税込）</span></p>
            <p className="text-sm text-gray-400">DMMプレミアム付きでお得</p>
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
          <p className="text-green-400 font-bold text-sm mb-1 flex items-center gap-1">
            <Icon name="celebration" size={18} />
            日本代表戦は無料！
          </p>
          <p className="text-sm text-gray-300">
            日本代表のW杯グループリーグ3試合はDAZNで無料配信。アカウント登録（無料）のみでOK。
          </p>
        </div>

        <h3 className="font-bold mb-3">DAZNのポイント</h3>
        <ul className="space-y-2 text-sm text-gray-300 mb-6">
          <li className="flex items-start gap-2">
            <Icon name="check_circle" size={18} className="text-green-400 mt-0.5" />
            <span>全104試合をライブ配信 — 他のサービスでは見られない試合も全てカバー</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="check_circle" size={18} className="text-green-400 mt-0.5" />
            <span>見逃し配信・ハイライト対応 — 深夜の試合も後からチェック可能</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="check_circle" size={18} className="text-green-400 mt-0.5" />
            <span>マルチデバイス対応 — スマホ・タブレット・PC・TV（Fire TV Stick等）で視聴</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="check_circle" size={18} className="text-green-400 mt-0.5" />
            <span>W杯以外にもJリーグ、プレミアリーグ、ラ・リーガなど見放題</span>
          </li>
        </ul>

        {/* アフィリエイトリンクのプレースホルダー */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-gray-200 transition-colors text-center"
            rel="nofollow noopener"
          >
            <Icon name="open_in_new" size={18} />
            DAZNに登録する（公式サイト）
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 bg-green-600 text-white font-bold px-8 py-3 rounded-full hover:bg-green-700 transition-colors text-center"
            rel="nofollow noopener"
          >
            <Icon name="open_in_new" size={18} />
            DMM×DAZNホーダイに登録
          </a>
        </div>
        <p className="text-xs text-gray-600 mt-3">※ 上記リンクはアフィリエイトリンクです（ASP準備中）</p>
      </section>

      {/* 地上波・BS */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Icon name="tv" size={24} className="text-gray-600" />
          地上波・BS放送予定
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          W杯は地上波でも一部試合を無料で視聴可能。ただし全試合を見るにはDAZN（またはNHK BS 4K）が必要です。
        </p>

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
                  {info.matches}試合
                </span>
              </div>
              <p className="text-sm text-gray-600">{info.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 日本代表戦の放映 */}
      <section className="bg-red-50 border border-red-200 rounded-2xl p-6 sm:p-8 mb-8">
        <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
          <Icon name="flag" size={24} className="text-red-700" />
          日本代表W杯の視聴方法
        </h2>
        <div className="space-y-3 text-sm">
          <div className="bg-white rounded-lg p-4 border border-red-100">
            <p className="font-bold text-gray-900 mb-1">第1節 vs オランダ（6/14 05:00 KO）</p>
            <p className="text-gray-600 flex items-center gap-1">
              <Icon name="live_tv" size={16} className="text-gray-400" />
              DAZN（無料配信）、NHK総合（地上波）
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-red-100">
            <p className="font-bold text-gray-900 mb-1">第2節 vs チュニジア（6/21 13:00 KO）</p>
            <p className="text-gray-600 flex items-center gap-1">
              <Icon name="live_tv" size={16} className="text-gray-400" />
              DAZN（無料配信）、日本テレビ / NHK BS
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-red-100">
            <p className="font-bold text-gray-900 mb-1">第3節 vs UEFA PO B勝者（6/26 08:00 KO）</p>
            <p className="text-gray-600 flex items-center gap-1">
              <Icon name="live_tv" size={16} className="text-gray-400" />
              DAZN（無料配信）、NHK総合（地上波）
            </p>
          </div>
        </div>
        <p className="text-sm text-red-700 mt-4 font-medium">
          日本代表のW杯3試合は全て無料で視聴できます（DAZN無料配信 or 地上波）
        </p>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Icon name="help" size={24} className="text-gray-600" />
          よくある質問
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
          { label: "DAZN公式 — 料金プラン", url: "https://www.dazn.com/ja-JP" },
          { label: "NHK — FIFA ワールドカップ 放送予定", url: "https://www.nhk.or.jp/" },
          { label: "日本テレビ — W杯放送予定", url: "https://www.ntv.co.jp/" },
        ]}
        updatedAt="2026年3月9日"
      />
    </div>
    </>
  );
}
