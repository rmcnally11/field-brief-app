import { NextRequest, NextResponse } from "next/server";
import { dispatchMorning } from "@/lib/dispatch";

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
  const desk = request.nextUrl.searchParams.get("desk") ?? undefined;
  const result = await dispatchMorning({ forceAll: force || undefined, desk });
  return NextResponse.json(result);
}

export const POST = GET;
