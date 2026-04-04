"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Icon from "./Icon";
import {
  calendarEvents,
  categoryConfig,
  getEventsForDate,
  buildGoogleCalendarUrl,
  downloadSingleIcs,
  downloadAllIcs,
  type CalendarEvent,
  type EventCategory,
} from "@/data/events";
import {
  formatMatchDate,
} from "@/data/matches";
import { allTeams } from "@/data/teams";
import { useTranslation } from "@/i18n/client";

// ========================================
// テキスト内のチーム名をリンク化するユーティリティ
// ========================================

function TeamLinkedText({ text }: { text: string }) {
  // チーム名を長い順にソート（「南アフリカ」が「アフリカ」にマッチしないように）
  const confirmedTeams = allTeams
    .filter((t) => !t.isPlaceholder)
    .sort((a, b) => b.name.length - a.name.length);

  // テキストからチーム名を探して分割
  const parts: { text: string; teamCode?: string }[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    let earliestIdx = remaining.length;
    let matchedTeam: (typeof confirmedTeams)[0] | null = null;

    for (const team of confirmedTeams) {
      const idx = remaining.indexOf(team.name);
      if (idx !== -1 && idx < earliestIdx) {
        earliestIdx = idx;
        matchedTeam = team;
      }
    }

    if (matchedTeam && earliestIdx < remaining.length) {
      if (earliestIdx > 0) {
        parts.push({ text: remaining.slice(0, earliestIdx) });
      }
      parts.push({ text: matchedTeam.name, teamCode: matchedTeam.code.toLowerCase() });
      remaining = remaining.slice(earliestIdx + matchedTeam.name.length);
    } else {
      parts.push({ text: remaining });
      remaining = "";
    }
  }

  return (
    <>
      {parts.map((part, i) =>
        part.teamCode ? (
          <Link
            key={i}
            href={`/teams/${part.teamCode}`}
            className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
          >
            {part.text}
          </Link>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </>
  );
}

// ========================================
// カレンダーグリッド生成
// ========================================

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay(); // 0=日曜
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ========================================
// カテゴリフィルターチップ
// ========================================

function CategoryFilter({
  activeCategories,
  onToggle,
}: {
  activeCategories: Set<EventCategory>;
  onToggle: (cat: EventCategory) => void;
}) {
  const categories = Object.entries(categoryConfig) as [EventCategory, typeof categoryConfig[EventCategory]][];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map(([key, config]) => {
        const isActive = activeCategories.has(key);
        return (
          <button
            key={key}
            onClick={() => onToggle(key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              isActive
                ? `${config.bgColor} ${config.color} ring-1 ring-current/20`
                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isActive ? config.dotColor : "bg-gray-300"}`} />
            {config.label}
          </button>
        );
      })}
    </div>
  );
}

// ========================================
// 日付セル
// ========================================

function DayCell({
  year,
  month,
  day,
  events,
  isToday,
  isSelected,
  onClick,
  otherEventsLabel,
}: {
  year: number;
  month: number;
  day: number;
  events: CalendarEvent[];
  isToday: boolean;
  isSelected: boolean;
  onClick: () => void;
  otherEventsLabel: string;
}) {
  const dayOfWeek = new Date(year, month - 1, day).getDay();
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;
  const hasHighlight = events.some((e) => e.isHighlight);

  return (
    <button
      onClick={onClick}
      className={`relative min-h-[60px] sm:min-h-[80px] p-1 sm:p-1.5 border border-gray-100 rounded-lg text-left transition-all hover:bg-gray-50 ${
        isSelected ? "ring-2 ring-blue-400 bg-blue-50/50" : ""
      } ${isToday ? "bg-amber-50/50" : ""}`}
    >
      <span
        className={`text-xs sm:text-sm font-medium ${
          isToday
            ? "bg-red-500 text-white w-6 h-6 rounded-full inline-flex items-center justify-center"
            : isSunday
            ? "text-red-500"
            : isSaturday
            ? "text-blue-500"
            : "text-gray-700"
        }`}
      >
        {day}
      </span>

      {/* イベントドット */}
      {events.length > 0 && (
        <div className="flex flex-wrap gap-0.5 mt-1">
          {events.slice(0, 3).map((evt) => {
            const config = categoryConfig[evt.category];
            return (
              <span
                key={evt.id}
                className={`w-1.5 h-1.5 rounded-full ${config.dotColor} ${
                  evt.isHighlight ? "ring-1 ring-offset-1 ring-current" : ""
                }`}
                title={evt.title}
              />
            );
          })}
          {events.length > 3 && (
            <span className="text-[10px] text-gray-400 leading-none">+{events.length - 3}</span>
          )}
        </div>
      )}

      {/* デスクトップ: 最初のイベントタイトル表示 */}
      {events.length > 0 && (
        <div className="hidden sm:block mt-1">
          <p
            className={`text-[10px] leading-tight truncate ${
              hasHighlight ? "font-semibold text-gray-800" : "text-gray-500"
            }`}
          >
            {events[0].title.replace(/🇯🇵 |⚽ |🏆 /g, "")}
          </p>
          {events.length > 1 && (
            <p className="text-[10px] text-gray-400">{otherEventsLabel}</p>
          )}
        </div>
      )}
    </button>
  );
}

// ========================================
// 選択日のイベント詳細
// ========================================

function EventDetail({
  events,
  dateStr,
  t,
  weekdays,
  seeMoreLabel,
}: {
  events: CalendarEvent[];
  dateStr: string;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  weekdays: string[];
  seeMoreLabel: string;
}) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Icon name="event_busy" size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">{t("calendar.noEventsDay")}</p>
      </div>
    );
  }

  // 日付表示
  const [y, m, d] = dateStr.split("-").map(Number);
  const dayName = weekdays[new Date(y, m - 1, d).getDay()];
  const dateLabel = t("calendar.dateFormat", { year: y, month: m, day: d, dayName });

  return (
    <div>
      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
        <Icon name="calendar_today" size={16} className="text-blue-500" />
        {dateLabel}
      </h3>
      <div className="space-y-3">
        {events.map((evt) => {
          const config = categoryConfig[evt.category];
          return (
            <div
              key={evt.id}
              className={`p-3 rounded-lg border ${
                evt.isHighlight ? "border-amber-200 bg-amber-50/50" : "border-gray-100 bg-white"
              }`}
            >
              <div className="flex items-start gap-2">
                <span className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${config.dotColor}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${config.bgColor} ${config.color} font-medium`}>
                      {config.label}
                    </span>
                    {evt.isHighlight && (
                      <Icon name="star" size={12} className="text-amber-500" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    <TeamLinkedText text={evt.title} />
                  </p>
                  {evt.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      <TeamLinkedText text={evt.description} />
                    </p>
                  )}
                  {evt.endDate && evt.endDate !== evt.startDate && (
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                      <Icon name="date_range" size={12} />
                      {formatMatchDate(evt.startDate)} 〜 {formatMatchDate(evt.endDate)}
                    </p>
                  )}
                  {evt.link && (
                    <Link
                      href={evt.link}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium"
                    >
                      {seeMoreLabel}
                      <Icon name="arrow_forward" size={12} />
                    </Link>
                  )}

                  {/* カレンダー追加ボタン */}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                    <a
                      href={buildGoogleCalendarUrl(evt)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-green-700 hover:text-green-900 bg-green-50 hover:bg-green-100 px-2 py-1 rounded transition-colors"
                      title={t("calendar.addToGoogleCalendar")}
                    >
                      <Icon name="event" size={12} />
                      Google
                    </a>
                    <button
                      onClick={() => downloadSingleIcs(evt)}
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors"
                      title={t("calendar.downloadIcs")}
                    >
                      <Icon name="download" size={12} />
                      .ics
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ========================================
// 月間リストビュー（モバイルフレンドリー）
// ========================================

function MonthListView({
  year,
  month,
  filteredEvents,
  t,
  weekdays,
}: {
  year: number;
  month: number;
  filteredEvents: CalendarEvent[];
  t: (key: string, replacements?: Record<string, string | number>) => string;
  weekdays: string[];
}) {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;

  // この月のイベントを日付順にソート
  const monthEvents = filteredEvents
    .filter((e) => {
      if (e.startDate.startsWith(prefix)) return true;
      if (e.endDate) {
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0);
        return new Date(e.startDate) <= monthEnd && new Date(e.endDate) >= monthStart;
      }
      return false;
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  if (monthEvents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-sm">{t("calendar.noEventsMonth")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {monthEvents.map((evt) => {
        const config = categoryConfig[evt.category];
        const [, , d] = evt.startDate.split("-").map(Number);
        const dayName = weekdays[new Date(year, month - 1, d).getDay()];

        return (
          <div
            key={evt.id}
            className={`flex items-start gap-3 p-3 rounded-lg ${
              evt.isHighlight ? "bg-amber-50 border border-amber-200" : "bg-white border border-gray-100"
            }`}
          >
            {/* 日付 */}
            <div className="text-center shrink-0 w-10">
              <div className="text-lg font-bold text-gray-800">{d}</div>
              <div className="text-[10px] text-gray-400">{dayName}</div>
            </div>

            {/* 内容 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                <span className={`text-[10px] ${config.color} font-medium`}>{config.label}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 truncate">
                <TeamLinkedText text={evt.title} />
              </p>
              {evt.description && (
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                  <TeamLinkedText text={evt.description} />
                </p>
              )}
            </div>

            {/* アクション */}
            <div className="flex flex-col gap-1 shrink-0">
              <a
                href={buildGoogleCalendarUrl(evt)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:text-green-700 transition-colors"
                title={t("calendar.addToGoogleCalendar")}
              >
                <Icon name="event" size={16} />
              </a>
              {evt.link && (
                <Link href={evt.link} className="text-gray-400 hover:text-blue-500">
                  <Icon name="arrow_forward" size={16} />
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ========================================
// メインコンポーネント
// ========================================

export default function CalendarView() {
  const { t, tArray } = useTranslation();
  const weekdays = tArray("calendar.weekdays");
  const months = tArray("calendar.months");
  const seeMoreLabel = t("common.seeMore");

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(
    today.getFullYear() === 2026 ? today.getMonth() + 1 : 3
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  // カテゴリフィルター
  const [activeCategories, setActiveCategories] = useState<Set<EventCategory>>(
    new Set(Object.keys(categoryConfig) as EventCategory[])
  );

  const toggleCategory = (cat: EventCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  // フィルタ済みイベント
  const filteredEvents = useMemo(
    () => calendarEvents.filter((e) => activeCategories.has(e.category)),
    [activeCategories]
  );

  // カレンダーデータ
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);

  // 月ナビゲーション
  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
    setSelectedDate(formatDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate()));
  };

  // 今月のハイライトイベント
  const highlightEvents = filteredEvents.filter((e) => {
    const prefix = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
    return e.startDate.startsWith(prefix) && e.isHighlight;
  });

  // 選択日のイベント
  const selectedEvents = selectedDate
    ? getEventsForDate(selectedDate).filter((e) => activeCategories.has(e.category))
    : [];

  const todayStr = formatDateKey(today.getFullYear(), today.getMonth() + 1, today.getDate());

  // 年月表示
  const yearMonthLabel = t("calendar.yearMonth", {
    year: currentYear,
    month: months[currentMonth] || String(currentMonth),
  });

  // ── スワイプ対応（スライダー風アニメーション） ──
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);
  const isSwipingRef = useRef(false);
  const calendarContentRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwipingRef.current = false;
    setSwipeOffset(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (!isSwipingRef.current && Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      isSwipingRef.current = true;
    }
    if (isSwipingRef.current) {
      // 抵抗感を出すために係数0.4
      setSwipeOffset(deltaX * 0.4);
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX > 0) {
        setSlideDirection("right");
        setTimeout(() => { goToPrevMonth(); setSlideDirection(null); }, 200);
      } else {
        setSlideDirection("left");
        setTimeout(() => { goToNextMonth(); setSlideDirection(null); }, 200);
      }
    }
    setSwipeOffset(0);
    touchStartX.current = null;
    touchStartY.current = null;
    isSwipingRef.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // slideDirection が変わったらアニメーション開始位置をリセット
  const slideClass = slideDirection === "left"
    ? "animate-slide-out-left"
    : slideDirection === "right"
    ? "animate-slide-out-right"
    : "";

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── ヘッダー: 月ナビ & ビュー切り替え ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={t("common.prevMonth")}
          >
            <Icon name="chevron_left" size={20} />
          </button>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 min-w-[120px] text-center">
            {yearMonthLabel}
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={t("common.nextMonth")}
          >
            <Icon name="chevron_right" size={20} />
          </button>
          <button
            onClick={goToToday}
            className="ml-2 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            {t("common.today")}
          </button>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("calendar")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "calendar" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
            }`}
            aria-label={t("common.calendarView")}
          >
            <Icon name="calendar_view_month" size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
            }`}
            aria-label={t("common.listView")}
          >
            <Icon name="view_list" size={18} />
          </button>
        </div>
      </div>

      {/* ── カレンダー連携ボタン ── */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => downloadAllIcs(filteredEvents)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
        >
          <Icon name="download" size={16} />
          {t("calendar.downloadAllIcs")}
        </button>
        <span className="text-[11px] text-gray-400">
          {t("calendar.icsNote")}
        </span>
      </div>

      {/* ── カテゴリフィルター ── */}
      <CategoryFilter activeCategories={activeCategories} onToggle={toggleCategory} />

      {/* ── 今月のハイライト ── */}
      {highlightEvents.length > 0 && viewMode === "calendar" && (
        <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
          <p className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1">
            <Icon name="star" size={14} />
            {t("calendar.highlightTitle")}
          </p>
          <div className="flex flex-wrap gap-2">
            {highlightEvents.map((evt) => {
              const [, , d] = evt.startDate.split("-").map(Number);
              return (
                <span
                  key={evt.id}
                  className="text-xs bg-white/80 text-amber-900 px-2 py-1 rounded-md border border-amber-200"
                >
                  <span className="font-semibold">{t("calendar.highlightDay", { day: d })}</span>{" "}
                  {evt.title.replace(/🇯🇵 |⚽ |🏆 /g, "")}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── メインコンテンツ ── */}
      {viewMode === "calendar" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* カレンダーグリッド */}
          <div
            ref={calendarContentRef}
            className={`transition-transform duration-200 ease-out ${slideClass}`}
            style={swipeOffset !== 0 ? { transform: `translateX(${swipeOffset}px)`, opacity: Math.max(0.5, 1 - Math.abs(swipeOffset) / 300) } : undefined}
          >
            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {weekdays.map((day, i) => (
                <div
                  key={day}
                  className={`text-center text-xs font-medium py-1.5 ${
                    i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 日付グリッド */}
            <div className="grid grid-cols-7 gap-1">
              {/* 空白セル */}
              {Array.from({ length: firstDayOfWeek }, (_, i) => (
                <div key={`empty-${i}`} className="min-h-[60px] sm:min-h-[80px]" />
              ))}

              {/* 日付セル */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateKey = formatDateKey(currentYear, currentMonth, day);
                const dayEvents = getEventsForDate(dateKey).filter((e) =>
                  activeCategories.has(e.category)
                );

                return (
                  <DayCell
                    key={day}
                    year={currentYear}
                    month={currentMonth}
                    day={day}
                    events={dayEvents}
                    isToday={dateKey === todayStr}
                    isSelected={dateKey === selectedDate}
                    onClick={() => setSelectedDate(dateKey === selectedDate ? null : dateKey)}
                    otherEventsLabel={t("calendar.otherEvents", { count: dayEvents.length - 1 })}
                  />
                );
              })}
            </div>
          </div>

          {/* サイドバー: 選択日のイベント詳細 */}
          <div className="bg-gray-50 rounded-xl p-4 lg:sticky lg:top-24 lg:self-start">
            {selectedDate ? (
              <EventDetail
                events={selectedEvents}
                dateStr={selectedDate}
                t={t}
                weekdays={weekdays}
                seeMoreLabel={seeMoreLabel}
              />
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Icon name="touch_app" size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t("calendar.clickToView")}</p>
                <p className="text-sm">{t("calendar.showEventDetail")}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* リストビュー */
        <MonthListView
          year={currentYear}
          month={currentMonth}
          filteredEvents={filteredEvents}
          t={t}
          weekdays={weekdays}
        />
      )}
    </div>
  );
}
