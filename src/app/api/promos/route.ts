import { NextResponse } from "next/server";

const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
const PROMO_DB_ID = process.env.NOTION_PROMO_DATABASE_ID || "";

export interface PromoFromNotion {
  id: string;
  title: string;
  label: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  trackingPixel: string | null;
  bgColor: string;
  showProbability: number;
  cooldownHours: number;
  sortOrder: number;
}

// Notion property helpers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getText(prop: any): string {
  if (!prop) return "";
  if (prop.type === "title") return prop.title?.[0]?.plain_text || "";
  if (prop.type === "rich_text") return prop.rich_text?.[0]?.plain_text || "";
  return "";
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSelect(prop: any): string {
  return prop?.select?.name || "";
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNumber(prop: any, fallback: number): number {
  return prop?.number ?? fallback;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getUrl(prop: any): string | null {
  return prop?.url || null;
}

export async function GET() {
  if (!NOTION_API_KEY || !PROMO_DB_ID) {
    return NextResponse.json({ promos: [] });
  }

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${PROMO_DB_ID}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: {
          property: "ステータス",
          select: { equals: "有効" },
        },
        sorts: [
          { property: "表示順", direction: "ascending" },
        ],
      }),
      next: { revalidate: 300 }, // 5分キャッシュ
    });

    if (!res.ok) {
      console.error("Notion promo fetch error:", res.status);
      return NextResponse.json({ promos: [] });
    }

    const data = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const promos: PromoFromNotion[] = data.results.map((page: any) => {
      const p = page.properties;
      return {
        id: page.id,
        title: getText(p["バナー名"]),
        label: getText(p["バッジ"]),
        description: getText(p["説明文"]),
        ctaText: getText(p["CTAテキスト"]),
        ctaUrl: getUrl(p["CTAリンク"]) || "",
        trackingPixel: getUrl(p["トラッキングピクセル"]),
        bgColor: getSelect(p["背景カラー"]) || "dark",
        showProbability: getNumber(p["表示確率"], 0.5),
        cooldownHours: getNumber(p["非表示時間"], 48),
        sortOrder: getNumber(p["表示順"], 99),
      };
    });

    return NextResponse.json({ promos });
  } catch (err) {
    console.error("Promo API error:", err);
    return NextResponse.json({ promos: [] });
  }
}
