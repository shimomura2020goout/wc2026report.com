import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "W杯2026｜試合日程・視聴ガイド";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
        {/* 上部の装飾ライン */}
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

        {/* メインコンテンツ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            gap: "20px",
          }}
        >
          {/* サイト名 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                fontSize: "56px",
              }}
            >
              ⚽
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: "52px",
                  fontWeight: 900,
                  color: "#ffffff",
                  lineHeight: 1.1,
                }}
              >
                W杯2026
              </div>
              <div
                style={{
                  fontSize: "20px",
                  color: "#94a3b8",
                  marginTop: "4px",
                }}
              >
                FIFA ワールドカップ 2026 総合情報サイト
              </div>
            </div>
          </div>

          {/* キャッチコピー */}
          <div
            style={{
              fontSize: "28px",
              color: "#e2e8f0",
              lineHeight: 1.6,
              marginTop: "16px",
            }}
          >
            全104試合の日程・放映情報・視聴ガイドを網羅
          </div>

          {/* タグ */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "12px",
            }}
          >
            {["試合日程", "DAZN視聴ガイド", "グループ情報", "日本代表"].map(
              (tag) => (
                <div
                  key={tag}
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    color: "#e2e8f0",
                    padding: "8px 20px",
                    borderRadius: "24px",
                    fontSize: "18px",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {tag}
                </div>
              )
            )}
          </div>
        </div>

        {/* フッター */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "18px", color: "#64748b" }}>
            wc2026report.com
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(239,68,68,0.2)",
              padding: "8px 20px",
              borderRadius: "24px",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
          >
            <div style={{ fontSize: "18px", color: "#fca5a5" }}>
              🇯🇵 日本代表を応援しよう
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
