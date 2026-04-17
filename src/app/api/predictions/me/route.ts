import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRedis } from "@/lib/kv";
import { COOKIE_NAME, getUserPredictions } from "@/lib/predictions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const kv = getRedis();
  const cookieStore = await cookies();
  const anonId = cookieStore.get(COOKIE_NAME)?.value;

  if (!kv || !anonId) {
    return NextResponse.json({
      picks: {},
      stats: { correct: 0, total: 0, streak: 0 },
    });
  }

  const data = await getUserPredictions(kv, anonId);
  return NextResponse.json(data);
}
