import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRedis } from "@/lib/kv";
import { COOKIE_NAME, getUserPredictions } from "@/lib/predictions";
import { getNickname } from "@/lib/profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const kv = getRedis();
  const cookieStore = await cookies();
  const anonId = cookieStore.get(COOKIE_NAME)?.value || null;

  if (!kv || !anonId) {
    return NextResponse.json({
      anonId,
      nickname: null,
      stats: { correct: 0, total: 0, streak: 0, pickCount: 0, visits: 0 },
    });
  }

  const [nickname, predictions] = await Promise.all([
    getNickname(kv, anonId),
    getUserPredictions(kv, anonId),
  ]);

  return NextResponse.json({
    anonId,
    nickname,
    stats: predictions.stats,
  });
}
