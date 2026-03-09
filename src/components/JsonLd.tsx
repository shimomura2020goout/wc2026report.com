interface JsonLdProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// W杯サイト全体のWebSite構造化データ
export function WebsiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "W杯2026 × toto",
        url: "https://www.wc2026report.com",
        description:
          "FIFA ワールドカップ 2026 の試合情報とtoto予想を提供する総合情報サイト",
        inLanguage: "ja",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://www.wc2026report.com/news?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

// スポーツイベントの構造化データ
export function SportsEventJsonLd({
  name,
  startDate,
  location,
  homeTeam,
  awayTeam,
  description,
  url,
}: {
  name: string;
  startDate: string;
  location: string;
  homeTeam: string;
  awayTeam: string;
  description?: string;
  url?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        name,
        startDate,
        location: {
          "@type": "Place",
          name: location,
        },
        homeTeam: {
          "@type": "SportsTeam",
          name: homeTeam,
        },
        awayTeam: {
          "@type": "SportsTeam",
          name: awayTeam,
        },
        description,
        url,
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        organizer: {
          "@type": "Organization",
          name: "FIFA",
          url: "https://www.fifa.com",
        },
      }}
    />
  );
}

// ニュース記事の構造化データ
export function ArticleJsonLd({
  title,
  description,
  publishedAt,
  url,
  category,
}: {
  title: string;
  description: string;
  publishedAt: string;
  url: string;
  category?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        datePublished: publishedAt,
        dateModified: publishedAt,
        url,
        publisher: {
          "@type": "Organization",
          name: "W杯2026 × toto",
          url: "https://www.wc2026report.com",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
        articleSection: category,
        inLanguage: "ja",
      }}
    />
  );
}

// パンくずリストの構造化データ
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

// FAQの構造化データ
export function FAQJsonLd({
  questions,
}: {
  questions: { question: string; answer: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: questions.map((q) => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: q.answer,
          },
        })),
      }}
    />
  );
}
