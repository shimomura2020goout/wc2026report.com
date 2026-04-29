import type { Metadata } from "next";
import Icon from "@/components/Icon";
import { allTeams } from "@/data/teams";
import RankingsClient from "./RankingsClient";

export const metadata: Metadata = {
  title: "ランキング",
  description: "予想的中・予想数・訪問数のユーザランキングと出場国FIFAランキング",
  robots: { index: false, follow: true },
};

export const revalidate = 60;

export default function RankingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Icon name="emoji_events" size={32} className="text-gray-700" />
        ランキング
      </h1>
      <p className="text-gray-500 mb-6 text-sm">
        予想ランキング（ニックネーム設定ユーザのみ）と出場国FIFAランキング。
      </p>

      <RankingsClient teams={allTeams} />
    </div>
  );
}
