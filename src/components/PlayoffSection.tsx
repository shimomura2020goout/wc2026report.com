"use client";

import { useState } from "react";
import Icon from "./Icon";
import { playoffTeams, playoffMatches } from "@/data/playoff";
import { formatMatchDate } from "@/data/matches";

export default function PlayoffSection() {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const teams = Object.values(playoffTeams);

  return (
    <section className="mb-12">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl p-5 sm:p-6 text-white mb-6">
        <h2 className="text-lg sm:text-xl font-bold mb-2 flex items-center gap-2">
          <Icon name="emoji_events" size={24} />
          UEFA プレーオフ パスB — 日本の第3戦の対戦相手が決まる
        </h2>
        <p className="text-blue-200 text-sm leading-relaxed">
          グループFの4枠目は、UEFAプレーオフ パスBの勝者が入ります。
          <strong className="text-white">2026年3月31日</strong>に勝者が決定。
          候補は<strong className="text-white">ウクライナ・スウェーデン・ポーランド・アルバニア</strong>の4カ国です。
        </p>
      </div>

      {/* プレーオフ日程 */}
      <div className="mb-6">
        <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Icon name="calendar_month" size={20} className="text-gray-500" />
          プレーオフ日程
        </h3>
        <div className="space-y-3">
          {/* 準決勝 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
              準決勝 — {formatMatchDate(playoffMatches[0].date)} {playoffMatches[0].kickoff} KO（日本時間）
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {playoffMatches.filter(m => m.round === "semi").map((match) => (
                <div key={match.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-bold text-gray-900 text-sm">{match.homeTeam}</span>
                    <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded">VS</span>
                    <span className="font-bold text-gray-900 text-sm">{match.awayTeam}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 決勝 */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-amber-200 p-4">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">
              決勝（W杯出場決定戦） — {formatMatchDate(playoffMatches[2].date)} {playoffMatches[2].kickoff} KO（日本時間）
            </p>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <span className="font-bold text-amber-800 text-sm">準決勝①の勝者 vs 準決勝②の勝者</span>
              <p className="text-xs text-amber-600 mt-1">この勝者が日本のグループFに入る</p>
            </div>
          </div>
        </div>
      </div>

      {/* 候補4チームの詳細 */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Icon name="groups" size={20} className="text-gray-500" />
          候補4カ国の戦力分析
        </h3>
        <div className="space-y-3">
          {teams.map((team) => {
            const isExpanded = expandedTeam === team.name;
            return (
              <div key={team.name} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* チーム概要（常に表示） */}
                <button
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedTeam(isExpanded ? null : team.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{team.name}</h4>
                        <p className="text-xs text-gray-500">FIFAランキング {team.fifaRanking}位</p>
                      </div>
                    </div>
                    <Icon name={isExpanded ? "expand_less" : "expand_more"} size={24} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{team.qualificationNote}</p>
                </button>

                {/* 詳細（展開時） */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                    {/* キープレイヤー */}
                    <h5 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-1">
                      <Icon name="star" size={18} className="text-amber-500" />
                      キープレイヤー
                    </h5>
                    <div className="space-y-3 mb-4">
                      {team.keyPlayers.map((player) => (
                        <div key={player.name} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-gray-900 text-sm">{player.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{player.position}</span>
                              <span className="text-xs text-gray-500">{player.club}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600">{player.note}</p>
                        </div>
                      ))}
                    </div>

                    {/* 強み・弱み */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <h5 className="font-bold text-green-700 text-xs mb-2 flex items-center gap-1">
                          <Icon name="thumb_up" size={14} /> 強み
                        </h5>
                        <ul className="space-y-1">
                          {team.strengths.map((s) => (
                            <li key={s} className="text-xs text-gray-600 flex items-start gap-1">
                              <Icon name="check" size={14} className="text-green-500 mt-0.5" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-bold text-red-700 text-xs mb-2 flex items-center gap-1">
                          <Icon name="thumb_down" size={14} /> 課題
                        </h5>
                        <ul className="space-y-1">
                          {team.weaknesses.map((w) => (
                            <li key={w} className="text-xs text-gray-600 flex items-start gap-1">
                              <Icon name="close" size={14} className="text-red-500 mt-0.5" />
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 出典 */}
      <div className="mt-4 text-xs text-gray-400">
        <div className="flex items-center gap-1 mb-1">
          <Icon name="info" size={14} />
          出典
        </div>
        <a href="https://www.uefa.com/european-qualifiers/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">UEFA公式 — 欧州予選</a>
        {" / "}
        <a href="https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">FIFA公式</a>
        <span className="ml-2">最終更新: 2026年3月10日</span>
      </div>
    </section>
  );
}
