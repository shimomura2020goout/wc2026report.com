"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "@/i18n/client";
import Icon from "./Icon";

interface PlayerTooltipProps {
  playerName: string;
  teamName: string;
  teamFlag: string;
  columnSlug?: string;
}

function getWikipediaUrl(name: string, locale: string): string {
  const isJapaneseScript = /[぀-ゟ゠-ヿ一-鿿]/.test(name);
  // 文字種が日本語ならja Wikipedia、そうでなければ閲覧者の locale → en の優先順
  const lang = isJapaneseScript ? "ja" : locale === "ko" ? "ko" : "en";
  const suffix =
    lang === "ja" ? " サッカー" : lang === "ko" ? " 축구 선수" : " footballer";
  return `https://${lang}.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(name + suffix)}`;
}

// クリックは「コラムがあればコラム / 無ければ Wikipedia」へ即時遷移する。
// ホバー（デスクトップ）でツールチップは引き続き出して情報も見せる。
export default function PlayerTooltip({ playerName, teamName, teamFlag, columnSlug }: PlayerTooltipProps) {
  const { locale, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isOpen || !isMobile) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isMobile]);

  useEffect(() => {
    return () => { if (closeTimer.current) clearTimeout(closeTimer.current); };
  }, []);

  const open = useCallback(() => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    setIsOpen(true);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setIsOpen(false), 300);
  }, []);

  const wikiUrl = getWikipediaUrl(playerName, locale);
  const columnHref = columnSlug ? `/${locale}/news/${columnSlug}` : null;
  // 1タップ少なく：クリックで直接遷移する。コラム優先、無ければ Wikipedia。
  const primaryHref = columnHref ?? wikiUrl;
  const opensExternal = !columnHref;

  return (
    <span
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={() => { if (!isMobile) open(); }}
      onMouseLeave={() => { if (!isMobile) scheduleClose(); }}
    >
      <a
        href={primaryHref}
        target={opensExternal ? "_blank" : undefined}
        rel={opensExternal ? "noopener noreferrer" : undefined}
        aria-label={
          columnHref
            ? t("playerTooltip.ariaColumn", { name: playerName })
            : t("playerTooltip.ariaWiki", { name: playerName })
        }
        className="inline-block bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group text-left no-underline"
      >
        <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {playerName}
        </span>
        <span className="text-[10px] text-gray-400 ml-1.5 group-hover:text-blue-400">↗</span>
      </a>

      {isOpen && (
        <>
          {isMobile && (
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setIsOpen(false)}
            />
          )}

          <div
            className={`${
              isMobile
                ? "fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl animate-slide-up"
                : "absolute left-0 bottom-full mb-2 z-50 w-64 rounded-xl shadow-xl"
            } bg-white border border-gray-200 p-4`}
            onMouseEnter={() => { if (!isMobile) open(); }}
            onMouseLeave={() => { if (!isMobile) scheduleClose(); }}
          >
            {isMobile && (
              <div className="flex justify-center mb-3">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                <Icon name="sports_soccer" size={20} className="text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block font-bold text-gray-900 text-sm">{playerName}</span>
                <span className="block text-xs text-gray-500">
                  <span>{teamFlag}</span> {t("playerTooltip.teamSuffix", { team: teamName })}
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              {columnSlug && (
                <a
                  href={`/${locale}/news/${columnSlug}`}
                  className="flex items-center justify-center gap-1.5 w-full py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-medium text-blue-700 transition-colors border border-blue-200"
                >
                  <Icon name="article" size={14} />
                  {t("playerTooltip.readColumn")}
                </a>
              )}
              <a
                href={wikiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-700 transition-colors border border-gray-200"
              >
                <Icon name="open_in_new" size={14} />
                {t("playerTooltip.viewWiki")}
              </a>
            </div>

            {isMobile && (
              <button
                onClick={() => setIsOpen(false)}
                className="mt-2 w-full py-2.5 text-sm text-gray-500 font-medium"
              >
                {t("playerTooltip.close")}
              </button>
            )}
          </div>
        </>
      )}
    </span>
  );
}
