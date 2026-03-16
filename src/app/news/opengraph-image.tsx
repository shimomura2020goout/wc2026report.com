import { generatePageOG, ogSize } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "ニュース｜W杯2026 × toto";
export const size = ogSize;
export const contentType = "image/png";

export default function OGImage() {
  return generatePageOG({
    title: "ニュース",
    subtitle: "W杯2026・日本代表の最新ニュース・コラム",
    emoji: "📰",
  });
}
