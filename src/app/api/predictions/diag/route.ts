import { NextResponse } from "next/server";
import { getRedis } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 本番で Vercel 環境変数が正しく認識されているかを確認するための診断用。
// 値は返さず、検出された変数名と疎通状況のみ返す。
const CANDIDATE_VARS = [
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
  "KV_URL",
  "REDIS_URL",
];

export async function GET() {
  const detected: Record<string, boolean> = {};
  for (const name of CANDIDATE_VARS) {
    detected[name] = Boolean(process.env[name]);
  }

  const allUpstashLike = Object.keys(process.env)
    .filter((k) => /UPSTASH|KV|REDIS/i.test(k))
    .sort();

  const kv = getRedis();
  let ping: string | null = null;
  let pingError: string | null = null;
  if (kv) {
    try {
      ping = await kv.ping();
    } catch (err) {
      pingError = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json({
    clientCreated: Boolean(kv),
    detectedKnownVars: detected,
    allRelatedVarNames: allUpstashLike,
    ping,
    pingError,
  });
}
