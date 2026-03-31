import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/notion";

export const runtime = "edge";
export const alt = "W杯2026 ニュース記事";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const categoryColors: Record<string, { bg: string; text: string }> = {
  "試合プレビュー": { bg: "#dbeafe", text: "#1d4ed8" },
  "チーム分析": { bg: "#ede9fe", text: "#7c3aed" },
  "視聴ガイド": { bg: "#ffedd5", text: "#c2410c" },
  "ニュース": { bg: "#dcfce7", text: "#15803d" },
  "コラム": { bg: "#fef9c3", text: "#a16207" },
};

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  const title = post?.title || "記事が見つかりません";
  const category = post?.category || "";
  const tags = post?.tags || [];
  const publishedAt = post?.publishedAt || "";
  const colors = categoryColors[category] || { bg: "#f3f4f6", text: "#374151" };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* 上部の装飾 */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "6px",
            background: "linear-gradient(90deg, #e74c3c 0%, #ffffff 33%, #e74c3c 66%, #ffffff 100%)",
            borderRadius: "3px",
            position: "absolute",
            top: "0",
            left: "0",
          }}
        />

        {/* ヘッダー: サイト名 + カテゴリ */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div style={{ fontSize: "32px" }}>⚽</div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#94a3b8",
              }}
            >
              W杯2026
            </div>
          </div>

          {category && (
            <div
              style={{
                background: colors.bg,
                color: colors.text,
                padding: "8px 24px",
                borderRadius: "24px",
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              {category}
            </div>
          )}
        </div>

        {/* 記事タイトル */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: title.length > 30 ? "40px" : "48px",
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.4,
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>
        </div>

        {/* フッター: タグ + 日付 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            {tags.slice(0, 4).map((tag) => (
              <div
                key={tag}
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "#cbd5e1",
                  padding: "6px 16px",
                  borderRadius: "16px",
                  fontSize: "16px",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                #{tag}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              color: "#64748b",
              fontSize: "18px",
            }}
          >
            {publishedAt && <div>{publishedAt}</div>}
            <div>wc2026report.com</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
