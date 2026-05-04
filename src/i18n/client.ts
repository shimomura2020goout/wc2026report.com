"use client";

// ========================================
// i18n クライアントモジュール
// クライアントコンポーネント用 Context + Hook
// ========================================

import { createContext, useContext } from "react";
import type { Locale, Dictionary } from "./constants";

interface LocaleContextValue {
  locale: Locale;
  dictionary: Dictionary;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  tArray: (key: string) => string[];
}

export const LocaleContext = createContext<LocaleContextValue>({
  locale: "ja",
  dictionary: {},
  t: (key) => key,
  tArray: () => [],
});

export function useTranslation() {
  return useContext(LocaleContext);
}

// LanguageSwitcherで使用
export function setLocaleCookie(locale: Locale) {
  document.cookie = `locale=${locale};path=/;max-age=${365 * 24 * 60 * 60};samesite=lax`;
  window.location.reload();
}
