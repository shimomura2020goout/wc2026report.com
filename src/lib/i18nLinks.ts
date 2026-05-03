// i18n URL ヘルパー
// パス分割型の多言語URLを構築する。/{locale}/{rest} 形式。
// hreflang メタタグや LanguageSwitcher の URL 切替で使う。

import type { Locale } from "@/i18n/constants";
import { LOCALES, DEFAULT_LOCALE } from "@/i18n/constants";

export const SITE_BASE_URL = "https://www.wc2026report.com";

// ロケールに応じた og:locale 値（OpenGraph 用）
export const OG_LOCALES: Record<Locale, string> = {
  ja: "ja_JP",
  en: "en_US",
  ko: "ko_KR",
};

// パス先頭のロケールセグメントを判定
export function getLocaleFromPathname(pathname: string): Locale | null {
  const seg = pathname.split("/").filter(Boolean)[0];
  if (seg && (LOCALES as readonly string[]).includes(seg)) {
    return seg as Locale;
  }
  return null;
}

// パスからロケールセグメントを除いた残りを返す（先頭スラッシュ付き）
export function stripLocaleFromPathname(pathname: string): string {
  const locale = getLocaleFromPathname(pathname);
  if (!locale) return pathname || "/";
  const stripped = pathname.replace(new RegExp(`^/${locale}`), "");
  return stripped === "" ? "/" : stripped;
}

// ロケール付き URL を構築
// buildLocalePath('en', '/groups') -> '/en/groups'
// buildLocalePath('ja', '/')       -> '/ja'
export function buildLocalePath(locale: Locale, path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (cleanPath === "/") return `/${locale}`;
  return `/${locale}${cleanPath}`;
}

// 現在の URL（ロケール部を含む可能性あり）から、別ロケール版の URL を作る
// LanguageSwitcher が使う
export function switchLocaleHref(targetLocale: Locale, currentPathname: string, search?: string): string {
  const stripped = stripLocaleFromPathname(currentPathname);
  const next = buildLocalePath(targetLocale, stripped);
  return search ? `${next}${search}` : next;
}

// hreflang/canonical のための alternates オブジェクトを作る
// path はロケール除外パス（例: '/groups'、'/news/foo'）
// generateMetadata の `alternates` にそのまま渡せる形
export function localeAlternates(path: string): {
  canonical: string;
  languages: Record<string, string>;
} {
  const cleanPath = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    languages[l] = `${SITE_BASE_URL}/${l}${cleanPath}`;
  }
  // x-default は英語版にフォールバック（英語SEOを優先）
  languages["x-default"] = `${SITE_BASE_URL}/en${cleanPath}`;
  // canonical は現在ロケールに合わせるべきだが、generateMetadata 側で上書き
  // ここでは絶対 URL のデフォルト言語版をデフォルトに
  return {
    canonical: `${SITE_BASE_URL}/${DEFAULT_LOCALE}${cleanPath}`,
    languages,
  };
}

// ロケール固有の絶対 URL を返す（OG/canonical 用）
export function absoluteLocaleUrl(locale: Locale, path: string): string {
  return `${SITE_BASE_URL}${buildLocalePath(locale, path)}`;
}

// generateMetadata の `alternates` 用ヘルパー
// path はロケール除外の論理パス（例: '/groups', '/news/foo'）
// canonical は現在ロケール、languages には ja/en/ko/x-default を全て含む
export function pageAlternates(locale: Locale, path: string): {
  canonical: string;
  languages: Record<string, string>;
} {
  return {
    canonical: absoluteLocaleUrl(locale, path),
    languages: localeAlternates(path).languages,
  };
}
