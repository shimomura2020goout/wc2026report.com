import { Match, formatMatchDate, getMatchTypeColor } from "@/data/matches";
import Icon from "./Icon";

interface MatchListItemProps {
  match: Match;
  showGroup?: boolean;
}

export default function MatchListItem({ match, showGroup = true }: MatchListItemProps) {
  const isPlaceholder = match.isPlaceholder;

  return (
    <div className={`flex items-center gap-2 sm:gap-4 py-3 px-3 sm:px-4 rounded-lg border ${
      match.isJapan ? "bg-red-50/50 border-red-200" : "bg-white border-gray-100"
    }`}>
      {/* 日付・時間 */}
      <div className="flex-shrink-0 text-center w-20 sm:w-24">
        <div className="text-xs text-gray-500">{formatMatchDate(match.date).slice(5)}</div>
        <div className={`text-sm font-bold ${match.kickoff === "未定" ? "text-gray-400" : "text-gray-900"}`}>
          {match.kickoff === "未定" ? "TBD" : match.kickoff}
        </div>
      </div>

      {/* チーム */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <span className={`font-medium truncate ${
            match.homeTeam === "日本" ? "text-red-700" :
            isPlaceholder && /PO|勝者|通過|敗者/.test(match.homeTeam) ? "text-gray-400 italic" :
            "text-gray-900"
          }`}>
            {match.homeTeam}
          </span>
          <span className="text-gray-400 text-xs flex-shrink-0">vs</span>
          <span className={`font-medium truncate ${
            match.awayTeam === "日本" ? "text-red-700" :
            isPlaceholder && /PO|勝者|通過|敗者/.test(match.awayTeam) ? "text-gray-400 italic" :
            "text-gray-900"
          }`}>
            {match.awayTeam}
          </span>
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
        {match.isTotoTarget && (
          <span title="toto対象"><Icon name="confirmation_number" size={14} className="text-purple-400" /></span>
        )}
      </div>
    </div>
  );
}
