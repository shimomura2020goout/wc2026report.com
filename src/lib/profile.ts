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

/** 自動生成されたニックネーム（プレフィックス付き）。ユーザが変更していないかの識別にも使う */
export const AUTO_NICKNAME_PREFIX = "ゲスト";

function randomHex(len: number): string {
  const chars = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function generateAutoNickname(): string {
  return `${AUTO_NICKNAME_PREFIX}${randomHex(6)}`;
}

export function isAutoNickname(name: string | null | undefined): boolean {
  if (!name) return false;
  return new RegExp(`^${AUTO_NICKNAME_PREFIX}[0-9a-f]{6}$`).test(name);
}

/**
 * nicknameが未設定なら自動生成して予約する。既存があればそれを返す。
 * setNickname を内部で呼ぶので ZSET 反映も行われる（初回時点では stats 0 のため ZADD はスキップ）。
 */
export async function ensureNickname(kv: Redis, anonId: string): Promise<string> {
  const existing = await getNickname(kv, anonId);
  if (existing) return existing;

  for (let i = 0; i < 5; i++) {
    const candidate = generateAutoNickname();
    const result = await setNickname(kv, anonId, candidate);
    if (result.ok && result.nickname) return result.nickname;
    // taken の場合は別候補で再試行
  }
  // 衝突が5回続くのは天文学的に稀。fallback に anonId の先頭を使う
  const fallback = `${AUTO_NICKNAME_PREFIX}${anonId.slice(0, 6)}`;
  await kv.set(keyAnonNickname(anonId), fallback, { ex: COOKIE_MAX_AGE });
  return fallback;
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

  // 初回ニックネーム設定 → 参加ユーザ数カウンタを増加
  if (!currentDisplay) {
    await kv.hincrby("global:stats", "totalUsers", 1);
  }

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
  // サイト全体の累計訪問数
  await kv.hincrby("global:stats", "totalVisits", 1);
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

export interface GlobalStats {
  totalUsers: number;
  totalPredictions: number;
  totalVisits: number;
}

export async function getGlobalStats(kv: Redis): Promise<GlobalStats> {
  const raw = (await kv.hgetall<Record<string, string | number>>("global:stats")) || {};
  const num = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);
  return {
    totalUsers: num(raw.totalUsers),
    totalPredictions: num(raw.totalPredictions),
    totalVisits: num(raw.totalVisits),
  };
}

/**
 * 自分の順位とその前後 window 件を返す。nickname が無い・ランク未登録時は null。
 */
export async function getAroundMeRanking(
  kv: Redis,
  type: RankingType,
  anonId: string,
  window: number = 5
): Promise<{ myRank: number; myScore: number; entries: RankingEntry[] } | null> {
  const rankIdx = await kv.zrevrank(`rank:${type}`, anonId);
  if (rankIdx === null || rankIdx === undefined) return null;

  const start = Math.max(0, rankIdx - window);
  const stop = rankIdx + window;
  const raw = (await kv.zrange(`rank:${type}`, start, stop, {
    rev: true,
    withScores: true,
  })) as (string | number)[];

  const entries: RankingEntry[] = [];
  for (let i = 0; i < raw.length; i += 2) {
    const entryAnonId = String(raw[i]);
    const score = Number(raw[i + 1]);
    const nick = await kv.get<string>(keyAnonNickname(entryAnonId));
    if (!nick) continue;
    entries.push({
      rank: start + Math.floor(i / 2) + 1,
      nickname: nick,
      score,
      isSelf: entryAnonId === anonId,
    });
  }

  const myScore = Number(await kv.zscore(`rank:${type}`, anonId)) || 0;
  return {
    myRank: rankIdx + 1,
    myScore,
    entries,
  };
}

export interface HitRateEntry {
  rank: number;
  nickname: string;
  correct: number;
  total: number;
  ratio: number;
  isSelf: boolean;
}

/**
 * 的中率ランキング（最低 minPredictions 件以上の予想が条件）。
 * rank:predictions 上位 scanSize 人から抽出して ratio 降順。
 */
export async function getHitRateRanking(
  kv: Redis,
  limit: number,
  minPredictions: number = 5,
  selfAnonId: string | null = null
): Promise<HitRateEntry[]> {
  const scanSize = 150;
  const raw = (await kv.zrange("rank:predictions", 0, scanSize - 1, {
    rev: true,
    withScores: true,
  })) as (string | number)[];

  const candidates: { anonId: string; nickname: string; correct: number; total: number }[] = [];
  for (let i = 0; i < raw.length; i += 2) {
    const aid = String(raw[i]);
    const nick = await kv.get<string>(keyAnonNickname(aid));
    if (!nick) continue;
    const stats = await kv.hgetall<Record<string, string | number>>(keyAnonStats(aid));
    const correct = Number(stats?.correct) || 0;
    const total = Number(stats?.total) || 0;
    if (total < minPredictions) continue;
    candidates.push({ anonId: aid, nickname: nick, correct, total });
  }

  candidates.sort((a, b) => {
    const ra = a.correct / a.total;
    const rb = b.correct / b.total;
    if (rb !== ra) return rb - ra;
    // tie-break: より多く予想した人を上位
    return b.total - a.total;
  });

  return candidates.slice(0, limit).map((c, i) => ({
    rank: i + 1,
    nickname: c.nickname,
    correct: c.correct,
    total: c.total,
    ratio: Math.round((c.correct / c.total) * 100),
    isSelf: c.anonId === selfAnonId,
  }));
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
