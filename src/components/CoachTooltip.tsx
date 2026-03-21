"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "./Icon";

interface CoachTooltipProps {
  coachName: string;
  coachNationality: string;
  teamName: string;
}

// 監督名からWikipedia検索URLを生成
function getWikipediaUrl(coachName: string): string {
  // 日本語名の場合はja.wikipedia.org、それ以外はen
  const isJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(coachName);
  const lang = isJapanese ? "ja" : "en";
  const query = encodeURIComponent(coachName);
  return `https://${lang}.wikipedia.org/wiki/Special:Search?search=${query}`;
}

export default function CoachTooltip({ coachName, coachNationality, teamName }: CoachTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  // モバイル判定
  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // 外側クリックで閉じる
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleClick = useCallback(() => {
    if (isMobile) {
      setIsOpen((prev) => !prev);
    }
  }, [isMobile]);

  const handleMouseEnter = useCallback(() => {
    if (!isMobile) setIsOpen(true);
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile) setIsOpen(false);
  }, [isMobile]);

  const wikiUrl = getWikipediaUrl(coachName);

  return (
    <div className="relative inline-block">
      <span
        ref={triggerRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-pointer underline decoration-dotted decoration-gray-400 underline-offset-2 hover:text-blue-700 transition-colors"
      >
        {coachName}（{coachNationality}）
      </span>

      {isOpen && (
        <>
          {/* モバイル: オーバーレイ */}
          {isMobile && (
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setIsOpen(false)}
            />
          )}

          <div
            ref={tooltipRef}
            className={`${
              isMobile
                ? "fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl animate-slide-up"
                : "absolute left-0 bottom-full mb-2 z-50 w-72 rounded-xl shadow-xl"
            } bg-white border border-gray-200 p-4`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* モバイルのドラッグハンドル */}
            {isMobile && (
              <div className="flex justify-center mb-3">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                <Icon name="person" size={20} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm">{coachName}</p>
                <p className="text-xs text-gray-500">{teamName}代表 監督</p>
                <p className="text-xs text-gray-400 mt-0.5">国籍: {coachNationality}</p>
              </div>
            </div>

            <a
              href={wikiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-700 transition-colors border border-gray-200"
            >
              <Icon name="open_in_new" size={14} />
              Wikipediaで詳しく見る
            </a>

            {/* モバイルの閉じるボタン */}
            {isMobile && (
              <button
                onClick={() => setIsOpen(false)}
                className="mt-2 w-full py-2.5 text-sm text-gray-500 font-medium"
              >
                閉じる
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
