import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getRedis } from "@/lib/kv";
import { getMatchStats, getManyMatchStats } from "@/lib/predictions";

export const runtime = "nodejs";

const CACHE_TTL = 60;

const getCachedSingle = (matchId: string) =>
  unstable_cache(
    async () => {
      const kv = getRedis();
      if (!kv) return null;
      return await getMatchStats(kv, matchId);
    },
    ["predictions:stats", matchId],
    { revalidate: CACHE_TTL, tags: ["predictions:stats", `predictions:match:${matchId}`] }
  );

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const single = url.searchParams.get("matchId");
  const multi = url.searchParams.get("matchIds");

  if (single) {
    const stats = await getCachedSingle(single)();
    if (stats === null) {
      return NextResponse.json({ configured: false }, { status: 200 });
    }
    return NextResponse.json({ configured: true, stats });
  }

  if (multi) {
    const ids = multi.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 200);
    const kv = getRedis();
    if (!kv) return NextResponse.json({ configured: false, stats: {} });
    const stats = await getManyMatchStats(kv, ids);
    return NextResponse.json({ configured: true, stats });
  }

  return NextResponse.json({ error: "specify matchId or matchIds" }, { status: 400 });
}
