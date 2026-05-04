import { generatePageOG, ogSize } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "W杯2026 視聴ガイド｜DAZN・地上波";
export const size = ogSize;
export const contentType = "image/png";

export default function OGImage() {
  return generatePageOG({
    title: "視聴ガイド",
    subtitle: "DAZN全104試合配信・地上波放送予定・無料視聴方法を解説",
    emoji: "📺",
  });
}
