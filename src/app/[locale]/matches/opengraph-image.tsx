import { generatePageOG, ogSize } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "日本代表 2026年 試合日程";
export const size = ogSize;
export const contentType = "image/png";

export default function OGImage() {
  return generatePageOG({
    title: "試合日程",
    subtitle: "W杯本大会・親善試合・キリンカップの全試合スケジュール",
    emoji: "📅",
  });
}
