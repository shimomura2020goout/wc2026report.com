// ========================================
// i18n コアモジュール
// サーバーコンポーネント用（next/headers, next/cookies を使用）
// ========================================

import { cookies, headers } from "next/headers";
import {
  type Locale,
  type Dictionary,
  LOCALES,
  DEFAULT_LOCALE,
  COOKIE_NAME,
  LOCALE_HEADER,
} from "./constants";

// 型・定数は constants.ts から来る。クライアントから参照する場合も
// constants.ts を直接 import すれば next/headers の連鎖が起きない。
export {
  LOCALES,
  DEFAULT_LOCALE,
  COOKIE_NAME,
  LOCALE_HEADER,
};
export type { Locale, Dictionary };

// 翻訳ファイルの遅延読み込み
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  ja: () => import("./locales/ja.json").then((m) => m.default),
  en: () => import("./locales/en.json").then((m) => m.default),
  ko: () => import("./locales/ko.json").then((m) => m.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}

// サーバーコンポーネントでのlocale取得
// 優先順位: middleware が設定した x-locale ヘッダー → cookie → DEFAULT_LOCALE
export async function getLocale(): Promise<Locale> {
  try {
    const h = await headers();
    const headerLocale = h.get(LOCALE_HEADER);
    if (headerLocale && LOCALES.includes(headerLocale as Locale)) {
      return headerLocale as Locale;
    }
  } catch {
    // ignore
  }
  try {
    const cookieStore = await cookies();
    const locale = cookieStore.get(COOKIE_NAME)?.value;
    if (locale && LOCALES.includes(locale as Locale)) {
      return locale as Locale;
    }
  } catch {
    // ignore
  }
  return DEFAULT_LOCALE;
}

// 後方互換
export const getLocaleFromCookies = getLocale;

// URL params から locale を取り出す（[locale] セグメントを持つ page で使用）
export function resolveLocaleParam(value: string | undefined): Locale {
  if (value && (LOCALES as readonly string[]).includes(value)) {
    return value as Locale;
  }
  return DEFAULT_LOCALE;
}

// 翻訳ヘルパー（サーバー側）
export function createTranslator(dict: Dictionary) {
  return function t(key: string, replacements?: Record<string, string | number>): string {
    const value = dict[key];
    if (typeof value !== "string") return key;
    if (!replacements) return value;
    return Object.entries(replacements).reduce(
      (str, [k, v]) => str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v)),
      value
    );
  };
}

// 翻訳配列ヘルパー
export function getTranslationArray(dict: Dictionary, key: string): string[] {
  const value = dict[key];
  if (Array.isArray(value)) return value;
  return [];
}
