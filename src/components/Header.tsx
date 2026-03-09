"use client";

import Link from "next/link";
import { useState } from "react";
import Icon from "./Icon";

const navItems = [
  { href: "/", label: "トップ", icon: "home" },
  { href: "/matches", label: "試合日程", icon: "calendar_month" },
  { href: "/groups", label: "グループ", icon: "groups" },
  { href: "/toto", label: "totoゾーン", icon: "confirmation_number" },
  { href: "/watch", label: "視聴ガイド", icon: "live_tv" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-[#1a1a2e] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Icon name="sports_soccer" size={28} />
            <span className="hidden sm:inline">W杯2026 × toto</span>
            <span className="sm:hidden">W杯2026</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
              >
                <Icon name={item.icon} size={18} />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="メニュー"
          >
            <Icon name={isOpen ? "close" : "menu"} size={24} />
          </button>
        </div>

        {/* Mobile nav */}
        {isOpen && (
          <nav className="md:hidden pb-4 border-t border-white/10 pt-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Icon name={item.icon} size={20} />
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
