import { generatePageOG, ogSize } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "試合結果・順位表｜グループH";
export const size = ogSize;
export const contentType = "image/png";

export default function OGImage() {
  return generatePageOG({
    title: "試合結果・順位表",
    subtitle: "グループH（日本所属）の順位表・突破シナリオを随時更新",
    emoji: "🏆",
  });
}
