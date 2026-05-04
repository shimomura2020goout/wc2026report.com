import { NextRequest, NextResponse } from "next/server";

// /[locale]/ パス分割対応の middleware
// 1) URL に locale プリフィックスがあれば、x-locale ヘッダーを request に付与してそのまま通す
// 2) URL に locale プリフィックスが無ければ、IP/Cookie/?lang= で判定して /{locale}{path} に 308 リダイレクト
// 3) Bot UA は IP に依存せず /en に統一（クローラーは US IP からアクセスするため、IP 判定だと
//    全部 en に倒れて /ja /ko がインデックスされなくなる事故を避ける）

const SUPPORTED_LOCALES = ["ja", "ko", "en"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
const COOKIE_NAME = "locale";
const LOCALE_HEADER = "x-locale";
const DEFAULT_LOCALE: SupportedLocale = "ja";
const BOT_DEFAULT_LOCALE: SupportedLocale = "en";

const BOT_UA_REGEX =
  /bot|crawler|spider|crawling|googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot|embedly|quora|outbrain|pinterest|whatsapp|telegrambot|applebot/i;

function isLocale(value: string | undefined | null): value is SupportedLocale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

function detectLocale(request: NextRequest): SupportedLocale {
  // 1. クエリ ?lang=
  const langParam = request.nextUrl.searchParams.get("lang");
  if (isLocale(langParam)) return langParam;

  // 2. Bot は IP 判定をスキップ（クローラビリティ確保）
  const ua = request.headers.get("user-agent") ?? "";
  if (BOT_UA_REGEX.test(ua)) return BOT_DEFAULT_LOCALE;

  // 3. 既存 cookie
  const cookieLocale = request.cookies.get(COOKIE_NAME)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  // 4. Vercel IP判定
  const country = request.headers.get("x-vercel-ip-country") ?? "";
  if (country === "KR") return "ko";
  if (country === "JP") return "ja";
  if (country) return "en";

  // 5. ローカル開発・国不明
  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1) /{locale}/... or /{locale} にすでにマッチしている場合はパススルー
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  if (isLocale(firstSegment)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(LOCALE_HEADER, firstSegment);
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    // Cookie を URL に追従させる（バレパス /foo へのフォールバック動作で言語維持）
    if (request.cookies.get(COOKIE_NAME)?.value !== firstSegment) {
      response.cookies.set(COOKIE_NAME, firstSegment, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
    return response;
  }

  // 2) ロケールプリフィックスなし → 308 リダイレクト
  const detected = detectLocale(request);
  const redirectUrl = new URL(`/${detected}${pathname}`, request.url);
  redirectUrl.search = search;
  const response = NextResponse.redirect(redirectUrl, 308);
  response.cookies.set(COOKIE_NAME, detected, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  // 動的判定結果のためキャッシュさせない
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: [
    // 静的アセット・API・フォント・画像はリダイレクトしない
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.webp|.*\\.svg|.*\\.ico|.*\\.json|.*\\.txt|.*\\.woff2?|.*\\.ttf|.*\\.otf|.*\\.css|.*\\.js|.*\\.map|sitemap.xml|robots.txt|fonts/.*).*)",
  ],
};
