import type { Briefing, CalendarDay, TheaterId } from "@/lib/types";
import { DESKS } from "@/lib/newsletter";
import { theaterLabel } from "@/lib/data/theaters";
import { skyCopy, skyWord } from "@/lib/wx";

export const ORIGIN = "https://field-brief-app.vercel.app";

export const TWEET_DESKS = DESKS;

/** Words people actually search — location + fishery, not a hashtag dump. */
const PLACE: Record<string, string> = {
  galveston: "Texas coast inshore fishing",
  venice: "Louisiana birdfoot inshore fishing",
  islamorada: "Islamorada Florida Keys flats fishing",
  andros: "Andros Bahamas bonefish flats",
  ascension: "Ascension Bay Mexico flats fishing",
  "san-juan": "San Juan Puerto Rico inshore fishing",
  alphonse: "Alphonse Seychelles flats fishing",
};

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

function windBit(briefing: Briefing) {
  const w = briefing.conditions.weather;
  if (w.windMph == null) return "wind not in";
  return `${Math.round(w.windMph)} mph${w.windCardinal ? ` ${w.windCardinal}` : ""}`;
}

function skyBit(briefing: Briefing) {
  const w = briefing.conditions.weather;
  if (w.wx === "storm") return "thunderstorms — stay tied";
  if (w.wx === "rain") {
    return w.precipChance != null ? `${Math.round(w.precipChance)}% rain in the forecast` : "rain in the forecast";
  }
  if (w.wx === "clear") return "clear fishing weather";
  if (w.wx === "clouds") return "cloudy fishing weather";
  if (w.precipChance != null) return `${Math.round(w.precipChance)}% chance of rain`;
  return "sky not in";
}

export function morningTweetText(briefing: Briefing, yolo?: CalendarDay | null, kicker?: string) {
  const place = PLACE[briefing.area.id] ?? `${theaterLabel(briefing.area.theater)} fishing`;
  const yoloBit = yolo ? ` YOLO day ${yolo.date.slice(5)}.` : "";
  const kick = kicker ? ` ${kicker}.` : "";
  const line = `${briefing.area.shortName} fishing weather: ${briefing.overall.toFixed(1)} this morning. ${place}. Wind ${windBit(briefing)}, ${skyBit(briefing)}.${kick} Field Brief — a 1–10, not a bite.${yoloBit}`;
  return `${line}\n${morningCardUrl(briefing.area.id, briefing.area.theater)}`;
}

export function morningAlt(briefing: Briefing) {
  const w = briefing.conditions.weather;
  const place = PLACE[briefing.area.id] ?? briefing.area.name;
  return [
    `Field Brief ${place} weather card`,
    `${briefing.area.shortName} fishing score ${briefing.overall.toFixed(1)} of 10`,
    w.windMph != null ? `wind ${Math.round(w.windMph)} mph ${w.windCardinal ?? ""}`.trim() : null,
    skyCopy(w.wx, w.precipChance, w.sky),
    briefing.conditions.moon.name,
  ]
    .filter(Boolean)
    .join(". ");
}

export function calendarTweetText(
  shortName: string,
  areaId: string,
  theater: string,
  days: CalendarDay[],
) {
  const place = PLACE[areaId] ?? `${theaterLabel(theater as TheaterId)} fishing`;
  const yolo = days.find((d) => d.yolo);
  const storms = days.filter((d) => d.wx === "storm").slice(0, 3);
  const rains = days.filter((d) => d.wx === "rain").slice(0, 2);
  const yoloBit = yolo
    ? `Best remaining dry day is ${yolo.date.slice(5)} (${yolo.score.toFixed(1)}).`
    : "No YOLO day with a real wind forecast yet.";
  const wetBit = storms.length
    ? ` Thunderstorms ${storms.map((d) => d.date.slice(5)).join(", ")}.`
    : rains.length
      ? ` Rain in the forecast ${rains.map((d) => d.date.slice(5)).join(", ")}.`
      : "";
  const line = `${shortName} fishing calendar — ${place}. ${yoloBit}${wetBit} Inshore forecast from Field Brief. Not a bite call.`;
  return `${line}\n${calendarCardUrl(areaId, theater)}`;
}

export function calendarAlt(shortName: string, days: CalendarDay[], areaId?: string) {
  const yolo = days.find((d) => d.yolo);
  const place = areaId ? PLACE[areaId] ?? shortName : shortName;
  return `Field Brief ${place} calendar. Month grid with moon, tide, and fishing weather.${yolo ? ` YOLO ${yolo.date}.` : ""} Copper is YOLO. Gold is an amazing dry day. Rain and thunderstorm labels are from this site.`;
}
