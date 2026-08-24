import { NextRequest, NextResponse } from "next/server";
import { getBriefing } from "@/lib/briefing";
import { denyIfClosed } from "@/lib/gate";

export async function GET(request: NextRequest) {
  const closed = denyIfClosed(request);
  if (closed) return closed;
  const area = request.nextUrl.searchParams.get("area");
  const activity = request.nextUrl.searchParams.get("activity");
  try {
    const briefing = await getBriefing(area, activity);
    return NextResponse.json(briefing);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Briefing failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
