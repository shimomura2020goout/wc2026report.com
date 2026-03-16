import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "6px",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          display: "flex",
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
            height: "3px",
            background: "#e74c3c",
          }}
        />
        {/* サッカーボール */}
        <div style={{ fontSize: "18px", marginTop: "1px" }}>⚽</div>
      </div>
    ),
    { ...size }
  );
}
