import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LOCALES = ["ja", "ko", "en"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
const COOKIE_NAME = "locale";
const DEFAULT_LOCALE: SupportedLocale = "ja";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. クエリパラメータで言語切替（LanguageSwitcherのフォールバック）
  const langParam = request.nextUrl.searchParams.get("lang");
  if (langParam && SUPPORTED_LOCALES.includes(langParam as SupportedLocale)) {
    response.cookies.set(COOKIE_NAME, langParam, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  // 2. 既存cookieがあればスキップ
  const existingLocale = request.cookies.get(COOKIE_NAME)?.value;
  if (existingLocale && SUPPORTED_LOCALES.includes(existingLocale as SupportedLocale)) {
    return response;
  }

  // 3. Vercel IP判定で自動設定
  const country = request.headers.get("x-vercel-ip-country") ?? "";
  let detectedLocale: SupportedLocale = DEFAULT_LOCALE;
  if (country === "KR") {
    detectedLocale = "ko";
  } else if (country === "JP") {
    detectedLocale = "ja";
  } else if (country) {
    // 国が判定できた場合のみ英語に（ローカル開発時はヘッダーなし→日本語デフォルト）
    detectedLocale = "en";
  }

  response.cookies.set(COOKIE_NAME, detectedLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.webp|.*\\.svg|.*\\.ico|sitemap.xml|robots.txt).*)",
  ],
};
