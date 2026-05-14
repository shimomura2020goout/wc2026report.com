import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RouteProgressBar from "@/components/RouteProgressBar";
import LatestNewsBanner from "@/components/LatestNewsBanner";
import LatestNewsBannerWrapper from "@/components/LatestNewsBannerWrapper";
import SquadCelebration from "@/components/SquadCelebration";
import SquadFloatingPanel from "@/components/SquadFloatingPanel";
import InstallPrompt from "@/components/InstallPrompt";
import LocaleProvider from "@/components/LocaleProvider";
import { WebsiteJsonLd } from "@/components/JsonLd";
import DonationBanner from "@/components/DonationBanner";
import OnboardingModal from "@/components/OnboardingModal";
import VisitBeacon from "@/components/VisitBeacon";
import { PreferencesProvider } from "@/context/PreferencesContext";
import { getLocale, getDictionary, createTranslator, getTranslationArray } from "@/i18n/index";
import { localeAlternates, OG_LOCALES, SITE_BASE_URL, absoluteLocaleUrl } from "@/lib/i18nLinks";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);

  const titleDefault = t("meta.defaultTitle");
  const titleTemplate = t("meta.titleTemplate");
  const description = t("meta.defaultDescription");
  const keywords = getTranslationArray(dict, "meta.keywords");
  const ogTitle = t("meta.ogTitle");
  const ogDescription = t("meta.ogDescription");
  const siteName = t("meta.ogSiteName");

  return {
    metadataBase: new URL(SITE_BASE_URL),
    title: {
      default: titleDefault,
      template: titleTemplate,
    },
    description,
    keywords,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      locale: OG_LOCALES[locale],
      type: "website",
      siteName,
      url: absoluteLocaleUrl(locale, "/"),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
    },
    alternates: {
      canonical: absoluteLocaleUrl(locale, "/"),
      languages: localeAlternates("/").languages,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      // Google Search Console の確認コードを後で設定
      // google: "xxxxxx",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return (
    <html lang={locale}>
      <head>
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a1a2e" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KGW7JQX5');`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} antialiased min-h-screen flex flex-col`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KGW7JQX5"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <WebsiteJsonLd />
        <LocaleProvider locale={locale} dictionary={dictionary}>
          <PreferencesProvider>
            <RouteProgressBar />
            <Header />
            <LatestNewsBannerWrapper>
              <LatestNewsBanner />
            </LatestNewsBannerWrapper>
            <main className="flex-1">{children}</main>
            <DonationBanner />
            <Footer />
            <InstallPrompt />
            <OnboardingModal />
            <VisitBeacon />
            <SquadCelebration />
            <SquadFloatingPanel />
          </PreferencesProvider>
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  );
}
