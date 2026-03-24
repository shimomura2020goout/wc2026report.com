"use client";

import { useTranslation, setLocaleCookie } from "@/i18n/client";
import type { Locale } from "@/i18n/index";

const languages: { code: Locale; label: string; flag: string }[] = [
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "en", label: "EN", flag: "🇺🇸" },
];

export default function LanguageSwitcher() {
  const { locale } = useTranslation();

  return (
    <div className="flex items-center gap-0.5">
      {languages.map(({ code, label, flag }) => (
        <button
          key={code}
          onClick={() => {
            if (code !== locale) setLocaleCookie(code);
          }}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
            code === locale
              ? "bg-white/20 text-white"
              : "text-white/50 hover:text-white/80 hover:bg-white/10"
          }`}
          aria-label={label}
          aria-current={code === locale ? "true" : undefined}
        >
          <span className="text-sm">{flag}</span>
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
