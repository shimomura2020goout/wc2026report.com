"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Icon from "./Icon";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "@/i18n/client";

const navKeys = [
  { href: "/", key: "nav.home", icon: "home", also: [] as string[] },
  { href: "/matches", key: "nav.matches", icon: "sports_soccer", also: ["/results"] },
  { href: "/calendar", key: "nav.calendar", icon: "calendar_month", also: [] as string[] },
  { href: "/teams", key: "nav.teams", icon: "flag", also: ["/groups"] },
  { href: "/toto", key: "nav.toto", icon: "confirmation_number", also: [] as string[] },
  { href: "/watch", key: "nav.watch", icon: "live_tv", also: [] as string[] },
  { href: "/news", key: "nav.news", icon: "article", also: [] as string[] },
];

function isActive(pathname: string, item: typeof navKeys[number]): boolean {
  if (item.href === "/") return pathname === "/";
  if (pathname.startsWith(item.href)) return true;
  return item.also.some((p) => pathname.startsWith(p));
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();

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
              onClick={() => setIsOpen(!isOpen)}
              aria-label={t("header.menu")}
            >
              <Icon name={isOpen ? "close" : "menu"} size={24} />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {isOpen && (
          <nav className="md:hidden pb-4 border-t border-white/10 pt-2">
            {navKeys.map((item) => {
              const active = isActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-white/15 text-white border-l-3 border-red-400"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon name={item.icon} size={20} />
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
