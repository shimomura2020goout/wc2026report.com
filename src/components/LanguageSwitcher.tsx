"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation, setLocaleCookie } from "@/i18n/client";
import type { Locale } from "@/i18n/index";
import Icon from "./Icon";

const languages: { code: Locale; label: string; flag: string }[] = [
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
];

export default function LanguageSwitcher() {
  const { locale } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = languages.find((l) => l.code === locale) ?? languages[0];

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 whitespace-nowrap"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
      >
        <span className="text-sm leading-none">{current.flag}</span>
        <span>Language</span>
        <Icon name="expand_more" size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-1 min-w-[140px] bg-white text-gray-900 rounded-md shadow-lg border border-gray-200 overflow-hidden z-50"
        >
          {languages.map((l) => {
            const active = l.code === locale;
            return (
              <button
                key={l.code}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  if (!active) setLocaleCookie(l.code);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-left text-xs ${
                  active ? "font-bold bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span className="text-sm leading-none">{l.flag}</span>
                <span className="flex-1">{l.label}</span>
                {active && <Icon name="check" size={14} className="text-blue-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
