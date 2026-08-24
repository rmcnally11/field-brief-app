import { NextRequest, NextResponse } from "next/server";
import type { ListSource } from "@/lib/airtable-list";
import { addSubscriber, parseDesks, validEmail } from "@/lib/subscribers";
import { sendWelcomeEmails } from "@/lib/samples";
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
    let welcome: Awaited<ReturnType<typeof sendWelcomeEmails>> | null = null;
    try {
      welcome = await sendWelcomeEmails(result.subscriber.email, {
        desks: result.subscriber.desks,
        cadence: result.subscriber.cadence,
      });
    } catch {
      welcome = null;
    }
    const sentNow = welcome?.results.some((r) => r.sent) ?? false;
    const note =
      result.via === "local" && !sentNow
        ? "Saved on this machine only. The operator still needs the list wired for tomorrow’s 5am."
        : sentNow
          ? `You're on the list for ${coasts.join(", ")}. Tonight’s water is on the way.`
          : `You're on the Field Brief list for ${coasts.join(", ")}.`;
    const res = NextResponse.json({
      ok: true,
      desks: result.subscriber.desks,
      cadence: result.subscriber.cadence,
      coasts,
      via: result.via,
      sentNow,
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
