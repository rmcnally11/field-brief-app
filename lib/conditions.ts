import type { Area, Conditions, WeatherNow } from "@/lib/types";
import { fetchLatest } from "@/lib/noaa";
import { fetchNwsForecast, nwsWindAt, nwsWindNow } from "@/lib/nws";
import { fetchOpenMeteo } from "@/lib/openmeteo";
import { loadTides } from "@/lib/tides";
import { moonPhase } from "@/lib/moon";
import { cardinalFromDeg, ymdInZone } from "@/lib/time";

function openMeteoAt(
  om: Awaited<ReturnType<typeof fetchOpenMeteo>>,
  at: Date,
): WeatherNow {
  const target = at.getTime();
  let best = 0;
  let bestDelta = Infinity;
  om.hourly.time.forEach((t, i) => {
    const delta = Math.abs(new Date(t).getTime() - target);
    if (delta < bestDelta) {
      best = i;
      bestDelta = delta;
    }
  });
  const useHour = bestDelta < 18 * 3600000;
  return {
    airF: useHour ? om.hourly.temperature_2m[best] : om.current.temperature_2m,
    windMph: useHour ? om.hourly.wind_speed_10m[best] : om.current.wind_speed_10m,
    windGustMph: useHour ? om.hourly.wind_gusts_10m[best] : om.current.wind_gusts_10m,
    windDirDeg: useHour ? om.hourly.wind_direction_10m[best] : om.current.wind_direction_10m,
    windCardinal: cardinalFromDeg(
      useHour ? om.hourly.wind_direction_10m[best] : om.current.wind_direction_10m,
    ),
    pressureMb: om.current.pressure_msl,
    source: "open-meteo",
    fetchedAt: new Date().toISOString(),
  };
}

async function weatherFor(area: Area, at: Date, today: boolean): Promise<WeatherNow> {
  const modeledOcean =
    area.theater === "bahamas" || area.theater === "mexico" || area.theater === "seychelles";

  if (today && area.noaaStation) {
    const [noaaWind, nws] = await Promise.allSettled([
      fetchLatest(area.noaaStation, "wind"),
      fetchNwsForecast(area.lat, area.lon),
    ]);
    const wind = noaaWind.status === "fulfilled" ? noaaWind.value : null;
    const nwsVal = nws.status === "fulfilled" ? nws.value : null;
    const nwsNow = nwsVal ? nwsWindNow(nwsVal.periods) : null;
    if (wind?.speed != null) {
      return {
        airF: nwsNow?.airF ?? null,
        windMph: wind.speed,
        windGustMph: wind.gust,
        windDirDeg: wind.dir,
        windCardinal: cardinalFromDeg(wind.dir),
        pressureMb: null,
        source: "noaa",
        fetchedAt: new Date().toISOString(),
      };
    }
    if (nwsNow) {
      return {
        airF: nwsNow.airF,
        windMph: nwsNow.windMph,
        windGustMph: null,
        windDirDeg: nwsNow.windDirDeg,
        windCardinal: nwsNow.windCardinal,
        pressureMb: null,
        source: "nws",
        fetchedAt: new Date().toISOString(),
      };
    }
  }

  if (!modeledOcean && area.noaaStation) {
    try {
      const nws = await fetchNwsForecast(area.lat, area.lon);
      const atHour = nwsWindAt(nws.periods, at);
      if (atHour?.windMph != null) {
        return {
          airF: atHour.airF,
          windMph: atHour.windMph,
          windGustMph: null,
          windDirDeg: atHour.windDirDeg,
          windCardinal: atHour.windCardinal,
          pressureMb: null,
          source: "nws",
          fetchedAt: new Date().toISOString(),
        };
      }
    } catch {
      // fall through
    }
  }

  try {
    const om = await fetchOpenMeteo(area.lat, area.lon);
    return openMeteoAt(om, at);
  } catch {
    return {
      airF: null,
      windMph: null,
      windGustMph: null,
      windDirDeg: null,
      windCardinal: null,
      pressureMb: null,
      source: modeledOcean ? "open-meteo" : "nws",
      fetchedAt: new Date().toISOString(),
    };
  }
}

export async function loadConditions(area: Area, at = new Date()): Promise<Conditions> {
  const today = ymdInZone(at, area.timezone) === ymdInZone(new Date(), area.timezone);
  const tempStation = area.noaaTempStation ?? area.noaaStation;
  const [tides, weather, wt] = await Promise.all([
    loadTides(area, at, { observe: today }),
    weatherFor(area, at, today),
    today && tempStation ? fetchLatest(tempStation, "water_temperature") : Promise.resolve(null),
  ]);
  let waterTempF: number | null = null;
  let waterTempSource: string | null = null;
  if (wt?.value != null && tempStation) {
    waterTempF = wt.value;
    waterTempSource = `NOAA ${tempStation}`;
  }
  return {
    areaId: area.id,
    waterTempF,
    waterTempSource,
    tides,
    weather,
    moon: moonPhase(at),
  };
}
