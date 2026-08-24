import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getBriefing } from "@/lib/briefing";
import { getYoloDay } from "@/lib/calendar";
import { AREA_BY_ID } from "@/lib/data/areas";
import { morningEmailHtml, morningEmailText, morningSubject } from "@/lib/mail";
import { DESKS } from "@/lib/desks";
import { listSubscribers, subscribersForDesk } from "@/lib/subscribers";

export function localHour(timeZone: string, at = new Date()) {
  const hour = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone,
  }).format(at);
  const n = Number(hour);
  return n === 24 ? 0 : n;
}

export function desksDue(at = new Date(), forceAll = false) {
  return DESKS.filter((desk) => {
    if (forceAll) return true;
    const area = AREA_BY_ID[desk.areaId];
    return area ? localHour(area.timezone, at) === 5 : false;
  });
}

async function sendResend(to: string[], subject: string, html: string, text: string) {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return { sent: false as const, id: null as string | null, why: "missing RESEND_API_KEY" };
  const from = process.env.RESEND_FROM?.trim() || "Field Brief <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });
  const json = (await res.json()) as { id?: string; message?: string };
  if (!res.ok) throw new Error(json.message ?? `Resend ${res.status}`);
  return { sent: true as const, id: json.id ?? null, why: null as string | null };
}

async function writeOutbox(areaId: string, payload: unknown) {
  const dir = path.join(process.cwd(), "data", "outbox");
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${new Date().toISOString().replaceAll(":", "")}-${areaId}.json`);
  await writeFile(file, `${JSON.stringify(payload, null, 2)}\n`);
  return file;
}

export async function dispatchMorning(opts?: { forceAll?: boolean; desk?: string; at?: Date }) {
  const hourly = process.env.CRON_HOURLY === "1";
  const forceAll = opts?.forceAll ?? !hourly;
  const due = desksDue(opts?.at, forceAll).filter((d) => !opts?.desk || d.areaId === opts.desk);
  const subscribers = await listSubscribers();
  const results: Array<{
    areaId: string;
    subject: string;
    recipients: number;
    sent: boolean;
    outbox?: string;
    error?: string;
    why?: string;
  }> = [];

  for (const desk of due) {
    const area = AREA_BY_ID[desk.areaId];
    if (!area) continue;
    const recipients = subscribersForDesk(subscribers, desk.areaId);
    try {
      const [briefing, yolo] = await Promise.all([getBriefing(area.id), getYoloDay(area, "all")]);
      const subject = morningSubject(briefing);
      const html = morningEmailHtml(briefing, yolo);
      const text = morningEmailText(briefing, yolo);
      if (!recipients.length) {
        const outbox = await writeOutbox(desk.areaId, { subject, text, recipients: [] }).catch(() => undefined);
        results.push({
          areaId: desk.areaId,
          subject,
          recipients: 0,
          sent: false,
          outbox,
          why: "no address on the list",
        });
        continue;
      }
      const remote = await sendResend(recipients, subject, html, text);
      const outbox = remote.sent
        ? undefined
        : await writeOutbox(desk.areaId, { subject, text, recipients, html }).catch(() => undefined);
      results.push({
        areaId: desk.areaId,
        subject,
        recipients: recipients.length,
        sent: remote.sent,
        outbox,
        why: remote.why ?? undefined,
      });
    } catch (error) {
      results.push({
        areaId: desk.areaId,
        subject: desk.desk,
        recipients: recipients.length,
        sent: false,
        error: error instanceof Error ? error.message : "Dispatch failed",
      });
    }
  }

  return {
    at: (opts?.at ?? new Date()).toISOString(),
    mode: hourly && !forceAll ? "local-5am" : "all-desks",
    configured: {
      resend: Boolean(process.env.RESEND_API_KEY?.trim()),
      subscribers: Boolean(process.env.SUBSCRIBER_EMAILS?.trim()),
    },
    results,
  };
}
