import type { Metadata } from "next";
import Icon from "@/components/Icon";

export const metadata: Metadata = {
  title: "サイトについて・利用規約・プライバシーポリシー",
  description: "W杯2026×totoサイトの概要、利用規約、プライバシーポリシー、免責事項、お問い合わせ先。",
  alternates: { canonical: "https://www.wc2026report.com/about" },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <Icon name="info" size={32} className="text-gray-700" />
        サイトについて
      </h1>

      {/* サイト概要 */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">サイト概要</h2>
        <div className="prose prose-gray max-w-none text-sm leading-relaxed text-gray-700 space-y-3">
          <p>
            「W杯2026 × toto」（以下「本サイト」）は、FIFA ワールドカップ 2026（北中米大会）の試合情報と、
            日本のスポーツ振興くじ（toto）の関連情報を提供する非公式の総合情報サイトです。
          </p>
          <p>
            本サイトは、FIFA、JFA（日本サッカー協会）、toto公式サイト、DAZN、その他放送局とは一切関係のない
            独立した情報サイトです。掲載情報は各公式サイトの公開情報に基づいています。
          </p>
          <dl className="mt-4 space-y-2">
            <div className="flex gap-2">
              <dt className="font-semibold text-gray-800 min-w-[100px]">サイト名</dt>
              <dd>W杯2026 × toto</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-gray-800 min-w-[100px]">URL</dt>
              <dd>https://www.wc2026report.com</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-gray-800 min-w-[100px]">運営</dt>
              <dd>CreationStock</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-gray-800 min-w-[100px]">お問い合わせ</dt>
              <dd><a href="mailto:shimomura2020goout@gmail.com" className="text-blue-600 underline">shimomura2020goout@gmail.com</a></dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 利用規約 */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">利用規約</h2>
        <div className="text-sm leading-relaxed text-gray-700 space-y-4">
          <p>本サイトをご利用いただく際は、以下の利用規約に同意いただいたものとみなします。</p>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">第1条（適用）</h3>
            <p>本規約は、本サイトの利用に関する条件を定めるものであり、本サイトを利用するすべてのユーザーに適用されます。</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">第2条（禁止事項）</h3>
            <p>本サイトの利用にあたり、以下の行為を禁止します。</p>
            <ul className="list-disc list-inside space-y-1 mt-1 text-gray-600">
              <li>法令または公序良俗に違反する行為</li>
              <li>本サイトのコンテンツを無断で複製・転載・改変する行為</li>
              <li>本サイトのサーバーやネットワークに過度の負荷をかける行為</li>
              <li>本サイトの運営を妨害するおそれのある行為</li>
              <li>他のユーザーまたは第三者の権利を侵害する行為</li>
              <li>その他、運営者が不適切と判断する行為</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">第3条（コンテンツの知的財産権）</h3>
            <p>
              本サイトに掲載されるテキスト、画像、デザイン等のコンテンツに関する著作権その他の知的財産権は、
              運営者または正当な権利者に帰属します。ユーザーは、私的利用の範囲を超えて無断で使用することはできません。
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">第4条（アフィリエイトリンクについて）</h3>
            <p>
              本サイトには、DAZN、楽天toto、ドコモスポーツくじ等の外部サービスへのアフィリエイトリンクが含まれています。
              ユーザーがこれらのリンクを通じて商品・サービスを購入された場合、運営者が紹介報酬を受け取ることがあります。
              なお、アフィリエイトリンクの利用はユーザーの任意であり、リンクを通じた購入によりユーザーに追加の費用は発生しません。
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">第5条（toto・スポーツくじに関する注意事項）</h3>
            <p>
              本サイトで提供するtotoに関する情報（予想・分析・攻略記事等）は、あくまで参考情報であり、
              的中を保証するものではありません。totoの購入は、ご自身の判断と責任のもとに行ってください。
              スポーツ振興くじの購入は19歳以上の方に限られます。
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">第6条（免責事項）</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>本サイトの情報は正確性を期していますが、完全性・最新性を保証するものではありません。試合日程・放映情報・toto情報等は、各公式サイトで最新情報をご確認ください。</li>
              <li>本サイトの利用により発生したいかなる損害についても、運営者は一切の責任を負いません。</li>
              <li>本サイトからリンクされた外部サイトの内容について、運営者は一切の責任を負いません。</li>
              <li>本サイトは予告なく内容の変更・サービスの中断・終了を行う場合があります。</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">第7条（規約の変更）</h3>
            <p>運営者は、必要と判断した場合、ユーザーに通知することなく本規約を変更することができます。変更後の利用規約は、本ページに掲載した時点で効力を生じるものとします。</p>
          </div>
        </div>
      </section>

      {/* プライバシーポリシー */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">プライバシーポリシー</h2>
        <div className="text-sm leading-relaxed text-gray-700 space-y-4">
          <p>CreationStock（以下「当社」）は、本サイトにおけるユーザーの個人情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。</p>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">第1条（個人情報の定義）</h3>
            <p>
              「個人情報」とは、個人情報保護法にいう「個人情報」を指し、生存する個人に関する情報であって、
              当該情報に含まれる氏名、生年月日、住所、電話番号、メールアドレス等により特定の個人を識別できる情報、
              および利用履歴、IPアドレス、Cookie等の特徴から特定の個人を識別できる情報を含みます。
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">第2条（個人情報の収集方法）</h3>
            <p>当社は、以下の場面でユーザーの個人情報を取得することがあります。</p>
            <ul className="list-disc list-inside space-y-1 mt-1 text-gray-600">
              <li>お問い合わせフォーム等でのご連絡時（メールアドレス、お名前等）</li>
              <li>プレミアム会員登録時（メールアドレス、決済情報等）</li>
              <li>サイト閲覧時のアクセスログ（IPアドレス、ブラウザ情報、Cookie等）</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">第3条（個人情報の利用目的）</h3>
            <p>当社は、収集した個人情報を以下の目的で利用します。</p>
            <ul className="list-disc list-inside space-y-1 mt-1 text-gray-600">
              <li>本サイトのサービス提供・運営のため</li>
              <li>ユーザーからのお問い合わせに対応するため</li>
              <li>プレミアム会員の本人確認・決済処理のため</li>
              <li>サイトの利用状況の分析・サービス改善のため</li>
              <li>重要なお知らせや変更の通知のため</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">第4条（第三者への提供）</h3>
            <p>
              当社は、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
              ただし、以下の場合はこの限りではありません。
            </p>
            <ul className="list-disc list-inside space-y-1 mt-1 text-gray-600">
              <li>法令に基づく場合</li>
              <li>人の生命、身体または財産の保護のために必要な場合</li>
              <li>公衆衛生・児童の健全育成のために特に必要な場合</li>
              <li>国の機関等への協力が必要な場合</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">第5条（安全管理措置）</h3>
            <p>
              当社は、個人情報の漏洩、滅失、毀損の防止のため、適切なセキュリティ対策を講じます。
              また、個人情報を取り扱う従業員および委託先に対して必要かつ適切な監督を行います。
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">第6条（Cookieの使用について）</h3>
            <p>
              本サイトでは、ユーザーの利便性向上およびアクセス解析のためにCookieを使用しています。
              また、アフィリエイトプログラム（アクセストレード、A8.net等）の成果計測のためにもCookieが使用されます。
              ユーザーはブラウザの設定によりCookieの受け入れを拒否することができますが、
              その場合、本サイトの一部機能が利用できなくなる場合があります。
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">第7条（アクセス解析ツール）</h3>
            <p>
              本サイトでは、Googleアナリティクス等のアクセス解析ツールを使用する場合があります。
              これらのツールはCookieを利用してデータを収集しますが、個人を特定する情報は含まれません。
              データ収集の詳細については、各ツールのプライバシーポリシーをご確認ください。
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">第8条（個人情報の開示・訂正・削除）</h3>
            <p>
              ユーザーは、当社が保有する自己の個人情報について、開示・訂正・削除を求めることができます。
              ご希望の場合は、下記のお問い合わせ先までご連絡ください。本人確認のうえ、合理的な期間内に対応いたします。
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">第9条（プライバシーポリシーの変更）</h3>
            <p>
              当社は、必要に応じて本ポリシーを変更することがあります。
              変更後のプライバシーポリシーは、本ページに掲載した時点で効力を生じるものとします。
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">第10条（お問い合わせ）</h3>
            <p>個人情報の取り扱いに関するお問い合わせは、下記までご連絡ください。</p>
            <div className="bg-gray-50 rounded-lg p-4 mt-2">
              <p>運営: CreationStock</p>
              <p>メール: <a href="mailto:shimomura2020goout@gmail.com" className="text-blue-600 underline">shimomura2020goout@gmail.com</a></p>
            </div>
          </div>
        </div>
      </section>

      {/* 施行日 */}
      <div className="text-sm text-gray-500 border-t border-gray-200 pt-6">
        <p>制定日: 2026年3月10日</p>
        <p>最終更新日: 2026年3月10日</p>
      </div>
    </div>
  );
}
