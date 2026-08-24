import { cardinalFromDeg } from "@/lib/time";

const UA = "FieldBrief/1.0 (inshore conditions; https://github.com)";

export async function fetchNwsPoint(lat: number, lon: number) {
  const res = await fetch(`https://api.weather.gov/points/${lat.toFixed(3)},${lon.toFixed(3)}`, {
    headers: { "User-Agent": UA, Accept: "application/geo+json" },
    next: { revalidate: 1800 },
    signal: AbortSignal.timeout(2200),
  });
  if (!res.ok) throw new Error(`NWS points ${res.status}`);
  return res.json();
}

type NwsPeriod = {
  startTime: string;
  temperature: number;
  windSpeed: string;
  windDirection: string;
  shortForecast: string;
};

async function fetchNwsPeriods(url: string | undefined, label: string) {
  if (!url) return { periods: [] as NwsPeriod[], office: null as string | null };
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/geo+json" },
    next: { revalidate: 600 },
    signal: AbortSignal.timeout(2200),
  });
  if (!res.ok) throw new Error(`NWS ${label} ${res.status}`);
  const json = await res.json();
  return {
    periods: (json.properties?.periods ?? []) as NwsPeriod[],
    office: null as string | null,
  };
}

export async function fetchNwsForecast(lat: number, lon: number) {
  const point = await fetchNwsPoint(lat, lon);
  const result = await fetchNwsPeriods(point.properties?.forecastHourly as string | undefined, "hourly");
  return { ...result, office: point.properties?.cwa ?? null };
}

/** 12-hour grid forecast — enough for a calendar day’s max wind, much smaller than hourly. */
export async function fetchNwsDayWinds(lat: number, lon: number) {
  const point = await fetchNwsPoint(lat, lon);
  const result = await fetchNwsPeriods(point.properties?.forecast as string | undefined, "forecast");
  return { ...result, office: point.properties?.cwa ?? null };
}

function parseWindMph(text: string | undefined) {
  if (!text) return null;
  const nums = [...text.matchAll(/(\d+)/g)].map((m) => Number(m[1]));
  if (!nums.length) return null;
  return Math.max(...nums);
}

export function nwsWindAt(
  periods: { startTime: string; windSpeed: string; windDirection: string; temperature: number }[],
  at: Date,
) {
  if (!periods.length) return null;
  let best = periods[0];
  let bestDelta = Math.abs(new Date(best.startTime).getTime() - at.getTime());
  for (const p of periods) {
    const delta = Math.abs(new Date(p.startTime).getTime() - at.getTime());
    if (delta < bestDelta) {
      best = p;
      bestDelta = delta;
    }
  }
  if (bestDelta > 18 * 3600000) return null;
  const dirMap: Record<string, number> = {
    N: 0, NNE: 22, NE: 45, ENE: 67, E: 90, ESE: 112, SE: 135, SSE: 157,
    S: 180, SSW: 202, SW: 225, WSW: 247, W: 270, WNW: 292, NW: 315, NNW: 337,
  };
  const deg = dirMap[best.windDirection] ?? null;
  return {
    airF: best.temperature,
    windMph: parseWindMph(best.windSpeed),
    windDirDeg: deg,
    windCardinal: best.windDirection || cardinalFromDeg(deg),
  };
}

export function nwsWindNow(
  periods: { startTime: string; windSpeed: string; windDirection: string; temperature: number }[],
) {
  const now = Date.now();
  const p =
    periods.find((x) => new Date(x.startTime).getTime() >= now - 30 * 60000) ?? periods[0];
  if (!p) return null;
  const dirMap: Record<string, number> = {
    N: 0, NNE: 22, NE: 45, ENE: 67, E: 90, ESE: 112, SE: 135, SSE: 157,
    S: 180, SSW: 202, SW: 225, WSW: 247, W: 270, WNW: 292, NW: 315, NNW: 337,
  };
  const deg = dirMap[p.windDirection] ?? null;
  return {
    airF: p.temperature,
    windMph: parseWindMph(p.windSpeed),
    windDirDeg: deg,
    windCardinal: p.windDirection || cardinalFromDeg(deg),
  };
}
