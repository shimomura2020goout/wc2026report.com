import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getRedis } from "@/lib/kv";
import { getGlobalStats } from "@/lib/profile";

export const runtime = "nodejs";

const getCachedGlobal = unstable_cache(
  async () => {
    const kv = getRedis();
    if (!kv) return null;
    return await getGlobalStats(kv);
  },
  ["rankings:global"],
  { revalidate: 60, tags: ["rankings:global"] }
);

export async function GET() {
  const stats = await getCachedGlobal();
  if (!stats) {
    return NextResponse.json({ configured: false, stats: null });
  }
  return NextResponse.json({ configured: true, stats });
}
