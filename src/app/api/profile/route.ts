import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRedis } from "@/lib/kv";
import { COOKIE_NAME, COOKIE_MAX_AGE, getUserPredictions } from "@/lib/predictions";
import { ensureNickname, isAutoNickname } from "@/lib/profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const kv = getRedis();
  const cookieStore = await cookies();
  let anonId = cookieStore.get(COOKIE_NAME)?.value;
  let issuedCookie = false;
  if (!anonId) {
    anonId = crypto.randomUUID();
    issuedCookie = true;
  }

  if (!kv) {
    const res = NextResponse.json({
      anonId,
      nickname: null,
      auto: false,
      stats: { correct: 0, total: 0, streak: 0, pickCount: 0, visits: 0 },
    });
    if (issuedCookie && anonId) {
      res.cookies.set({
        name: COOKIE_NAME,
        value: anonId,
        maxAge: COOKIE_MAX_AGE,
        httpOnly: false,
        sameSite: "lax",
        path: "/",
      });
    }
    return res;
  }

  const [nickname, predictions] = await Promise.all([
    ensureNickname(kv, anonId),
    getUserPredictions(kv, anonId),
  ]);

  const res = NextResponse.json({
    anonId,
    nickname,
    auto: isAutoNickname(nickname),
    stats: predictions.stats,
  });
  if (issuedCookie && anonId) {
    res.cookies.set({
      name: COOKIE_NAME,
      value: anonId,
      maxAge: COOKIE_MAX_AGE,
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    });
  }
  return res;
}
