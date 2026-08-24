import type { ActivityId, Area, CalendarDay } from "@/lib/types";
import { clockParts, ymdInZone } from "@/lib/time";
import { moonGlyph, moonPhase, modeledHourlyTide } from "@/lib/moon";
import { SPECIES } from "@/lib/data/species";
import { fetchHiLo, fetchHourly } from "@/lib/noaa";
import { fetchNwsForecast } from "@/lib/nws";
import { fetchOpenMeteo } from "@/lib/openmeteo";
import { activityWindPenalty, timeOfDayScore } from "@/lib/engine";

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function parseStamp(stamp: string) {
  if (stamp.includes("T")) return new Date(stamp.endsWith("Z") ? stamp : `${stamp}Z`);
  return new Date(`${stamp.replace(" ", "T")}:00Z`);
}

type CalendarInputs = {
  hourly: { time: string; height: number }[];
  hilo: { time: string; height: number; type: "H" | "L"; at: Date }[];
  windByDay: Map<string, number>;
};

function dayTideQuality(
  hourly: { time: string; height: number }[],
  ymd: string,
  area: Area,
) {
  const dayPts = hourly.filter((h) => ymdInZone(parseStamp(h.time), area.timezone) === ymd);
  if (dayPts.length < 4) return { score: 0.45, range: area.meanRangeFt, bestHour: null as number | null };
  const heights = dayPts.map((p) => p.height);
  const range = Math.max(...heights) - Math.min(...heights);
  let bestMove = 0;
  let bestHour: number | null = null;
  for (let i = 1; i < dayPts.length; i++) {
    const move = Math.abs(dayPts[i].height - dayPts[i - 1].height);
    if (move > bestMove) {
      bestMove = move;
      bestHour = clockParts(parseStamp(dayPts[i].time), area.timezone).hour;
    }
  }
  let rangeScore: number;
  if (area.tideCharacter === "sight-skinny") {
    rangeScore = range < 0.4 ? 0.4 : range < 2.4 ? 1 : 0.65;
  } else if (area.tideCharacter === "blue-water") {
    rangeScore = 0.75;
  } else {
    rangeScore = clamp(range / Math.max(1.2, area.meanRangeFt * 1.4), 0.3, 1);
  }
  const moveScore = clamp(bestMove / 0.15, 0.3, 1);
  return { score: 0.55 * rangeScore + 0.45 * moveScore, range, bestHour };
}

function seasonalForArea(area: Area, month: number, activity: ActivityId | "all") {
  const local = SPECIES.filter((s) => {
    if (!s.theaters.includes(area.theater)) return false;
    if (activity === "offshore") return s.role === "bluewater" || s.role === "pacific" || s.role === "primary";
    return s.role === "primary" || (s.role === "pacific" && area.theater === "mexico");
  });
  if (!local.length) return 0.5;
  const scores = local.map((s) => {
    if (!s.presentMonths.includes(month)) return 0.15;
    let n = s.peakMonths.includes(month) ? 1 : 0.55;
    if (activity === "fly" && (s.id === "bonefish" || s.id === "permit" || s.id === "redfish" || s.id === "roosterfish" || s.id === "gt")) n += 0.08;
    if (activity === "structure" && (s.id === "sheepshead" || s.id === "black-drum")) n += 0.1;
    if (activity === "offshore" && (s.role === "bluewater" || s.id === "roosterfish")) n += 0.12;
    return n;
  });
  return scores.sort((a, b) => b - a).slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, scores.length);
}

async function loadCalendarInputs(area: Area, start: Date, dayCount: number): Promise<CalendarInputs> {
  const [hourlySettled, hiloSettled, windSettled] = await Promise.allSettled([
    area.noaaStation
      ? fetchHourly(area.noaaStation, new Date(start.getTime() - 86400000), dayCount + 2)
      : Promise.resolve([]),
    area.noaaStation
      ? fetchHiLo(area.noaaStation, new Date(start.getTime() - 86400000), dayCount + 2)
      : Promise.resolve([]),
    area.theater === "bahamas" || area.theater === "mexico" || area.theater === "seychelles"
      ? fetchOpenMeteo(area.lat, area.lon)
      : fetchNwsForecast(area.lat, area.lon),
  ]);

  let hourly: { time: string; height: number }[] =
    hourlySettled.status === "fulfilled"
      ? hourlySettled.value.map((r) => ({ time: r.time, height: r.height }))
      : [];
  if (!hourly.length) {
    hourly = modeledHourlyTide(
      new Date(start.getTime() - 12 * 3600000),
      (dayCount + 3) * 24,
      area.meanRangeFt,
      area.modeledTideOffsetHours ?? 0,
    );
  }

  const hilo =
    hiloSettled.status === "fulfilled"
      ? hiloSettled.value.map((h) => ({ ...h, at: h.at ?? parseStamp(h.time) }))
      : [];

  const windByDay = new Map<string, number>();
  if (windSettled.status === "fulfilled") {
    const wind = windSettled.value;
    if ("hourly" in wind) {
      wind.hourly.time.forEach((t, i) => {
        const ymd = ymdInZone(new Date(t), area.timezone);
        windByDay.set(ymd, Math.max(windByDay.get(ymd) ?? 0, wind.hourly.wind_speed_10m[i] ?? 0));
      });
    } else {
      for (const p of wind.periods) {
        const ymd = ymdInZone(new Date(p.startTime), area.timezone);
        const nums = [...(p.windSpeed ?? "").matchAll(/(\d+)/g)].map((m) => Number(m[1]));
        const mph = nums.length ? Math.max(...nums) : 0;
        windByDay.set(ymd, Math.max(windByDay.get(ymd) ?? 0, mph));
      }
    }
  }

  return { hourly, hilo, windByDay };
}

