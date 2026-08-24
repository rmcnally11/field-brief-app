import type { Briefing, CalendarDay } from "@/lib/types";
import { DESKS } from "@/lib/newsletter";
import { skyCopy, skyWord } from "@/lib/wx";

export const ORIGIN = "https://field-brief-app.vercel.app";

export const TWEET_DESKS = DESKS;

export function deskHref(areaId: string, theater: string) {
  return `${ORIGIN}/?area=${areaId}&theater=${theater}`;
}

export function morningCardUrl(areaId: string, theater: string) {
  return `${ORIGIN}/card?area=${areaId}&theater=${theater}`;
}

export function calendarCardUrl(areaId: string, theater: string) {
  return `${ORIGIN}/card/calendar?area=${areaId}&theater=${theater}`;
}

export function calendarHref(areaId: string, theater: string) {
  return `${ORIGIN}/calendar?area=${areaId}&theater=${theater}`;
}

export function morningTweetText(briefing: Briefing, yolo?: CalendarDay | null) {
  const w = briefing.conditions.weather;
  const wind =
    w.windMph != null
      ? `${Math.round(w.windMph)} mph${w.windCardinal ? ` ${w.windCardinal}` : ""}`
      : "wind n/a";
  const sky =
    w.wx === "storm"
      ? "t-storms"
      : w.wx === "rain"
        ? w.precipChance != null
          ? `${Math.round(w.precipChance)}% rain`
          : "rain"
        : w.wx === "clear"
          ? "clear"
          : w.wx === "clouds"
            ? "clouds"
            : "";
  const yoloBit = yolo ? ` · YOLO ${yolo.date.slice(5)}` : "";
  const line = `${briefing.area.shortName} ${briefing.overall.toFixed(1)} · ${wind}${sky ? ` · ${sky}` : ""}${yoloBit}`;
  return `${line}\n${morningCardUrl(briefing.area.id, briefing.area.theater)}`;
}

export function morningAlt(briefing: Briefing) {
  const w = briefing.conditions.weather;
  return [
    `Field Brief ${briefing.area.shortName} score ${briefing.overall.toFixed(1)} of 10`,
    w.windMph != null
      ? `wind ${Math.round(w.windMph)} mph ${w.windCardinal ?? ""}`.trim()
      : null,
    skyCopy(w.wx, w.precipChance, w.sky),
    briefing.conditions.moon.name,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function calendarTweetText(
  shortName: string,
  areaId: string,
  theater: string,
  days: CalendarDay[],
) {
  const yolo = days.find((d) => d.yolo);
  const wet = days.filter((d) => skyWord(d.wx)).slice(0, 3);
  const yoloBit = yolo ? `YOLO ${yolo.date.slice(5)} (${yolo.score.toFixed(1)})` : "no YOLO yet";
  const rainBit = wet.length ? ` · ${wet.map((d) => `${d.date.slice(5)} ${skyWord(d.wx)}`).join(", ")}` : "";
  return `${shortName} calendar · ${yoloBit}${rainBit}\n${calendarCardUrl(areaId, theater)}`;
}

export function calendarAlt(shortName: string, days: CalendarDay[]) {
  const yolo = days.find((d) => d.yolo);
  return `Field Brief ${shortName} month grid${yolo ? `, YOLO ${yolo.date}` : ""}. Copper outline is YOLO. Gold is an amazing dry day. Rain and t-storm labels are from the site.`;
}
