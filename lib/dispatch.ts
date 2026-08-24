import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getBriefing } from "@/lib/briefing";
import { getYoloDay } from "@/lib/calendar";
import { AREAS } from "@/lib/data/areas";
import {
  buildSeasonIssue,
  calendarEmailHtml,
  calendarEmailText,
  calendarSubject,
  letterEmailHtml,
  letterEmailText,
  letterSubject,
  morningEmailHtml,
  morningEmailText,
  morningSubject,
  seasonalEmailHtml,
  seasonalEmailText,
  seasonalSubject,
} from "@/lib/mail";
import { listSubscribers, subscribersForDesk } from "@/lib/subscribers";
import { coastsForDesks } from "@/lib/coasts";
import { filterNewsletter, getNewsletter } from "@/lib/newsletter";
import { sendResend } from "@/lib/send";
import { buildCalendarRange } from "@/lib/calendar";
import { clockParts } from "@/lib/time";

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
  return AREAS.filter((area) => (forceAll ? true : localHour(area.timezone, at) === 5));
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
  const due = desksDue(opts?.at, forceAll).filter((d) => !opts?.desk || d.id === opts.desk);
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

  for (const area of due) {
    const recipients = subscribersForDesk(subscribers, area.id, "daily");
    try {
      const [briefing, yolo] = await Promise.all([getBriefing(area.id), getYoloDay(area, "all")]);
      const subject = morningSubject(briefing);
      const html = morningEmailHtml(briefing, yolo);
      const text = morningEmailText(briefing, yolo);
      if (!recipients.length) {
        const outbox = await writeOutbox(area.id, { subject, text, recipients: [] }).catch(() => undefined);
        results.push({
          areaId: area.id,
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
        : await writeOutbox(area.id, { subject, text, recipients, html }).catch(() => undefined);
      results.push({
        areaId: area.id,
        subject,
        recipients: recipients.length,
        sent: remote.sent,
        outbox,
        why: remote.why ?? undefined,
      });
    } catch (error) {
      results.push({
        areaId: area.id,
        subject: area.shortName,
        recipients: recipients.length,
        sent: false,
        error: error instanceof Error ? error.message : "Dispatch failed",
      });
    }
  }

  return {
    at: (opts?.at ?? new Date()).toISOString(),
    mode: hourly && !forceAll ? "local-5am" : "all-water",
    configured: {
      airtable: Boolean(process.env.AIRTABLE_API_KEY?.trim() || process.env.AIRTABLE_TOKEN?.trim()),
      resend: Boolean(process.env.RESEND_API_KEY?.trim()),
      subscribers: Boolean(process.env.SUBSCRIBER_EMAILS?.trim()),
    },
    results,
  };
}

export function chicagoParts(at = new Date()) {
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "America/Chicago" }).format(at);
  const day = Number(new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "America/Chicago" }).format(at));
  return { weekday, day };
}

export function isChicagoSaturday(at = new Date()) {
  return chicagoParts(at).weekday === "Sat";
}

export function isChicagoSunday(at = new Date()) {
  return chicagoParts(at).weekday === "Sun";
}

export function isChicagoMonthStart(at = new Date()) {
  return chicagoParts(at).day === 1;
}

export async function dispatchWeekly(opts?: { force?: boolean; at?: Date }) {
  const at = opts?.at ?? new Date();
  if (!opts?.force && !isChicagoSaturday(at)) {
    return { skipped: true as const, reason: "not Saturday in Chicago", results: [] as const };
  }
  const subscribers = await listSubscribers();
  const weekly = subscribers.filter((s) => s.cadence.includes("weekly") && s.desks.length);
  if (!weekly.length) {
    return { skipped: false as const, reason: "no weekly addresses", results: [] as const };
  }
  const issue = await getNewsletter();
  const groups = new Map<string, string[]>();
  for (const sub of weekly) {
    const key = [...sub.desks].sort().join(",");
    groups.set(key, [...(groups.get(key) ?? []), sub.email]);
  }
  const results: Array<{
    desks: string[];
    subject: string;
    recipients: number;
    sent: boolean;
    outbox?: string;
    error?: string;
    why?: string;
  }> = [];
  for (const [key, emails] of groups) {
    const desks = key.split(",");
    const coasts = coastsForDesks(desks);
    const filtered = filterNewsletter(issue, coasts);
    const subject = letterSubject(filtered, coasts);
    const html = letterEmailHtml(filtered, coasts);
    const text = letterEmailText(filtered, coasts);
    try {
      const remote = await sendResend(emails, subject, html, text);
      const outbox = remote.sent
        ? undefined
        : await writeOutbox(`letter-${desks.join("-")}`, { subject, text, recipients: emails, html }).catch(
            () => undefined,
          );
      results.push({
        desks,
        subject,
        recipients: emails.length,
        sent: remote.sent,
        outbox,
        why: remote.why ?? undefined,
      });
    } catch (error) {
      results.push({
        desks,
        subject,
        recipients: emails.length,
        sent: false,
        error: error instanceof Error ? error.message : "Weekly letter failed",
      });
    }
  }
  return { skipped: false as const, reason: null, results };
}

