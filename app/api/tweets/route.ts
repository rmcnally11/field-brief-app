import { NextResponse } from "next/server";
import { getBriefing } from "@/lib/briefing";
import { buildCalendarRange, getYoloDay } from "@/lib/calendar";
import { getArea } from "@/lib/data/areas";
import { clockParts } from "@/lib/time";
import {
  ORIGIN,
  TWEET_DESKS,
  calendarAlt,
  calendarCardUrl,
  calendarTweetText,
  morningAlt,
  morningCardUrl,
  morningTweetText,
} from "@/lib/tweet";

export const dynamic = "force-dynamic";

export async function GET() {
  const mornings = [];
  const calendars = [];

  for (const desk of TWEET_DESKS) {
    const area = getArea(desk.areaId);
    try {
      const briefing = await getBriefing(area.id);
      const yolo = await getYoloDay(area, briefing.activity);
      mornings.push({
        desk: desk.desk,
        kicker: desk.kicker,
        theater: desk.theater,
        areaId: desk.areaId,
        shortName: briefing.area.shortName,
        score: briefing.overall,
        text: morningTweetText(briefing, yolo),
        image: morningCardUrl(area.id, area.theater),
        alt: morningAlt(briefing),
        href: morningCardUrl(area.id, area.theater),
        skip: false,
      });
    } catch (error) {
      mornings.push({
        desk: desk.desk,
        kicker: desk.kicker,
        theater: desk.theater,
        areaId: desk.areaId,
        shortName: area.shortName,
        score: null,
        text: null,
        image: morningCardUrl(area.id, area.theater),
        alt: null,
        href: morningCardUrl(area.id, area.theater),
        skip: true,
        error: error instanceof Error ? error.message : "Gauge quiet",
      });
    }

    try {
      const now = clockParts(new Date(), area.timezone);
      const months = await buildCalendarRange(area, now.year, now.month, "all", 1);
      const days = months[0]?.days ?? [];
      calendars.push({
        desk: desk.desk,
        theater: desk.theater,
        areaId: desk.areaId,
        shortName: area.shortName,
        text: calendarTweetText(area.shortName, area.id, area.theater, days),
        image: calendarCardUrl(area.id, area.theater),
        alt: calendarAlt(area.shortName, days),
        href: calendarCardUrl(area.id, area.theater),
        skip: false,
      });
    } catch (error) {
      calendars.push({
        desk: desk.desk,
        theater: desk.theater,
        areaId: desk.areaId,
        shortName: area.shortName,
        text: null,
        image: calendarCardUrl(area.id, area.theater),
        alt: null,
        href: calendarCardUrl(area.id, area.theater),
        skip: true,
        error: error instanceof Error ? error.message : "Calendar did not set",
      });
    }
  }

  return NextResponse.json({
    source: `${ORIGIN}/for-the-letter`,
    instructions: `${ORIGIN}/for-the-letter`,
    github: "https://github.com/rmcnally11/field-brief-app/blob/main/TWITTER.md",
    rule: "Screenshot image URLs from this site only. Do not generate pictures. Skip any desk with skip=true.",
    mornings,
    calendars,
  });
}
