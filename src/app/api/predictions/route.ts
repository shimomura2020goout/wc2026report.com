import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { getRedis } from "@/lib/kv";
import {
  COOKIE_NAME,
  COOKIE_MAX_AGE,
  Pick,
  isValidPick,
  matchExists,
  recordPick,
} from "@/lib/predictions";
import { ensureNickname } from "@/lib/profile";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const kv = getRedis();
  if (!kv) {
    return NextResponse.json({ error: "predictions not configured" }, { status: 503 });
  }

  let body: { matchId?: unknown; pick?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const matchId = typeof body.matchId === "string" ? body.matchId : "";
  const pick = body.pick as Pick | undefined;

  if (!matchId || !isValidPick(pick)) {
    return NextResponse.json({ error: "invalid matchId or pick" }, { status: 400 });
  }
  if (!matchExists(matchId)) {
    return NextResponse.json({ error: "unknown matchId" }, { status: 404 });
  }

  const cookieStore = await cookies();
  let anonId = cookieStore.get(COOKIE_NAME)?.value;
  let issuedCookie = false;
  if (!anonId) {
    anonId = crypto.randomUUID();
    issuedCookie = true;
  }

  // 投票時にニックネーム未設定なら自動割当（ランキング対象化）
  await ensureNickname(kv, anonId);
  const result = await recordPick(kv, anonId, matchId, pick);

  const buildResponse = (payload: unknown, status = 200) => {
    const res = NextResponse.json(payload, { status });
    if (issuedCookie && anonId) {
      res.cookies.set({
        name: COOKIE_NAME,
        value: anonId,
        maxAge: COOKIE_MAX_AGE,
        httpOnly: false,
        sameSite: "lax",
        path: "/",
      });
    }
    return res;
  };

  if (!result.ok) {
    const status = result.reason === "locked" ? 423 : 409;
    return buildResponse({ error: result.reason }, status);
  }

  revalidateTag(`predictions:match:${matchId}`, { expire: 0 });
  revalidateTag("predictions:stats", { expire: 0 });

  return buildResponse({ ok: true, matchId, pick, stats: result.stats });
}
