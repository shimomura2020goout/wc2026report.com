"use client";

import { useCallback } from "react";
import { LocaleContext } from "@/i18n/client";
import type { Locale, Dictionary } from "@/i18n/index";

interface LocaleProviderProps {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}

export default function LocaleProvider({ locale, dictionary, children }: LocaleProviderProps) {
  const t = useCallback(
    (key: string, replacements?: Record<string, string | number>) => {
      const value = dictionary[key];
      if (typeof value !== "string") return key;
      if (!replacements) return value;
      return Object.entries(replacements).reduce(
        (str, [k, v]) => str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v)),
        value
      );
    },
    [dictionary]
  );

  const tArray = useCallback(
    (key: string) => {
      const value = dictionary[key];
      if (Array.isArray(value)) return value;
      return [];
    },
    [dictionary]
  );

  return (
    <LocaleContext.Provider value={{ locale, dictionary, t, tArray }}>
      {children}
    </LocaleContext.Provider>
  );
}
