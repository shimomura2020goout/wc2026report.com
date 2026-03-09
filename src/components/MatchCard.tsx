import { Match, formatMatchDate, getMatchTypeColor } from "@/data/matches";
import Icon from "./Icon";

interface MatchCardProps {
  match: Match;
  showType?: boolean;
}

export default function MatchCard({ match, showType = true }: MatchCardProps) {
  return (
    <div className={`match-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${match.isJapan ? "japan-accent" : ""}`}>
      <div className="p-4 sm:p-5">
        {/* Date & Type */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">
            {formatMatchDate(match.date)}
            {match.kickoff !== "未定" && (
              <span className="ml-2 text-gray-900 font-bold">{match.kickoff} KO</span>
            )}
          </span>
          {showType && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getMatchTypeColor(match.type)}`}>
              {match.typeLabel}
            </span>
          )}
        </div>

        {/* Teams */}
        <div className="flex items-center justify-center gap-4 my-4">
          <div className="flex-1 text-right">
            <span className={`text-base sm:text-lg font-bold ${match.homeTeam === "日本" ? "text-red-700" : "text-gray-900"}`}>
              {match.homeTeam}
            </span>
          </div>
          <div className="text-gray-400 font-bold text-lg">VS</div>
          <div className="flex-1 text-left">
            <span className={`text-base sm:text-lg font-bold ${match.awayTeam === "日本" ? "text-red-700" : "text-gray-900"}`}>
              {match.awayTeam}
            </span>
          </div>
        </div>

        {/* Venue */}
        <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-3">
          <Icon name="location_on" size={16} className="text-gray-400" />
          {match.venue}（{match.city}）
        </div>

        {/* Badges */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {match.isTotoTarget && (
            <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
              <Icon name="confirmation_number" size={14} />
              toto対象
            </span>
          )}
          {match.group && (
            <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
              <Icon name="shield" size={14} />
              グループ{match.group}
            </span>
          )}
        </div>

        {/* Broadcast */}
        {match.broadcast && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 text-center flex items-center justify-center gap-1">
            <Icon name="live_tv" size={14} className="text-gray-400" />
            {match.broadcast}
          </div>
        )}
      </div>
    </div>
  );
}
