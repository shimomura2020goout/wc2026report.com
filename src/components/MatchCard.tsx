"use client";

import Link from "next/link";
import { Match, formatMatchDate, getMatchTypeColor } from "@/data/matches";
import { getTeamByName } from "@/data/teams";
import { useTranslation } from "@/i18n/client";
import Icon from "./Icon";

interface MatchCardProps {
  match: Match;
  showType?: boolean;
  /** 予想コーナーへのクリッカブル遷移を無効化（/predictions ページ上での自己遷移を防ぐ用途） */
  linkToPrediction?: boolean;
}

function CardTeamName({ name }: { name: string }) {
  const team = getTeamByName(name);
  const canLink = team && !team.isPlaceholder;
  const isJapan = name === "日本";
  const className = `text-base sm:text-lg font-bold ${isJapan ? "text-red-700" : "text-gray-900"}`;

  if (canLink) {
    return (
      <Link
        href={`/teams/${team.code.toLowerCase()}`}
        className={`${className} hover:underline relative z-10`}
      >
        {name}
      </Link>
    );
  }
  return <span className={className}>{name}</span>;
}

export default function MatchCard({ match, showType = true, linkToPrediction = true }: MatchCardProps) {
  const { t } = useTranslation();

  // プレースホルダー（"PO勝者" など）は予想対象にならないため、クリッカブル遷移もしない
  const canLinkToPrediction = linkToPrediction && !match.isPlaceholder;

  return (
    <div
      className={`match-card relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${
        match.isJapan ? "japan-accent" : ""
      } ${canLinkToPrediction ? "hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group" : ""}`}
    >
      {/* 予想コーナーへの全面クリックオーバーレイ。内側リンクは z-10 で勝たせる */}
      {canLinkToPrediction && (
        <Link
          href={`/predictions#match-${match.id}`}
          aria-label={`${match.homeTeam} vs ${match.awayTeam} の勝敗を予想する`}
          className="absolute inset-0 z-0"
        />
      )}

      <div className="p-4 sm:p-5">
        {/* Date & Type */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">
            {formatMatchDate(match.date)}
            {match.kickoff !== "未定" && (
              <span className="ml-2 text-gray-900 font-bold">
                {match.kickoff} {t("common.ko")}
                <span className="text-[10px] text-gray-400 ml-0.5">JST</span>
              </span>
            )}
          </span>
          {showType && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${getMatchTypeColor(match.type)}`}>
              {match.typeLabel}
            </span>
          )}
        </div>

        {/* Teams & Score */}
        <div className="flex items-center justify-center gap-4 my-4">
          <div className="flex-1 text-right">
            <CardTeamName name={match.homeTeam} />
          </div>
          {match.status === "finished" && match.homeScore != null && match.awayScore != null ? (
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black text-gray-900">{match.homeScore}</span>
              <span className="text-gray-400 font-bold text-sm">-</span>
              <span className="text-2xl font-black text-gray-900">{match.awayScore}</span>
            </div>
          ) : (
            <div className="text-gray-400 font-bold text-lg">{t("common.vs")}</div>
          )}
          <div className="flex-1 text-left">
            <CardTeamName name={match.awayTeam} />
          </div>
        </div>

        {/* Venue */}
        <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-3">
          <Icon name="location_on" size={16} className="text-gray-400" />
          {match.venue}（{match.city}）
        </div>

        {/* Badges */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {match.group && (
            <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
              <Icon name="shield" size={14} />
              {t("common.groupName", { name: match.group })}
            </span>
          )}
          {canLinkToPrediction && (
            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium group-hover:bg-blue-100">
              <Icon name="how_to_vote" size={14} />
              予想する
              <Icon name="chevron_right" size={14} />
            </span>
          )}
        </div>

        {/* Result note (finished) or Preview note (scheduled with link) */}
        {match.resultNote && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 text-center">
            <p>{match.resultNote}</p>
          </div>
        )}

        {/* Broadcast (for upcoming matches without resultLink) */}
        {match.status !== "finished" && match.broadcast && (
          <div className={`${match.resultNote ? "mt-2" : "mt-3 pt-3 border-t border-gray-100"} text-xs text-gray-500 text-center flex items-center justify-center gap-1`}>
            <Icon name="live_tv" size={14} className="text-gray-400" />
            {match.broadcast}
          </div>
        )}

        {/* Add to Calendar (all matches with known kickoff time) */}
        {match.status !== "finished" && match.kickoff !== "未定" && (
          <div className="mt-2 flex items-center justify-center gap-3 text-xs">
            <a
              href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${match.homeTeam} vs ${match.awayTeam}`)}&dates=${match.date.replace(/-/g, "")}T${match.kickoff.replace(":", "")}00/${match.date.replace(/-/g, "")}T${String(Number(match.kickoff.split(":")[0]) + 2).padStart(2, "0")}${match.kickoff.split(":")[1]}00&ctz=Asia/Tokyo&details=${encodeURIComponent(`W杯2026 ${match.typeLabel || ""} | ${match.venue}（${match.city}）`)}&location=${encodeURIComponent(`${match.venue}, ${match.city}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 relative z-10"
            >
              <Icon name="calendar_add_on" size={13} />
              カレンダーに追加
            </a>
          </div>
        )}

        {/* Article link — finished: 試合レポート / scheduled: プレビュー記事 */}
        {match.resultLink && (
          <div className="mt-2 text-center">
            <Link
              href={match.resultLink}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium relative z-10"
            >
              <Icon name="article" size={13} />
              {match.status === "finished" ? "試合レポートを読む" : "プレビュー記事を読む"}
              <Icon name="chevron_right" size={13} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
