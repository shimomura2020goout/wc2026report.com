import { Redis } from "@upstash/redis";
import { COOKIE_MAX_AGE } from "@/lib/predictions";

export type RankingType = "hits" | "predictions" | "visits";

export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 20;

// 予約語・運営が占有したい名前
const RESERVED_WORDS = new Set([
  "admin", "administrator", "root", "system", "official", "staff",
  "moderator", "mod", "support", "wcup", "wcup2026", "bot", "null",
  "undefined", "anonymous", "guest",
]);

// 最低限の禁止ワード（必要に応じて拡張）
const BANNED_SUBSTRINGS = [
  "fuck", "shit", "asshole", "bitch",
  "死ね", "殺す", "クソ",
];

export function normalizeNickname(raw: string): string {
  return raw.normalize("NFKC").trim().toLowerCase();
}

export interface ValidationResult {
  ok: boolean;
  reason?: string;
}

export function validateNickname(raw: string): ValidationResult {
  const trimmed = raw.normalize("NFKC").trim();
  if (trimmed.length < NICKNAME_MIN) {
    return { ok: false, reason: `${NICKNAME_MIN}文字以上にしてください` };
  }
  if ([...trimmed].length > NICKNAME_MAX) {
    return { ok: false, reason: `${NICKNAME_MAX}文字以内にしてください` };
  }
  // 使用可能: 英数字 / 日本語 / アンダースコア / ハイフン
  if (!/^[\p{L}\p{N}_\-ぁ-んァ-ヶー一-龠々]+$/u.test(trimmed)) {
    return { ok: false, reason: "使用できない文字が含まれています（英数字/日本語/_/-のみ可）" };
  }
  const normalized = trimmed.toLowerCase();
  if (RESERVED_WORDS.has(normalized)) {
    return { ok: false, reason: "このニックネームは使用できません" };
  }
  for (const banned of BANNED_SUBSTRINGS) {
    if (normalized.includes(banned)) {
      return { ok: false, reason: "不適切な語が含まれています" };
    }
  }
  return { ok: true };
}

function keyAnonNickname(anonId: string) {
  return `anon:${anonId}:nickname`;
}
function keyNicknameClaim(normalized: string) {
  return `nickname:${normalized}`;
}
function keyAnonStats(anonId: string) {
  return `anon:${anonId}:stats`;
}
function keyAnonVisitLastAt(anonId: string) {
  return `anon:${anonId}:visitLastAt`;
}
function keyRank(type: RankingType) {
  return `rank:${type}`;
}

export async function getNickname(kv: Redis, anonId: string): Promise<string | null> {
  return (await kv.get<string>(keyAnonNickname(anonId))) || null;
}

export interface SetNicknameResult {
  ok: boolean;
  reason?: "invalid" | "taken" | "internal";
  message?: string;
  nickname?: string;
}

export async function setNickname(
  kv: Redis,
  anonId: string,
  raw: string
): Promise<SetNicknameResult> {
  const v = validateNickname(raw);
  if (!v.ok) return { ok: false, reason: "invalid", message: v.reason };

  const display = raw.normalize("NFKC").trim();
  const normalized = normalizeNickname(raw);

  const currentDisplay = await getNickname(kv, anonId);
  const currentNormalized = currentDisplay ? normalizeNickname(currentDisplay) : null;

  // 同じ名前（正規化一致）なら display だけ差し替え
  if (currentNormalized === normalized) {
    await kv.set(keyAnonNickname(anonId), display, { ex: COOKIE_MAX_AGE });
    return { ok: true, nickname: display };
  }

  // 新しい名前を atomic に予約
  const claimed = await kv.set(keyNicknameClaim(normalized), anonId, {
    nx: true,
    ex: COOKIE_MAX_AGE,
  });
  if (claimed !== "OK") {
    // 既に他ユーザが占有
    const owner = await kv.get<string>(keyNicknameClaim(normalized));
    if (owner !== anonId) {
      return { ok: false, reason: "taken", message: "このニックネームは既に使われています" };
    }
  }

  // 旧名があれば予約解除
  if (currentNormalized) {
    const oldOwner = await kv.get<string>(keyNicknameClaim(currentNormalized));
    if (oldOwner === anonId) {
      await kv.del(keyNicknameClaim(currentNormalized));
    }
  }

  await kv.set(keyAnonNickname(anonId), display, { ex: COOKIE_MAX_AGE });

  // 既存 stats を rank ZSET に同期（nickname 設定済みユーザのみランキング対象）
  const stats = await kv.hgetall<Record<string, string | number>>(keyAnonStats(anonId));
  if (stats) {
    const correct = Number(stats.correct) || 0;
    const pickCount = Number(stats.pickCount) || 0;
    const visits = Number(stats.visits) || 0;
    await Promise.all([
      correct > 0 ? kv.zadd(keyRank("hits"), { score: correct, member: anonId }) : null,
      pickCount > 0 ? kv.zadd(keyRank("predictions"), { score: pickCount, member: anonId }) : null,
      visits > 0 ? kv.zadd(keyRank("visits"), { score: visits, member: anonId }) : null,
    ]);
  }

  return { ok: true, nickname: display };
}

/** 訪問ビーコン。6時間以内の連続訪問はカウントしない */
const VISIT_DEBOUNCE_SECONDS = 60 * 60 * 6;

export async function recordVisit(
  kv: Redis,
  anonId: string,
  nowSec: number = Math.floor(Date.now() / 1000)
): Promise<{ incremented: boolean; visits: number }> {
  const last = Number(await kv.get<number>(keyAnonVisitLastAt(anonId))) || 0;
  if (nowSec - last < VISIT_DEBOUNCE_SECONDS) {
    const cur = Number((await kv.hget(keyAnonStats(anonId), "visits")) ?? 0);
    return { incremented: false, visits: cur };
  }
  const next = await kv.hincrby(keyAnonStats(anonId), "visits", 1);
  await kv.set(keyAnonVisitLastAt(anonId), nowSec, { ex: COOKIE_MAX_AGE });
  await kv.expire(keyAnonStats(anonId), COOKIE_MAX_AGE);
  // nickname があればランキングに反映
  const nick = await getNickname(kv, anonId);
  if (nick) {
    await kv.zadd(keyRank("visits"), { score: next, member: anonId });
  }
  return { incremented: true, visits: next };
}

export interface RankingEntry {
  rank: number;
  nickname: string;
  score: number;
  isSelf: boolean;
}

export async function getTopRanking(
  kv: Redis,
  type: RankingType,
  limit: number,
  selfAnonId: string | null = null
): Promise<RankingEntry[]> {
  // nickname を持つユーザだけを対象にしたいので、余裕を持って多めに取得してフィルタ
  const scanSize = Math.max(limit * 3, 60);
  const raw = (await kv.zrange(keyRank(type), 0, scanSize - 1, {
    rev: true,
    withScores: true,
  })) as (string | number)[];

  const pairs: { anonId: string; score: number }[] = [];
  for (let i = 0; i < raw.length; i += 2) {
    pairs.push({ anonId: String(raw[i]), score: Number(raw[i + 1]) });
  }

  const entries: RankingEntry[] = [];
  let rank = 0;
  for (const { anonId, score } of pairs) {
    if (entries.length >= limit) break;
    const nick = await kv.get<string>(keyAnonNickname(anonId));
    if (!nick) continue;
    rank++;
    entries.push({
      rank,
      nickname: nick,
      score,
      isSelf: anonId === selfAnonId,
    });
  }
  return entries;
}
