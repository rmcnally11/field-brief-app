import type { ActivityId, Area, CalendarDay } from "@/lib/types";
import { clockParts, ymdInZone } from "@/lib/time";
import { moonPhase } from "@/lib/moon";
import { SPECIES } from "@/lib/data/species";
import { fetchHourly } from "@/lib/noaa";
import { fetchNwsForecast } from "@/lib/nws";
import { fetchOpenMeteo } from "@/lib/openmeteo";
import { modeledHourlyTide } from "@/lib/moon";
import { activityWindPenalty, timeOfDayScore } from "@/lib/engine";

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function parseStamp(stamp: string) {
  if (stamp.includes("T")) return new Date(stamp.endsWith("Z") ? stamp : `${stamp}Z`);
  return new Date(`${stamp.replace(" ", "T")}:00Z`);
}

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
    // Moderate range is better than a huge dirty spring or a dead neap.
    rangeScore = range < 0.4 ? 0.4 : range < 2.4 ? 1 : 0.65;
  } else {
    rangeScore = clamp(range / Math.max(1.2, area.meanRangeFt * 1.4), 0.3, 1);
  }
  const moveScore = clamp(bestMove / 0.15, 0.3, 1);
  return { score: 0.55 * rangeScore + 0.45 * moveScore, range, bestHour };
}

function seasonalForArea(area: Area, month: number, activity: ActivityId | "all") {
  const local = SPECIES.filter((s) => s.theaters.includes(area.theater));
  if (!local.length) return 0.5;
  const scores = local.map((s) => {
    if (!s.presentMonths.includes(month)) return 0.15;
    let n = s.peakMonths.includes(month) ? 1 : 0.55;
    if (activity === "fly" && (s.id === "bonefish" || s.id === "permit" || s.id === "redfish")) n += 0.08;
    if (activity === "structure" && (s.id === "sheepshead" || s.id === "black-drum")) n += 0.1;
    return n;
  });
  return scores.sort((a, b) => b - a).slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, scores.length);
}

export async function buildCalendar(
  area: Area,
  year: number,
  month: number,
  activity: ActivityId | "all",
): Promise<CalendarDay[]> {
  const start = new Date(Date.UTC(year, month - 1, 1, 6, 0));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const end = new Date(Date.UTC(year, month - 1, daysInMonth, 18, 0));

  let hourly: { time: string; height: number }[] = [];
  if (area.noaaStation) {
    try {
      const rows = await fetchHourly(area.noaaStation, new Date(start.getTime() - 86400000), daysInMonth + 2);
      hourly = rows.map((r) => ({ time: r.time, height: r.height }));
    } catch {
      hourly = [];
    }
  }
  if (!hourly.length) {
    hourly = modeledHourlyTide(new Date(start.getTime() - 12 * 3600000), (daysInMonth + 3) * 24, area.meanRangeFt, area.modeledTideOffsetHours ?? 0);
  }

  const windByDay = new Map<string, number>();
  try {
    if (area.theater === "bahamas") {
      const om = await fetchOpenMeteo(area.lat, area.lon);
      om.hourly.time.forEach((t, i) => {
        const ymd = ymdInZone(new Date(t), area.timezone);
        const prev = windByDay.get(ymd) ?? 0;
        windByDay.set(ymd, Math.max(prev, om.hourly.wind_speed_10m[i] ?? 0));
      });
    } else {
      const nws = await fetchNwsForecast(area.lat, area.lon);
      for (const p of nws.periods) {
        const ymd = ymdInZone(new Date(p.startTime), area.timezone);
        const nums = [...(p.windSpeed ?? "").matchAll(/(\d+)/g)].map((m) => Number(m[1]));
        const mph = nums.length ? Math.max(...nums) : 0;
        windByDay.set(ymd, Math.max(windByDay.get(ymd) ?? 0, mph));
      }
    }
  } catch {
    // calendar still works on tide + moon + season
  }

  const todayYmd = ymdInZone(new Date(), area.timezone);
  const days: CalendarDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const ymd = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const noon = new Date(Date.UTC(year, month - 1, d, 16, 0));
    const moon = moonPhase(noon);
    const tide = dayTideQuality(hourly, ymd, area);
    const season = seasonalForArea(area, month, activity);
    const wind = windByDay.get(ymd) ?? null;
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
          0.15 * (hasWind ? windScore : 0.7) +
          0.1 * tod),
      1,
      10,
    );

    const drivers: string[] = [];
    drivers.push(`${moon.name.toLowerCase()} · ${moon.springNeap}`);
    drivers.push(`tide range ~${tide.range.toFixed(1)} ft`);
    if (wind != null) drivers.push(`wind to ${Math.round(wind)} mph`);
    else drivers.push("no wind forecast this far out");

    const confidence: CalendarDay["confidence"] =
      ymd === todayYmd ? "observed" : hasWind ? "forecast" : "astronomical";

    days.push({
      date: ymd,
      score: Number(score.toFixed(1)),
      confidence,
      drivers,
      bestWindow:
        tide.bestHour != null
          ? `${((tide.bestHour + 11) % 12) + 1}${tide.bestHour >= 12 ? "p" : "a"} moving water`
          : null,
    });
  }

  void end;
  return days;
}
