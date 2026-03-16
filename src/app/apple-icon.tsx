import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "180px",
          height: "180px",
          borderRadius: "36px",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 上部の赤いアクセントライン */}
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "8px",
            background: "linear-gradient(90deg, #e74c3c 0%, #ff6b6b 100%)",
          }}
        />
        {/* サッカーボール */}
        <div style={{ fontSize: "72px", marginTop: "4px" }}>⚽</div>
        {/* サイト名 */}
        <div
          style={{
            fontSize: "18px",
            fontWeight: 900,
            color: "#94a3b8",
            marginTop: "-4px",
            letterSpacing: "1px",
          }}
        >
          W杯2026
        </div>
      </div>
    ),
    { ...size }
  );
}
