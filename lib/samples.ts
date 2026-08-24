import { getBriefing } from "@/lib/briefing";
import { buildCalendarRange, getYoloDay } from "@/lib/calendar";
import { AREA_BY_ID } from "@/lib/data/areas";
import { filterNewsletter, getNewsletter } from "@/lib/newsletter";
import { clockParts } from "@/lib/time";
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
import { sendResend } from "@/lib/send";
import type { TheaterId } from "@/lib/types";
import type { Cadence } from "@/lib/coasts";
import { coastsForDesks } from "@/lib/coasts";

export type SampleMail = {
  kind: "daily" | "weekly" | "calendar" | "seasonal";
  subject: string;
  html: string;
  text: string;
};

export async function buildSampleEmails(opts?: { areaId?: string; coasts?: TheaterId[] }): Promise<SampleMail[]> {
  const areaId = opts?.areaId ?? "galveston";
  const area = AREA_BY_ID[areaId];
  if (!area) throw new Error(`Unknown desk ${areaId}`);
  const coasts = opts?.coasts ?? [area.theater];

  const [briefing, yolo, issue, months] = await Promise.all([
    getBriefing(area.id),
    getYoloDay(area, "all"),
    getNewsletter(),
    buildCalendarRange(area, clockParts(new Date(), area.timezone).year, clockParts(new Date(), area.timezone).month, "all", 1),
  ]);
  const month = months[0];
  if (!month) throw new Error("Calendar did not set.");
  const letter = filterNewsletter(issue, coasts);
  const season = buildSeasonIssue(coasts);

  return [
    {
      kind: "daily",
      subject: morningSubject(briefing),
      html: morningEmailHtml(briefing, yolo),
      text: morningEmailText(briefing, yolo),
    },
    {
      kind: "weekly",
      subject: letterSubject(letter, coasts),
      html: letterEmailHtml(letter, coasts),
      text: letterEmailText(letter, coasts),
    },
    {
      kind: "calendar",
      subject: calendarSubject(area, month),
      html: calendarEmailHtml(area, month),
      text: calendarEmailText(area, month),
    },
    {
      kind: "seasonal",
      subject: seasonalSubject(season),
      html: seasonalEmailHtml(season),
      text: seasonalEmailText(season),
    },
  ];
}

export async function sendSampleEmails(to: string, opts?: { areaId?: string; coasts?: TheaterId[] }) {
  const samples = await buildSampleEmails(opts);
  const results = [];
  for (const sample of samples) {
    const subject = `[SAMPLE] ${sample.subject}`;
    const remote = await sendResend([to], subject, sample.html, sample.text);
    results.push({
      kind: sample.kind,
      subject,
      sent: remote.sent,
      id: remote.id,
      why: remote.why,
    });
  }
  return { to, results };
}

export async function sendWelcomeEmails(
  to: string,
  opts: { desks: string[]; cadence: Cadence[] },
) {
  const areaId = opts.desks[0] ?? "galveston";
  const coasts = coastsForDesks(opts.desks);
  const wanted = new Set(opts.cadence);
  const samples = (await buildSampleEmails({ areaId, coasts })).filter((s) => wanted.has(s.kind));
  const results = [];
  for (const sample of samples) {
    const remote = await sendResend([to], sample.subject, sample.html, sample.text);
    results.push({
      kind: sample.kind,
      subject: sample.subject,
      sent: remote.sent,
      id: remote.id,
      why: remote.why,
    });
  }
  return { to, results };
}
