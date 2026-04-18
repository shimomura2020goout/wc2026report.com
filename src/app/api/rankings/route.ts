import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRedis } from "@/lib/kv";
import { COOKIE_NAME } from "@/lib/predictions";
import {
  getAroundMeRanking,
  getHitRateRanking,
  getTopRanking,
  RankingType,
} from "@/lib/profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID: RankingType[] = ["hits", "predictions", "visits"];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const section = url.searchParams.get("section") || "top";
  const typeParam = url.searchParams.get("type") || "hits";
  const limit = Math.min(Number(url.searchParams.get("limit") || 20), 100);

  const kv = getRedis();
  const cookieStore = await cookies();
  const anonId = cookieStore.get(COOKIE_NAME)?.value || null;

  if (!kv) {
    return NextResponse.json({ configured: false, entries: [] });
  }

  // 的中率ランキング（特殊）
  if (section === "hitrate" || typeParam === "hitrate") {
    const entries = await getHitRateRanking(kv, limit, 5, anonId);
    return NextResponse.json({ configured: true, type: "hitrate", entries });
  }

  if (!VALID.includes(typeParam as RankingType)) {
    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  }
  const type = typeParam as RankingType;

  // あなたの周り ±window 件
  if (section === "around") {
    if (!anonId) {
      return NextResponse.json({ configured: true, type, myRank: null, entries: [] });
    }
    const windowSize = Math.min(Number(url.searchParams.get("window") || 5), 20);
    const result = await getAroundMeRanking(kv, type, anonId, windowSize);
    if (!result) {
      return NextResponse.json({ configured: true, type, myRank: null, entries: [] });
    }
    return NextResponse.json({ configured: true, type, ...result });
  }

  // 通常の Top N
  const entries = await getTopRanking(kv, type, limit, anonId);
  return NextResponse.json({ configured: true, type, entries });
}
