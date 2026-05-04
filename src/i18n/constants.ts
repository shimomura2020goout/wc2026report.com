// クライアント・サーバー両方から安全にインポートできる定数と型
// サーバー専用 API（next/headers, next/cookies）に触れない。

export type Locale = "ja" | "ko" | "en";
export const LOCALES: Locale[] = ["ja", "ko", "en"];
export const DEFAULT_LOCALE: Locale = "ja";
export const COOKIE_NAME = "locale";
export const LOCALE_HEADER = "x-locale";

export type Dictionary = Record<string, string | string[]>;
