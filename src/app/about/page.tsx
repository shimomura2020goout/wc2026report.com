import type { Metadata } from "next";
import Icon from "@/components/Icon";
import { getLocaleFromCookies, getDictionary, createTranslator } from "@/i18n/index";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);
  return {
    title: t("about.metaTitle"),
    description: t("about.metaDescription"),
    alternates: { canonical: "https://www.wc2026report.com/about" },
  };
}

export default async function AboutPage() {
  const locale = await getLocaleFromCookies();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <Icon name="info" size={32} className="text-gray-700" />
        {t("about.pageTitle")}
      </h1>

      {/* サイト概要 */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">{t("about.overviewTitle")}</h2>
        <div className="prose prose-gray max-w-none text-sm leading-relaxed text-gray-700 space-y-3">
          <p>{t("about.overviewDescription1")}</p>
          <p>{t("about.overviewDescription2")}</p>
          <dl className="mt-4 space-y-2">
            <div className="flex gap-2">
              <dt className="font-semibold text-gray-800 min-w-[100px]">{t("about.siteName")}</dt>
              <dd>W杯2026 × toto</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-gray-800 min-w-[100px]">{t("about.siteUrl")}</dt>
              <dd>https://www.wc2026report.com</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-gray-800 min-w-[100px]">{t("about.operator")}</dt>
              <dd>CreationStock</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-gray-800 min-w-[100px]">{t("about.contact")}</dt>
              <dd><a href="mailto:shimomura2020goout@gmail.com" className="text-blue-600 underline">shimomura2020goout@gmail.com</a></dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 利用規約 */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">{t("about.tosTitle")}</h2>
        <div className="text-sm leading-relaxed text-gray-700 space-y-4">
          <p>{t("about.tosIntro")}</p>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">{t("about.tosArticle1Title")}</h3>
            <p>{t("about.tosArticle1")}</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">{t("about.tosArticle2Title")}</h3>
            <p>{t("about.tosArticle2Intro")}</p>
            <ul className="list-disc list-inside space-y-1 mt-1 text-gray-600">
              <li>{t("about.tosArticle2Item1")}</li>
              <li>{t("about.tosArticle2Item2")}</li>
              <li>{t("about.tosArticle2Item3")}</li>
              <li>{t("about.tosArticle2Item4")}</li>
              <li>{t("about.tosArticle2Item5")}</li>
              <li>{t("about.tosArticle2Item6")}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">{t("about.tosArticle3Title")}</h3>
            <p>{t("about.tosArticle3")}</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">{t("about.tosArticle4Title")}</h3>
            <p>{t("about.tosArticle4")}</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">{t("about.tosArticle5Title")}</h3>
            <p>{t("about.tosArticle5")}</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">{t("about.tosArticle6Title")}</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>{t("about.tosArticle6Item1")}</li>
              <li>{t("about.tosArticle6Item2")}</li>
              <li>{t("about.tosArticle6Item3")}</li>
              <li>{t("about.tosArticle6Item4")}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">{t("about.tosArticle7Title")}</h3>
            <p>{t("about.tosArticle7")}</p>
          </div>
        </div>
      </section>

      {/* プライバシーポリシー */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">{t("about.privacyTitle")}</h2>
        <div className="text-sm leading-relaxed text-gray-700 space-y-4">
          <p>{t("about.privacyIntro")}</p>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">{t("about.privacyArticle1Title")}</h3>
            <p>{t("about.privacyArticle1")}</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">{t("about.privacyArticle2Title")}</h3>
            <p>{t("about.privacyArticle2Intro")}</p>
            <ul className="list-disc list-inside space-y-1 mt-1 text-gray-600">
              <li>{t("about.privacyArticle2Item1")}</li>
              <li>{t("about.privacyArticle2Item2")}</li>
              <li>{t("about.privacyArticle2Item3")}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">{t("about.privacyArticle3Title")}</h3>
            <p>{t("about.privacyArticle3Intro")}</p>
            <ul className="list-disc list-inside space-y-1 mt-1 text-gray-600">
              <li>{t("about.privacyArticle3Item1")}</li>
              <li>{t("about.privacyArticle3Item2")}</li>
              <li>{t("about.privacyArticle3Item3")}</li>
              <li>{t("about.privacyArticle3Item4")}</li>
              <li>{t("about.privacyArticle3Item5")}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">{t("about.privacyArticle4Title")}</h3>
            <p>{t("about.privacyArticle4Intro")}</p>
            <ul className="list-disc list-inside space-y-1 mt-1 text-gray-600">
              <li>{t("about.privacyArticle4Item1")}</li>
              <li>{t("about.privacyArticle4Item2")}</li>
              <li>{t("about.privacyArticle4Item3")}</li>
              <li>{t("about.privacyArticle4Item4")}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">{t("about.privacyArticle5Title")}</h3>
            <p>{t("about.privacyArticle5")}</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">{t("about.privacyArticle6Title")}</h3>
            <p>{t("about.privacyArticle6")}</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">{t("about.privacyArticle7Title")}</h3>
            <p>{t("about.privacyArticle7")}</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">{t("about.privacyArticle8Title")}</h3>
            <p>{t("about.privacyArticle8")}</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">{t("about.privacyArticle9Title")}</h3>
            <p>{t("about.privacyArticle9")}</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-1">{t("about.privacyArticle10Title")}</h3>
            <p>{t("about.privacyArticle10Intro")}</p>
            <div className="bg-gray-50 rounded-lg p-4 mt-2">
              <p>{t("about.privacyContactOperator")}</p>
              <p>メール: <a href="mailto:shimomura2020goout@gmail.com" className="text-blue-600 underline">shimomura2020goout@gmail.com</a></p>
            </div>
          </div>
        </div>
      </section>

      {/* 施行日 */}
      <div className="text-sm text-gray-500 border-t border-gray-200 pt-6">
        <p>{t("about.enactedDate", { date: "2026年3月10日" })}</p>
        <p>{t("about.lastUpdatedDate", { date: "2026年3月10日" })}</p>
      </div>
    </div>
  );
}
