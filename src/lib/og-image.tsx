import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

export function generatePageOG({
  title,
  subtitle,
  emoji = "⚽",
}: {
  title: string;
  subtitle: string;
  emoji?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* 上部装飾 */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "6px",
            background:
              "linear-gradient(90deg, #e74c3c 0%, #ffffff 33%, #e74c3c 66%, #ffffff 100%)",
            borderRadius: "3px",
            position: "absolute",
            top: "0",
            left: "0",
          }}
        />

        {/* サイト名 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "40px",
          }}
        >
          <div style={{ fontSize: "32px" }}>⚽</div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#94a3b8" }}>
            W杯2026 × toto
          </div>
        </div>

        {/* メイン */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div style={{ fontSize: "56px" }}>{emoji}</div>
            <div
              style={{
                fontSize: "48px",
                fontWeight: 900,
                color: "#ffffff",
                lineHeight: 1.2,
              }}
            >
              {title}
            </div>
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#94a3b8",
              marginLeft: "72px",
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* フッター */}
        <div style={{ fontSize: "18px", color: "#64748b" }}>
          wc2026report.com
        </div>
      </div>
    ),
    { ...ogSize }
  );
}
