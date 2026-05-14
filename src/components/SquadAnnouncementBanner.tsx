"use client";

import Link from "next/link";
import Icon from "./Icon";
import { buildGoogleCalendarUrl, type CalendarEvent } from "@/data/events";
import { SQUAD_PHASE } from "@/data/japanSquad";

interface Props {
  event: CalendarEvent;
}

export default function SquadAnnouncementBanner({ event }: Props) {
  const gcalUrl = buildGoogleCalendarUrl(event);
  const eventDate = new Date(`${event.startDate}T${event.startTime ?? "00:00"}:00+09:00`);
  const now = Date.now();
  const diffMs = eventDate.getTime() - now;
  const isPast = diffMs < -60 * 60 * 1000;
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const weekdayJa = ["日", "月", "火", "水", "木", "金", "土"][eventDate.getDay()];

  if (SQUAD_PHASE === "official") {
    return (
      <div className="samurai-rotating-border mb-10">
        <div className="relative bg-gradient-to-br from-[#fff7d6] via-[#ffe98a] to-[#ffd54a] text-[#1a1a2e] rounded-[calc(1.25rem-3px)] p-5 sm:p-7 overflow-hidden">
          <div
            aria-hidden
            className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-[#bc002d]/30 blur-2xl pointer-events-none"
          />
          <div
            aria-hidden
            className="absolute -left-16 -bottom-16 w-44 h-44 rounded-full bg-[#0a1e5c]/15 blur-2xl pointer-events-none"
          />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
            <div className="shrink-0 flex items-center gap-3 sm:block">
              <div className="relative">
                <div className="bg-white/70 backdrop-blur rounded-2xl p-3 sm:p-4 ring-1 ring-white/60">
                  <Icon name="celebration" size={32} className="text-[#bc002d]" />
                </div>
                <span className="samurai-pulse absolute -top-1.5 -right-1.5 bg-[#bc002d] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                  発表完了
                </span>
              </div>
              <div className="sm:hidden flex-1 min-w-0">
                <div className="inline-flex items-center gap-1 bg-[#bc002d] text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
                  SAMURAI BLUE
                </div>
                <p className="text-[11px] text-[#1a1a2e]/70">26名 確定</p>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="hidden sm:flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 bg-[#bc002d] text-white text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wider">
                  <Icon name="flag" size={12} />
                  SAMURAI BLUE
                </span>
                <span className="text-[11px] text-[#1a1a2e]/70 font-medium">26名 確定</span>
              </div>

              <h3 className="text-lg sm:text-2xl font-bold leading-tight mb-2">
                <Icon name="check_circle" size={22} className="inline-block align-middle mr-1 text-[#0a7a3c]" />
                W杯2026 日本代表メンバー <span className="text-[#bc002d]">発表完了</span>
              </h3>

              <p className="text-[#1a1a2e]/80 text-xs sm:text-sm leading-relaxed mb-4">
                森保ジャパンの最終登録メンバー26名が確定。各選手のコラム・出身地・所属クラブまで、すべて本紙で確認できます。
              </p>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Link
                  href="/japan-squad"
                  className="inline-flex items-center justify-center gap-1.5 bg-[#1a1a2e] text-white font-bold px-4 py-2.5 rounded-full hover:bg-[#bc002d] transition-colors text-sm"
                >
                  <Icon name="groups" size={16} />
                  26名一覧を見る
                  <Icon name="arrow_forward" size={14} />
                </Link>
                <Link
                  href="/news/japan-squad-final-26-may-15-2026"
                  className="inline-flex items-center justify-center gap-1.5 bg-[#bc002d] text-white font-bold px-4 py-2.5 rounded-full hover:bg-[#a00026] transition-colors text-sm"
                >
                  <Icon name="article" size={16} />
                  速報記事を読む
                  <Icon name="arrow_forward" size={14} />
                </Link>
                <Link
                  href="/teams/jpn"
                  className="inline-flex items-center justify-center gap-1.5 border-2 border-[#1a1a2e]/40 text-[#1a1a2e] font-bold px-4 py-2.5 rounded-full hover:bg-[#1a1a2e]/10 transition-colors text-sm"
                >
                  <Icon name="info" size={16} />
                  日本チーム情報
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="samurai-rotating-border mb-10">
      <div className="relative bg-gradient-to-br from-[#050f2c] via-[#0a1e5c] to-[#061536] text-white rounded-[calc(1.25rem-3px)] p-5 sm:p-7 overflow-hidden">
        {/* 背景の日章旗モチーフ */}
        <div
          aria-hidden
          className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-[#bc002d]/20 blur-2xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute -left-16 -bottom-16 w-44 h-44 rounded-full bg-[#3b9bff]/15 blur-2xl pointer-events-none"
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
          {/* アイコン部 */}
          <div className="shrink-0 flex items-center gap-3 sm:block">
            <div className="relative">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-3 sm:p-4 ring-1 ring-white/20">
                <Icon name="campaign" size={32} className="text-[#ffd700]" />
              </div>
              {!isPast && (
                <span className="samurai-pulse absolute -top-1.5 -right-1.5 bg-[#bc002d] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                  NEW
                </span>
              )}
            </div>
            {/* SP: タイトル横並び */}
            <div className="sm:hidden flex-1 min-w-0">
              <div className="inline-flex items-center gap-1 bg-[#bc002d] text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
                SAMURAI BLUE
              </div>
              <p className="text-[11px] text-blue-200">重大発表</p>
            </div>
          </div>

          {/* 本文 */}
          <div className="flex-1 min-w-0">
            {/* PC: バッジ */}
            <div className="hidden sm:flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 bg-[#bc002d] text-white text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wider">
                <Icon name="flag" size={12} />
                SAMURAI BLUE
              </span>
              <span className="text-[11px] text-blue-200 font-medium">重大発表</span>
            </div>

            <h3 className="text-lg sm:text-2xl font-bold leading-tight mb-2">
              W杯2026 日本代表<span className="text-[#ffd700]"> メンバー発表</span>
            </h3>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-sm sm:text-base">
              <span className="inline-flex items-center gap-1 font-semibold text-white">
                <Icon name="event" size={16} className="text-[#3b9bff]" />
                2026年5月15日（{weekdayJa}）
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-white">
                <Icon name="schedule" size={16} className="text-[#3b9bff]" />
                14:00〜
              </span>
              {!isPast && daysLeft > 0 && (
                <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-full text-xs text-[#ffd700] font-bold">
                  あと{daysLeft}日
                </span>
              )}
            </div>

            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed mb-4">
              森保一監督がW杯2026に挑むSAMURAI BLUEの最終登録メンバー26名を発表。5大会連続出場となる大舞台に向けた最終選考を見逃すな。
            </p>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {event.link && (
                <Link
                  href={event.link}
                  className="inline-flex items-center justify-center gap-1.5 bg-white text-[#0a1e5c] font-bold px-4 py-2.5 rounded-full hover:bg-[#ffd700] hover:text-[#050f2c] transition-colors text-sm"
                >
                  <Icon name="article" size={16} />
                  詳細記事を見る
                  <Icon name="arrow_forward" size={14} />
                </Link>
              )}
              <Link
                href="/teams/jpn"
                className="inline-flex items-center justify-center gap-1.5 border-2 border-[#ffd700]/70 text-[#ffd700] font-bold px-4 py-2.5 rounded-full hover:bg-[#ffd700]/10 hover:border-[#ffd700] transition-colors text-sm"
              >
                <Icon name="groups" size={16} />
                日本チーム情報を確認
                <Icon name="arrow_forward" size={14} />
              </Link>
              <a
                href={gcalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 border-2 border-white/70 text-white font-bold px-4 py-2.5 rounded-full hover:bg-white/10 hover:border-white transition-colors text-sm"
              >
                <Icon name="calendar_add_on" size={16} />
                Googleカレンダーに追加
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
