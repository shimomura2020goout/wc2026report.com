import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRedis } from "@/lib/kv";
import { COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/predictions";
import { setNickname } from "@/lib/profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const kv = getRedis();
  if (!kv) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  let body: { nickname?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const raw = typeof body.nickname === "string" ? body.nickname : "";
  if (!raw) {
    return NextResponse.json({ error: "nickname required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  let anonId = cookieStore.get(COOKIE_NAME)?.value;
  let issuedCookie = false;
  if (!anonId) {
    anonId = crypto.randomUUID();
    issuedCookie = true;
  }

  const result = await setNickname(kv, anonId, raw);

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
    const status = result.reason === "taken" ? 409 : 400;
    return buildResponse(
      { error: result.reason, message: result.message },
      status
    );
  }
  return buildResponse({ ok: true, nickname: result.nickname });
}
