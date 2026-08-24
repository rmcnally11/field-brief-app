import { NextRequest, NextResponse } from "next/server";
import { addSubscriber, parseDesks, validEmail } from "@/lib/subscribers";

export async function POST(request: NextRequest) {
  let body: { email?: string; desks?: unknown };
  try {
    body = (await request.json()) as { email?: string; desks?: unknown };
  } catch {
    return NextResponse.json({ error: "Send JSON." }, { status: 400 });
  }
  const email = body.email?.trim() ?? "";
  if (!validEmail(email)) {
    return NextResponse.json({ error: "That is not an email." }, { status: 400 });
  }
  try {
    const result = await addSubscriber(email, parseDesks(body.desks));
    return NextResponse.json({
      ok: true,
      desks: result.subscriber.desks,
      via: result.via,
      note: result.persisted
        ? "You are on the 5am list."
        : "Saved on this machine. Set RESEND_API_KEY and RESEND_AUDIENCE_ID, or SUBSCRIBER_EMAILS, so the list survives a deploy.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not subscribe." },
      { status: 500 },
    );
  }
}
