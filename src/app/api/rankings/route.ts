import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRedis } from "@/lib/kv";
import { COOKIE_NAME } from "@/lib/predictions";
import { getTopRanking, RankingType } from "@/lib/profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID: RankingType[] = ["hits", "predictions", "visits"];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const type = (url.searchParams.get("type") || "hits") as RankingType;
  if (!VALID.includes(type)) {
    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  }
  const limit = Math.min(Number(url.searchParams.get("limit") || 20), 100);

  const kv = getRedis();
  if (!kv) {
    return NextResponse.json({ configured: false, entries: [] });
  }

  const cookieStore = await cookies();
  const anonId = cookieStore.get(COOKIE_NAME)?.value || null;

  const entries = await getTopRanking(kv, type, limit, anonId);
  return NextResponse.json({ configured: true, type, entries });
}
