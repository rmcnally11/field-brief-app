import { NextRequest, NextResponse } from "next/server";
import { getArea } from "@/lib/data/areas";
import { parseActivity } from "@/lib/briefing";
import { buildCalendar } from "@/lib/calendar";

export async function GET(request: NextRequest) {
  const area = getArea(request.nextUrl.searchParams.get("area"));
  const activity = parseActivity(request.nextUrl.searchParams.get("activity"));
  const now = new Date();
  const monthParam = request.nextUrl.searchParams.get("month");
  let year = now.getUTCFullYear();
  let month = now.getUTCMonth() + 1;
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    year = Number(monthParam.slice(0, 4));
    month = Number(monthParam.slice(5, 7));
  }
  try {
    const days = await buildCalendar(area, year, month, activity);
    return NextResponse.json({
      area,
      activity,
      year,
      month,
      days,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Calendar failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
