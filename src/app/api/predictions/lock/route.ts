import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/kv";
import { lockKickedOffMatches, reconcileFinishedMatches } from "@/lib/predictions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET || "";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const kv = getRedis();
  if (!kv) {
    return NextResponse.json({ error: "kv not configured" }, { status: 503 });
  }

  const lockedIds = await lockKickedOffMatches(kv);
  const updatedCount = await reconcileFinishedMatches(kv);

  return NextResponse.json({
    ok: true,
    locked: lockedIds.length,
    lockedIds,
    reconciledUpdates: updatedCount,
  });
}
