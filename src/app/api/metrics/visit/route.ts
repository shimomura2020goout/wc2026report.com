import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRedis } from "@/lib/kv";
import { COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/predictions";
import { recordVisit } from "@/lib/profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const kv = getRedis();
  if (!kv) {
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 200 });
  }

  const cookieStore = await cookies();
  let anonId = cookieStore.get(COOKIE_NAME)?.value;
  let issuedCookie = false;
  if (!anonId) {
    anonId = crypto.randomUUID();
    issuedCookie = true;
  }

  const result = await recordVisit(kv, anonId);

  const res = NextResponse.json({ ok: true, ...result });
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
}
