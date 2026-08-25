import { NextRequest, NextResponse } from "next/server";
import { airtableConfigured, listAirtableSubscribers, type ListSource } from "@/lib/airtable-list";
import { addSubscriber, parseDesks, validEmail, validName, validPostal } from "@/lib/subscribers";
import { sendWelcomeEmails } from "@/lib/samples";
import {
  COASTS_COOKIE,
  coastsCookieOptions,
  coastsForDesks,
  encodeCoasts,
  parseCadence,
} from "@/lib/coasts";

const SOURCES = new Set<ListSource>(["Brief", "Letter", "Morning", "Operator"]);

export async function GET() {
  if (!airtableConfigured()) {
    return NextResponse.json({ list: "unlinked", airtable: false, ok: false });
  }
  try {
    const rows = await listAirtableSubscribers();
    return NextResponse.json({
      list: "airtable",
      airtable: true,
      ok: true,
      count: rows.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        list: "airtable",
        airtable: true,
        ok: false,
        error: error instanceof Error ? error.message : "Airtable did not answer.",
      },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  let body: { email?: string; name?: string; zip?: string; desks?: unknown; cadence?: unknown; source?: string };
  try {
    body = (await request.json()) as {
      email?: string;
      name?: string;
      zip?: string;
      desks?: unknown;
      cadence?: unknown;
      source?: string;
    };
  } catch {
    return NextResponse.json({ error: "Send JSON." }, { status: 400 });
  }
  const name = body.name?.trim() ?? "";
  const zip = body.zip?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  if (!validName(name)) {
    return NextResponse.json({ error: "Leave the name you go by." }, { status: 400 });
  }
  if (!validEmail(email)) {
    return NextResponse.json({ error: "That is not an email." }, { status: 400 });
  }
  if (!validPostal(zip)) {
    return NextResponse.json({ error: "Leave a home ZIP or postal code." }, { status: 400 });
  }
  const desks = parseDesks(body.desks);
  if (!desks.length) {
    return NextResponse.json({ error: "Pick at least one piece of water." }, { status: 400 });
  }
  const cadence = parseCadence(body.cadence);
  const source = SOURCES.has(body.source as ListSource) ? (body.source as ListSource) : "Brief";
  try {
    const result = await addSubscriber(email, desks, source, cadence, { name, zip });
    const coasts = coastsForDesks(result.subscriber.desks);
    let welcome: Awaited<ReturnType<typeof sendWelcomeEmails>> | null = null;
    let welcomeError: string | null = null;
    try {
      welcome = await sendWelcomeEmails(result.subscriber.email, {
        desks: result.subscriber.desks,
        cadence: result.subscriber.cadence,
      });
    } catch (error) {
      welcomeError = error instanceof Error ? error.message : "Welcome mail did not send.";
    }
    const sentNow = welcome?.results.some((r) => r.sent) ?? false;
    const needsDomain = Boolean(welcomeError?.includes("verify a domain"));
    const note = sentNow
      ? `You're on the list for ${coasts.join(", ")}. Tonight’s water is on the way.`
      : needsDomain
        ? "You're on the Airtable list. Mail to anyone but the operator still needs a verified domain on Resend."
        : result.via === "local"
          ? "Saved on this machine only. Production still needs AIRTABLE_API_KEY on Vercel — see AIRTABLE.md."
          : `You're on the On This Water list for ${coasts.join(", ")}.`;
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
