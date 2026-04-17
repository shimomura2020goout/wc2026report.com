import { Redis } from "@upstash/redis";

// Vercel Marketplace (Upstash 連携) は `KV_REST_API_URL` / `KV_REST_API_TOKEN` で
// 環境変数を自動追加する一方、Upstash を直接連携すると `UPSTASH_REDIS_REST_URL` /
// `UPSTASH_REDIS_REST_TOKEN` になる。どちらの命名でも動くようにフォールバック。
const url =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL ||
  "";
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN ||
  "";

let client: Redis | null = null;

export function getRedis(): Redis | null {
  if (client) return client;
  if (!url || !token) return null;
  client = new Redis({ url, token });
  return client;
}

export function isKvConfigured(): boolean {
  return Boolean(url && token);
}
