import { Redis } from "@upstash/redis";
import { allWorldCupMatches, Match } from "@/data/matches";

export type Pick = "home" | "draw" | "away";

export interface MatchVoteStats {
  home: number;
  draw: number;
  away: number;
  total: number;
}

export interface UserPredictions {
  picks: Record<string, Pick>;
  stats: { correct: number; total: number; streak: number };
}

export const COOKIE_NAME = "wcup_anon";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 400; // 400 days

export function isValidPick(v: unknown): v is Pick {
  return v === "home" || v === "draw" || v === "away";
}

export function matchExists(matchId: string): Match | undefined {
  return allWorldCupMatches.find((m) => m.id === matchId);
}

function keyMatchVotes(matchId: string) {
  return `match:${matchId}:votes`;
}
function keyMatchLocked(matchId: string) {
  return `match:${matchId}:locked`;
}
function keyMatchPickers(matchId: string, pick: Pick) {
  return `match:${matchId}:pickers:${pick}`;
}
function keyAnonPicks(anonId: string) {
  return `anon:${anonId}:picks`;
}
function keyAnonStats(anonId: string) {
  return `anon:${anonId}:stats`;
}
function keyAnonScored(anonId: string) {
  return `anon:${anonId}:scored`;
}

export async function isMatchLocked(kv: Redis, matchId: string): Promise<boolean> {
  const v = await kv.get<string>(keyMatchLocked(matchId));
  return v === "1";
}

export async function getExistingPick(
  kv: Redis,
  anonId: string,
  matchId: string
): Promise<Pick | null> {
  const v = await kv.hget<string>(keyAnonPicks(anonId), matchId);
  return isValidPick(v) ? (v as Pick) : null;
}

export async function recordPick(
  kv: Redis,
  anonId: string,
  matchId: string,
  pick: Pick
): Promise<{ ok: boolean; reason?: "locked" | "already_voted"; stats?: MatchVoteStats }> {
  if (await isMatchLocked(kv, matchId)) {
    return { ok: false, reason: "locked" };
  }
  // Try to set only if absent (HSETNX)
  const set = await kv.hsetnx(keyAnonPicks(anonId), matchId, pick);
  if (!set) {
    return { ok: false, reason: "already_voted" };
  }
  await kv.expire(keyAnonPicks(anonId), COOKIE_MAX_AGE);
  // Increment counters
  await Promise.all([
    kv.hincrby(keyMatchVotes(matchId), pick, 1),
    kv.hincrby(keyMatchVotes(matchId), "total", 1),
    kv.sadd(keyMatchPickers(matchId, pick), anonId),
  ]);
  const stats = await getMatchStats(kv, matchId);
  return { ok: true, stats };
}

export async function getMatchStats(kv: Redis, matchId: string): Promise<MatchVoteStats> {
  const raw = (await kv.hgetall<Record<string, string | number>>(keyMatchVotes(matchId))) || {};
  const num = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);
  return {
    home: num(raw.home),
    draw: num(raw.draw),
    away: num(raw.away),
    total: num(raw.total),
  };
}

export async function getManyMatchStats(
  kv: Redis,
  matchIds: string[]
): Promise<Record<string, MatchVoteStats>> {
  if (matchIds.length === 0) return {};
  const results = await Promise.all(matchIds.map((id) => getMatchStats(kv, id)));
  const out: Record<string, MatchVoteStats> = {};
  matchIds.forEach((id, idx) => {
    out[id] = results[idx];
  });
  return out;
}

export async function getUserPredictions(
  kv: Redis,
  anonId: string
): Promise<UserPredictions> {
  const [picksRaw, statsRaw] = await Promise.all([
    kv.hgetall<Record<string, string>>(keyAnonPicks(anonId)),
    kv.hgetall<Record<string, string | number>>(keyAnonStats(anonId)),
  ]);
  const picks: Record<string, Pick> = {};
  if (picksRaw) {
    for (const [matchId, v] of Object.entries(picksRaw)) {
      if (isValidPick(v)) picks[matchId] = v;
    }
  }
  const num = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);
  return {
    picks,
    stats: {
      correct: num(statsRaw?.correct),
      total: num(statsRaw?.total),
      streak: num(statsRaw?.streak),
    },
  };
}

export function determineWinner(match: Match): Pick | null {
  if (match.status !== "finished") return null;
  if (match.homeScore == null || match.awayScore == null) return null;
  if (match.homeScore > match.awayScore) return "home";
  if (match.homeScore < match.awayScore) return "away";
  return "draw";
}

export async function lockKickedOffMatches(kv: Redis, now: Date = new Date()): Promise<string[]> {
  const locked: string[] = [];
  for (const m of allWorldCupMatches) {
    if (m.kickoff === "未定") continue;
    const kickoffIso = `${m.date}T${m.kickoff}:00+09:00`;
    const kickoffTime = new Date(kickoffIso).getTime();
    if (isNaN(kickoffTime)) continue;
    if (kickoffTime > now.getTime()) continue;
    const key = keyMatchLocked(m.id);
    const already = await kv.get<string>(key);
    if (already === "1") continue;
    await kv.set(key, "1");
    locked.push(m.id);
  }
  return locked;
}

export async function reconcileFinishedMatches(kv: Redis): Promise<number> {
  let totalUpdated = 0;
  for (const m of allWorldCupMatches) {
    const winner = determineWinner(m);
    if (!winner) continue;
    // Gather unique pickers across all 3 picks
    const [homeSet, drawSet, awaySet] = await Promise.all([
      kv.smembers(keyMatchPickers(m.id, "home")),
      kv.smembers(keyMatchPickers(m.id, "draw")),
      kv.smembers(keyMatchPickers(m.id, "away")),
    ]);
    const allPickers = new Set<string>([...homeSet, ...drawSet, ...awaySet]);
    for (const anonId of allPickers) {
      const scored = await kv.sismember(keyAnonScored(anonId), m.id);
      if (scored) continue;
      const userPick = await getExistingPick(kv, anonId, m.id);
      if (!userPick) continue;
      await kv.hincrby(keyAnonStats(anonId), "total", 1);
      if (userPick === winner) {
        await kv.hincrby(keyAnonStats(anonId), "correct", 1);
      }
      await kv.sadd(keyAnonScored(anonId), m.id);
      await kv.expire(keyAnonStats(anonId), COOKIE_MAX_AGE);
      await kv.expire(keyAnonScored(anonId), COOKIE_MAX_AGE);
      totalUpdated++;
    }
  }
  return totalUpdated;
}
