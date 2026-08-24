import { NextRequest, NextResponse } from "next/server";
import type { ListSource } from "@/lib/airtable-list";
import { addSubscriber, parseDesks, validEmail } from "@/lib/subscribers";

const SOURCES = new Set<ListSource>(["Brief", "Letter", "Morning", "Operator"]);

export async function POST(request: NextRequest) {
  let body: { email?: string; desks?: unknown; source?: string };
  try {
    body = (await request.json()) as { email?: string; desks?: unknown; source?: string };
  } catch {
    return NextResponse.json({ error: "Send JSON." }, { status: 400 });
  }
  const email = body.email?.trim() ?? "";
  if (!validEmail(email)) {
    return NextResponse.json({ error: "That is not an email." }, { status: 400 });
  }
  const source = SOURCES.has(body.source as ListSource) ? (body.source as ListSource) : "Brief";
  try {
    const result = await addSubscriber(email, parseDesks(body.desks), source);
    const note =
      result.via === "airtable"
        ? "You're on the Field Brief list."
        : result.via === "resend"
          ? "You're on the 5am list."
          : "Saved on this machine. Public signups need AIRTABLE_API_KEY on Vercel so they land in the Airtable table.";
    return NextResponse.json({
      ok: true,
      desks: result.subscriber.desks,
      via: result.via,
      note,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not subscribe." },
      { status: 500 },
    );
  }
}
