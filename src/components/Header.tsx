"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "./Icon";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "@/i18n/client";

const navKeys = [
  { href: "/", key: "nav.home", icon: "home", also: [] as string[] },
  { href: "/news", key: "nav.news", icon: "article", also: [] as string[] },
  { href: "/matches", key: "nav.matches", icon: "sports_soccer", also: ["/results"] },
  { href: "/calendar", key: "nav.calendar", icon: "calendar_month", also: [] as string[] },
  { href: "/teams", key: "nav.teams", icon: "flag", also: ["/groups"] },
  { href: "/watch", key: "nav.watch", icon: "live_tv", also: [] as string[] },
];

function isActive(pathname: string, item: typeof navKeys[number]): boolean {
  if (item.href === "/") return pathname === "/";
  if (pathname.startsWith(item.href)) return true;
  return item.also.some((p) => pathname.startsWith(p));
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();

  // Edge swipe to open menu (right edge → left swipe)
  const edgeTouchStartX = useRef<number | null>(null);
  const edgeTouchStartY = useRef<number | null>(null);

  const handleEdgeSwipe = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (edgeTouchStartX.current === null) {
      // Only trigger from right edge (within 25px of right side)
      if (touch.clientX > window.innerWidth - 25) {
        edgeTouchStartX.current = touch.clientX;
        edgeTouchStartY.current = touch.clientY;
      }
      return;
    }
  }, []);

  const handleEdgeSwipeEnd = useCallback((e: TouchEvent) => {
    if (edgeTouchStartX.current === null || edgeTouchStartY.current === null) return;
    const touch = e.changedTouches[0];
    const dx = edgeTouchStartX.current - touch.clientX; // reversed: right to left
    const dy = Math.abs(touch.clientY - edgeTouchStartY.current);
    if (dx > 60 && dx > dy * 1.5) {
      setIsOpen(true);
    }
    edgeTouchStartX.current = null;
    edgeTouchStartY.current = null;
  }, []);

  useEffect(() => {
    document.addEventListener("touchstart", handleEdgeSwipe, { passive: true });
    document.addEventListener("touchmove", handleEdgeSwipe, { passive: true });
    document.addEventListener("touchend", handleEdgeSwipeEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", handleEdgeSwipe);
      document.removeEventListener("touchmove", handleEdgeSwipe);
      document.removeEventListener("touchend", handleEdgeSwipeEnd);
    };
  }, [handleEdgeSwipe, handleEdgeSwipeEnd]);

  const closeMenu = () => {
    setIsClosing(true);
    setTimeout(() => { setIsOpen(false); setIsClosing(false); }, 200);
  };

  return (
    <header className="bg-[#1a1a2e] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Icon name="sports_soccer" size={28} />
            <span className="hidden sm:inline">{t("header.siteName")}</span>
            <span className="sm:hidden">{t("header.siteNameShort")}</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navKeys.map((item) => {
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

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10"
              onClick={() => isOpen ? closeMenu() : setIsOpen(true)}
              aria-label={t("header.menu")}
            >
              <Icon name={isOpen ? "close" : "menu"} size={24} />
            </button>
          </div>
        </div>

        {/* Mobile drawer overlay + menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className={`fixed inset-0 bg-black/40 z-40 md:hidden ${isClosing ? "opacity-0" : "opacity-100"} transition-opacity duration-200`}
              onClick={closeMenu}
            />
            {/* Drawer (right side) */}
            <nav
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
                {navKeys.map((item) => {
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
