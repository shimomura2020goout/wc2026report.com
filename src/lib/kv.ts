import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

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
