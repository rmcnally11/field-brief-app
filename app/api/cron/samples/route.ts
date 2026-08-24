import { NextRequest, NextResponse } from "next/server";
import { buildSampleEmails, sendSampleEmails } from "@/lib/samples";
import { validEmail } from "@/lib/subscribers";

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
  const to = request.nextUrl.searchParams.get("to")?.trim() || process.env.SUBSCRIBER_EMAILS?.split(/[,;\s]+/)[0];
  const send = request.nextUrl.searchParams.get("send") === "1";
  const kind = request.nextUrl.searchParams.get("kind");
  const desk = request.nextUrl.searchParams.get("desk") ?? "galveston";
  try {
    if (send) {
      if (!to || !validEmail(to)) {
        return NextResponse.json({ error: "Need a to= address or SUBSCRIBER_EMAILS." }, { status: 400 });
      }
      const result = await sendSampleEmails(to, { areaId: desk });
      return NextResponse.json(result);
    }
    const samples = await buildSampleEmails({ areaId: desk });
    const picked = kind ? samples.filter((s) => s.kind === kind) : samples;
    if (request.nextUrl.searchParams.get("html") === "1" && picked[0]) {
      return new NextResponse(picked[0].html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
    return NextResponse.json({
      desk,
      samples: picked.map((s) => ({ kind: s.kind, subject: s.subject, bytes: s.html.length })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Samples failed." },
      { status: 500 },
    );
  }
}

export const POST = GET;
