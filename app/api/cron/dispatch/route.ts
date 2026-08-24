import { NextRequest, NextResponse } from "next/server";
import { runDispatch } from "@/lib/dispatch";

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return true;
  const auth = request.headers.get("authorization");
  const query = request.nextUrl.searchParams.get("secret");
  return auth === `Bearer ${secret}` || query === secret;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Cron is locked." }, { status: 401 });
  }
  const force = request.nextUrl.searchParams.get("force") === "1";
  const weekly = request.nextUrl.searchParams.get("weekly") === "1";
  const desk = request.nextUrl.searchParams.get("desk") ?? undefined;
  const result = await runDispatch({ forceAll: force || undefined, desk, weekly: weekly || undefined });
  return NextResponse.json(result);
}

export const POST = GET;
