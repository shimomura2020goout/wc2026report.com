"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useSwipeable } from "react-swipeable";
import Icon from "./Icon";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "@/i18n/client";
import { usePreferences } from "@/context/PreferencesContext";

const navKeys = [
  { href: "/", key: "nav.home", icon: "home", also: [] as string[] },
  { href: "/news", key: "nav.news", icon: "article", also: [] as string[] },
  { href: "/matches", key: "nav.matches", icon: "sports_soccer", also: ["/results"] },
  { href: "/predictions", key: "nav.predictions", icon: "poll", also: [] as string[] },
  { href: "/toto", key: "nav.toto", icon: "confirmation_number", also: [] as string[] },
  { href: "/calendar", key: "nav.calendar", icon: "calendar_month", also: [] as string[] },
  { href: "/teams", key: "nav.teams", icon: "flag", also: ["/groups"] },
  { href: "/watch", key: "nav.watch", icon: "live_tv", also: [] as string[] },
];

const MYPAGE_ITEM = { href: "/mypage", key: "nav.mypage", icon: "account_circle", also: [] as string[] };

function isActive(pathname: string, item: typeof navKeys[number]): boolean {
  if (item.href === "/") return pathname === "/";
  if (pathname.startsWith(item.href)) return true;
  return item.also.some((p) => pathname.startsWith(p));
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();
  const { prefs, hydrated } = usePreferences();
  const showMyPage = hydrated && prefs.favoriteCountries.length > 0;

  const closeMenu = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => { setIsOpen(false); setIsClosing(false); }, 200);
  }, []);

  const dismissHint = useCallback(() => {
    setShowHint(false);
    try { localStorage.setItem("wc2026_menu_hint_seen", "1"); } catch {}
  }, []);

  // 初回訪問時のみメニュー誘導ヒントを表示
  useEffect(() => {
    if (typeof window === "undefined") return;
    let seen = true;
    try { seen = Boolean(localStorage.getItem("wc2026_menu_hint_seen")); } catch {}
    if (seen) return;
    const showTimer = setTimeout(() => setShowHint(true), 0);
    const hideTimer = setTimeout(() => setShowHint(false), 3000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // ドロワー内: 右スワイプで閉じる
  const drawerSwipeHandlers = useSwipeable({
    onSwipedRight: () => closeMenu(),
    trackMouse: false,
    delta: 50,
  });

  // 画面右端からの左スワイプで開く（グローバル）
  useEffect(() => {
    let startX: number | null = null;
    let startY: number | null = null;

    const onStart = (e: TouchEvent) => {
      const x = e.touches[0].clientX;
      if (x > window.innerWidth - 30) {
        startX = x;
        startY = e.touches[0].clientY;
      }
    };
    const onEnd = (e: TouchEvent) => {
      if (startX === null || startY === null) return;
      const dx = startX - e.changedTouches[0].clientX;
      const dy = Math.abs(e.changedTouches[0].clientY - startY);
      if (dx > 50 && dx > dy * 1.5) setIsOpen(true);
      startX = null;
      startY = null;
    };

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchend", onEnd);
    };
  }, []);

  return (
    <header className="bg-[#1a1a2e] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Icon name="sports_soccer" size={28} />
            <span className="hidden sm:inline">{t("header.siteName")}</span>
            <span className="sm:hidden">{t("header.siteNameShort")}</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[...navKeys, ...(showMyPage ? [MYPAGE_ITEM] : [])].map((item) => {
              const active = isActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-white/15 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon name={item.icon} size={18} />
                  {t(item.key)}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-red-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              className={`md:hidden w-11 h-11 flex items-center justify-center rounded-lg bg-[#bc002d] hover:bg-[#d0003a] active:scale-95 shadow-md transition-all ${showHint && !isOpen ? "samurai-pulse" : ""}`}
              onClick={() => {
                if (showHint) dismissHint();
                if (isOpen) closeMenu();
                else setIsOpen(true);
              }}
              aria-label={t("header.menu")}
            >
              <Icon name={isOpen ? "close" : "menu"} size={28} />
            </button>
          </div>
        </div>

        {/* 初回誘導ツールチップ */}
        {showHint && !isOpen && (
          <span className="md:hidden absolute top-14 right-4 bg-white text-[#1a1a2e] text-xs font-medium px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap animate-fade-in-down pointer-events-none z-40">
            <span className="absolute -top-1 right-5 w-2 h-2 bg-white rotate-45" />
            {t("header.menuHint")}
          </span>
        )}

        {/* Mobile drawer */}
        {isOpen && (
          <>
            <div
              className={`fixed inset-0 bg-black/40 z-40 md:hidden ${isClosing ? "opacity-0" : "opacity-100"} transition-opacity duration-200`}
              onClick={closeMenu}
            />
            <nav
              {...drawerSwipeHandlers}
              className={`fixed top-0 right-0 bottom-0 w-64 bg-[#1a1a2e] z-50 md:hidden shadow-2xl ${
                isClosing ? "animate-slide-out-to-right" : "animate-slide-in-right"
              }`}
            >
              <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white" onClick={closeMenu}>
                  <Icon name="sports_soccer" size={24} />
                  {t("header.siteName")}
                </Link>
                <button onClick={closeMenu} className="p-2 text-white/70 hover:text-white">
                  <Icon name="close" size={22} />
                </button>
              </div>
              <div className="py-2">
                {[...navKeys, ...(showMyPage ? [MYPAGE_ITEM] : [])].map((item) => {
                  const active = isActive(pathname, item);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-white/15 text-white border-l-3 border-red-400"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                      onClick={closeMenu}
                    >
                      <Icon name={item.icon} size={20} />
                      {t(item.key)}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </>
        )}
      </div>
    </header>
  );
}
