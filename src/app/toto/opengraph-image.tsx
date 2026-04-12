import { generatePageOG, ogSize } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "totoゾーン｜W杯2026 x toto";
export const size = ogSize;
export const contentType = "image/png";

export default function OGImage() {
  return generatePageOG({
    title: "totoゾーン",
    subtitle: "W杯対象のtoto情報・買い方ガイド・購入リンクまとめ",
  });
}
