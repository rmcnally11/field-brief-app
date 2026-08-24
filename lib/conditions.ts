import type { Area, Conditions, WeatherNow } from "@/lib/types";
import { fetchLatest } from "@/lib/noaa";
import { fetchNwsForecast, nwsWindNow } from "@/lib/nws";
import { fetchOpenMeteo } from "@/lib/openmeteo";
import { loadTides } from "@/lib/tides";
import { moonPhase } from "@/lib/moon";
import { cardinalFromDeg } from "@/lib/time";

async function weatherFor(area: Area): Promise<WeatherNow> {
  if (area.noaaStation) {
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

  const om = await fetchOpenMeteo(area.lat, area.lon);
  return {
    airF: om.current.temperature_2m,
    windMph: om.current.wind_speed_10m,
    windGustMph: om.current.wind_gusts_10m,
    windDirDeg: om.current.wind_direction_10m,
    windCardinal: cardinalFromDeg(om.current.wind_direction_10m),
    pressureMb: om.current.pressure_msl,
    source: "open-meteo",
    fetchedAt: new Date().toISOString(),
  };
}

export async function loadConditions(area: Area, now = new Date()): Promise<Conditions> {
  const [tides, weather] = await Promise.all([loadTides(area, now), weatherFor(area)]);
  let waterTempF: number | null = null;
  let waterTempSource: string | null = null;
  const tempStation = area.noaaTempStation ?? area.noaaStation;
  if (tempStation) {
    const wt = await fetchLatest(tempStation, "water_temperature");
    if (wt?.value != null) {
      waterTempF = wt.value;
      waterTempSource = `NOAA ${tempStation}`;
    }
  }
  return {
    areaId: area.id,
    waterTempF,
    waterTempSource,
    tides,
    weather,
    moon: moonPhase(now),
  };
}
