import { NextRequest, NextResponse } from "next/server";
import type { ListSource } from "@/lib/airtable-list";
import { addSubscriber, parseDesks, validEmail } from "@/lib/subscribers";
import {
  COASTS_COOKIE,
  coastsCookieOptions,
  coastsForDesks,
  encodeCoasts,
  parseCadence,
} from "@/lib/coasts";

const SOURCES = new Set<ListSource>(["Brief", "Letter", "Morning", "Operator"]);

export async function POST(request: NextRequest) {
  let body: { email?: string; desks?: unknown; cadence?: unknown; source?: string };
  try {
    body = (await request.json()) as { email?: string; desks?: unknown; cadence?: unknown; source?: string };
  } catch {
    return NextResponse.json({ error: "Send JSON." }, { status: 400 });
  }
  const email = body.email?.trim() ?? "";
  if (!validEmail(email)) {
    return NextResponse.json({ error: "That is not an email." }, { status: 400 });
  }
  const desks = parseDesks(body.desks);
  if (!desks.length) {
    return NextResponse.json({ error: "Pick at least one coast." }, { status: 400 });
  }
  const cadence = parseCadence(body.cadence);
  const source = SOURCES.has(body.source as ListSource) ? (body.source as ListSource) : "Brief";
  try {
    const result = await addSubscriber(email, desks, source, cadence);
    const coasts = coastsForDesks(result.subscriber.desks);
    const note =
      result.via === "airtable"
        ? `You're on the Field Brief list for ${coasts.join(", ")}.`
        : result.via === "resend"
          ? "You're on the 5am list for the water you picked."
          : "Saved on this machine. Public signups need AIRTABLE_API_KEY on Vercel so they land in the Airtable table.";
    const res = NextResponse.json({
      ok: true,
      desks: result.subscriber.desks,
      cadence: result.subscriber.cadence,
      coasts,
      via: result.via,
      note,
    });
    res.cookies.set(COASTS_COOKIE, encodeCoasts(coasts), coastsCookieOptions());
    return res;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not subscribe." },
      { status: 500 },
    );
  }
}
