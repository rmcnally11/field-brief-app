import { cardinalFromDeg } from "@/lib/time";

const UA = "FieldBrief/1.0 (inshore conditions; https://github.com)";

export async function fetchNwsPoint(lat: number, lon: number) {
  const res = await fetch(`https://api.weather.gov/points/${lat.toFixed(3)},${lon.toFixed(3)}`, {
    headers: { "User-Agent": UA, Accept: "application/geo+json" },
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error(`NWS points ${res.status}`);
  return res.json();
}

export async function fetchNwsForecast(lat: number, lon: number) {
  const point = await fetchNwsPoint(lat, lon);
  const hourlyUrl = point.properties?.forecastHourly as string | undefined;
  if (!hourlyUrl) return { periods: [], office: null };
  const res = await fetch(hourlyUrl, {
    headers: { "User-Agent": UA, Accept: "application/geo+json" },
    next: { revalidate: 600 },
  });
  if (!res.ok) throw new Error(`NWS hourly ${res.status}`);
  const json = await res.json();
  return {
    periods: (json.properties?.periods ?? []) as {
      startTime: string;
      temperature: number;
      windSpeed: string;
      windDirection: string;
      shortForecast: string;
    }[],
    office: point.properties?.cwa ?? null,
  };
}

function parseWindMph(text: string | undefined) {
  if (!text) return null;
  const nums = [...text.matchAll(/(\d+)/g)].map((m) => Number(m[1]));
  if (!nums.length) return null;
  return Math.max(...nums);
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
