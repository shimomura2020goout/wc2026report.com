import { NextResponse } from "next/server";
import { getRedis } from "@/lib/kv";
import { getActiveVisitors24h } from "@/lib/profile";

export const runtime = "nodejs";
export const revalidate = 60; // 60秒キャッシュ

export async function GET() {
  const kv = getRedis();
  if (!kv) {
    return NextResponse.json({ count: 0 }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  }
  const count = await getActiveVisitors24h(kv);
  return NextResponse.json({ count }, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
