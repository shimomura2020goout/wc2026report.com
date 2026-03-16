import { generatePageOG, ogSize } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "W杯2026 全12グループ一覧";
export const size = ogSize;
export const contentType = "image/png";

export default function OGImage() {
  return generatePageOG({
    title: "グループ一覧",
    subtitle: "全12グループ・48カ国の組み合わせを確認",
    emoji: "🌍",
  });
}