export async function dispatchCalendar(opts?: { force?: boolean; desk?: string; at?: Date }) {
  const at = opts?.at ?? new Date();
  if (!opts?.force && !isChicagoSunday(at)) {
    return { skipped: true as const, reason: "not Sunday in Chicago", results: [] as const };
  }
  const subscribers = await listSubscribers();
  const due = AREAS.filter((d) => !opts?.desk || d.id === opts.desk);
  const results: Array<{
    areaId: string;
    subject: string;
    recipients: number;
    sent: boolean;
    outbox?: string;
    error?: string;
    why?: string;
  }> = [];
  for (const area of due) {
    const recipients = subscribersForDesk(subscribers, area.id, "calendar");
    try {
      const now = clockParts(at, area.timezone);
      const months = await buildCalendarRange(area, now.year, now.month, "all", 1);
      const month = months[0];
      if (!month) throw new Error("Calendar did not set.");
      const subject = calendarSubject(area, month);
      const html = calendarEmailHtml(area, month);
      const text = calendarEmailText(area, month);
      if (!recipients.length) {
        const outbox = await writeOutbox(`cal-${area.id}`, { subject, text, recipients: [] }).catch(() => undefined);
        results.push({ areaId: area.id, subject, recipients: 0, sent: false, outbox, why: "no address on the list" });
        continue;
      }
      const remote = await sendResend(recipients, subject, html, text);
      const outbox = remote.sent
        ? undefined
        : await writeOutbox(`cal-${area.id}`, { subject, text, recipients, html }).catch(() => undefined);
      results.push({
        areaId: area.id,
        subject,
        recipients: recipients.length,
        sent: remote.sent,
        outbox,
        why: remote.why ?? undefined,
      });
    } catch (error) {
      results.push({
        areaId: area.id,
        subject: `${area.shortName} calendar`,
        recipients: recipients.length,
        sent: false,
        error: error instanceof Error ? error.message : "Calendar mail failed",
      });
    }
  }
  return { skipped: false as const, reason: null, results };
}

export async function dispatchSeasonal(opts?: { force?: boolean; at?: Date }) {
  const at = opts?.at ?? new Date();
  if (!opts?.force && !isChicagoMonthStart(at)) {
    return { skipped: true as const, reason: "not the 1st in Chicago", results: [] as const };
  }
  const subscribers = await listSubscribers();
  const seasonal = subscribers.filter((s) => s.cadence.includes("seasonal") && s.desks.length);
  if (!seasonal.length) {
    return { skipped: false as const, reason: "no seasonal addresses", results: [] as const };
  }
  const groups = new Map<string, string[]>();
  for (const sub of seasonal) {
    const key = [...sub.desks].sort().join(",");
    groups.set(key, [...(groups.get(key) ?? []), sub.email]);
  }
  const results: Array<{
    desks: string[];
    subject: string;
    recipients: number;
    sent: boolean;
    outbox?: string;
    error?: string;
    why?: string;
  }> = [];
  for (const [key, emails] of groups) {
    const desks = key.split(",");
    const coasts = coastsForDesks(desks);
    const issue = buildSeasonIssue(coasts, at);
    const subject = seasonalSubject(issue);
    const html = seasonalEmailHtml(issue);
    const text = seasonalEmailText(issue);
    try {
      const remote = await sendResend(emails, subject, html, text);
      const outbox = remote.sent
        ? undefined
        : await writeOutbox(`season-${desks.join("-")}`, { subject, text, recipients: emails, html }).catch(
            () => undefined,
          );
      results.push({
        desks,
        subject,
        recipients: emails.length,
        sent: remote.sent,
        outbox,
        why: remote.why ?? undefined,
      });
    } catch (error) {
      results.push({
        desks,
        subject,
        recipients: emails.length,
        sent: false,
        error: error instanceof Error ? error.message : "Seasonal mail failed",
      });
    }
  }
  return { skipped: false as const, reason: null, results };
}

export async function runDispatch(opts?: {
  forceAll?: boolean;
  desk?: string;
  weekly?: boolean;
  calendar?: boolean;
  seasonal?: boolean;
  at?: Date;
}) {
  const morning = await dispatchMorning(opts);
  const weekly = await dispatchWeekly({ force: opts?.weekly, at: opts?.at });
  const calendar = await dispatchCalendar({ force: opts?.calendar, desk: opts?.desk, at: opts?.at });
  const seasonal = await dispatchSeasonal({ force: opts?.seasonal, at: opts?.at });
  return { ...morning, weekly, calendar, seasonal };
}
