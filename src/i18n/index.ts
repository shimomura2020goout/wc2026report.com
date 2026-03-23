// ========================================
// i18n コアモジュール
// サーバーコンポーネント用
// ========================================

import { cookies } from "next/headers";

export type Locale = "ja" | "ko" | "en";
export const LOCALES: Locale[] = ["ja", "ko", "en"];
export const DEFAULT_LOCALE: Locale = "ja";
export const COOKIE_NAME = "locale";

export type Dictionary = Record<string, string | string[]>;

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
export async function getLocaleFromCookies(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const locale = cookieStore.get(COOKIE_NAME)?.value;
    if (locale && LOCALES.includes(locale as Locale)) {
      return locale as Locale;
    }
  } catch {
    // cookies() がビルド時に呼べない場合のフォールバック
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
