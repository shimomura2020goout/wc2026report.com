"use client";

import Link from "next/link";
import { Match, formatMatchDate, getMatchTypeColor } from "@/data/matches";
import { getTeamByName } from "@/data/teams";
import { useTranslation } from "@/i18n/client";
import Icon from "./Icon";

interface MatchListItemProps {
  match: Match;
  showGroup?: boolean;
}

function TeamName({ name, isJapan, isPlaceholderTeam }: { name: string; isJapan: boolean; isPlaceholderTeam: boolean }) {
  const team = getTeamByName(name);
  const canLink = team && !team.isPlaceholder;

  const className = `font-medium truncate ${
    isJapan ? "text-red-700" :
    isPlaceholderTeam ? "text-gray-400 italic" :
    "text-gray-900"
  }`;

  if (canLink) {
    return (
      <Link
        href={`/teams/${team.code.toLowerCase()}`}
        className={`${className} hover:underline`}
      >
        {name}
      </Link>
    );
  }
  return <span className={className}>{name}</span>;
}

export default function MatchListItem({ match, showGroup = true }: MatchListItemProps) {
  const { t } = useTranslation();
  const isPlaceholder = match.isPlaceholder;

  return (
    <div className={`flex items-center gap-2 sm:gap-4 py-3 px-3 sm:px-4 rounded-lg border ${
      match.isJapan ? "bg-red-50/50 border-red-200" : "bg-white border-gray-100"
    }`}>
      {/* 日付・時間 */}
      <div className="flex-shrink-0 text-center w-20 sm:w-24">
        <div className="text-xs text-gray-500">{formatMatchDate(match.date).slice(5)}</div>
        <div className={`text-sm font-bold ${match.kickoff === "未定" ? "text-gray-400" : "text-gray-900"}`}>
          {match.kickoff === "未定" ? t("common.tbd") : (
            <>
              {match.kickoff}
              <span className="text-[10px] text-gray-400 ml-0.5">JST</span>
            </>
          )}
        </div>
      </div>

      {/* チーム */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <TeamName
            name={match.homeTeam}
            isJapan={match.homeTeam === "日本"}
            isPlaceholderTeam={!!isPlaceholder && /PO|勝者|通過|敗者/.test(match.homeTeam)}
          />
          <span className="text-gray-400 text-xs flex-shrink-0">{t("common.vsLower")}</span>
          <TeamName
            name={match.awayTeam}
            isJapan={match.awayTeam === "日本"}
            isPlaceholderTeam={!!isPlaceholder && /PO|勝者|通過|敗者/.test(match.awayTeam)}
          />
        </div>
        <div className="text-xs text-gray-400 truncate mt-0.5 hidden sm:block">
          {match.venue}
        </div>
      </div>

      {/* バッジ */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {showGroup && match.group && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
            {match.group}
          </span>
        )}
        {match.knockoutRound && (
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${getMatchTypeColor(match.type)}`}>
            {match.typeLabel}
          </span>
        )}
      </div>
    </div>
  );
}