function scoreDay(
  area: Area,
  activity: ActivityId | "all",
  ymd: string,
  inputs: CalendarInputs,
): CalendarDay {
  const [year, month] = [Number(ymd.slice(0, 4)), Number(ymd.slice(5, 7))];
  const noon = new Date(Date.UTC(year, month - 1, Number(ymd.slice(8, 10)), 16, 0));
  const moon = moonPhase(noon);
  const tide = dayTideQuality(inputs.hourly, ymd, area);
  const season = seasonalForArea(area, month, activity);
  const wind = inputs.windByDay.get(ymd) ?? null;
  const windScore = activityWindPenalty(activity, wind);
  const tod = timeOfDayScore(tide.bestHour ?? 8, month, null);
  const spring =
    area.tideCharacter === "sight-skinny"
      ? moon.springNeap === "neap"
        ? 0.85
        : moon.springNeap === "spring"
          ? 0.7
          : 1
      : moon.springNeap === "spring"
        ? 1
        : moon.springNeap === "neap"
          ? 0.65
          : 0.85;
  const hasWind = wind != null;
  const score = clamp(
    10 *
      (0.28 * season +
        0.32 * tide.score +
        0.15 * spring +
        0.15 * (hasWind ? windScore : 0.5) +
        0.1 * tod),
    1,
    10,
  );
  const todayYmd = ymdInZone(new Date(), area.timezone);
  const tides = inputs.hilo
    .filter((t) => ymdInZone(t.at, area.timezone) === ymd)
    .map((t) => {
      const p = clockParts(t.at, area.timezone);
      const h12 = ((p.hour + 11) % 12) + 1;
      return {
        type: t.type,
        time: `${h12}:${String(p.minute).padStart(2, "0")}${p.hour >= 12 ? "p" : "a"}`,
        height: t.height,
      };
    });
  const rangeFromHiLo =
    tides.length >= 2 ? Math.max(...tides.map((t) => t.height)) - Math.min(...tides.map((t) => t.height)) : tide.range;
  const amazing =
    hasWind &&
    wind != null &&
    wind <= 14 &&
    (score >= 8.2 ||
      (score >= 7.6 &&
        (area.tideCharacter === "sight-skinny" ? moon.springNeap !== "spring" : moon.springNeap === "spring")));

  return {
    date: ymd,
    score: Number(score.toFixed(1)),
    confidence: ymd === todayYmd ? "observed" : hasWind ? "forecast" : "astronomical",
    drivers: [
      `${moon.name.toLowerCase()} · ${moon.springNeap}`,
      `tide range ~${tide.range.toFixed(1)} ft`,
      wind != null ? `wind to ${Math.round(wind)} mph` : "no wind forecast this far out",
    ],
    bestWindow:
      tide.bestHour != null ? `${((tide.bestHour + 11) % 12) + 1}${tide.bestHour >= 12 ? "p" : "a"} moving water` : null,
    amazing,
    moon: {
      name: moon.name,
      glyph: moonGlyph(moon.phase),
      phase: moon.phase,
      illumination: moon.illumination,
      springNeap: moon.springNeap,
    },
    tides,
    tideRangeFt: Number(rangeFromHiLo.toFixed(2)),
    windMph: wind,
  };
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export async function buildCalendar(
  area: Area,
  year: number,
  month: number,
  activity: ActivityId | "all",
): Promise<CalendarDay[]> {
  const start = new Date(Date.UTC(year, month - 1, 1, 6, 0));
  const inputs = await loadCalendarInputs(area, start, daysInMonth(year, month));
  const days: CalendarDay[] = [];
  for (let d = 1; d <= daysInMonth(year, month); d++) {
    days.push(scoreDay(area, activity, `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`, inputs));
  }
  return days;
}

export function upcomingDays(months: { days: CalendarDay[] }[], fromYmd: string, count = 14) {
  return months.flatMap((m) => m.days).filter((d) => d.date >= fromYmd).slice(0, count);
}

export async function buildUpcoming(
  area: Area,
  activity: ActivityId | "all",
  fromYmd: string,
  count = 14,
): Promise<CalendarDay[]> {
  const start = new Date(`${fromYmd}T12:00:00Z`);
  const inputs = await loadCalendarInputs(area, start, count + 2);
  const days: CalendarDay[] = [];
  const cursor = new Date(Date.UTC(Number(fromYmd.slice(0, 4)), Number(fromYmd.slice(5, 7)) - 1, Number(fromYmd.slice(8, 10))));
  for (let i = 0; i < count; i++) {
    const y = cursor.getUTCFullYear();
    const m = cursor.getUTCMonth() + 1;
    const d = cursor.getUTCDate();
    days.push(scoreDay(area, activity, `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, inputs));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

export async function buildCalendarRange(
  area: Area,
  year: number,
  month: number,
  activity: ActivityId | "all",
  count = 2,
) {
  const start = new Date(Date.UTC(year, month - 1, 1, 6, 0));
  const span = count * 32;
  const inputs = await loadCalendarInputs(area, start, span);
  const months: { year: number; month: number; label: string; days: CalendarDay[] }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(Date.UTC(year, month - 1 + i, 1));
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const days: CalendarDay[] = [];
    for (let day = 1; day <= daysInMonth(y, m); day++) {
      days.push(scoreDay(area, activity, `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`, inputs));
    }
    months.push({
      year: y,
      month: m,
      label: d.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }),
      days,
    });
  }
  return months;
}
