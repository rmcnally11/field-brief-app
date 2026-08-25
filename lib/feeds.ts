import type { Area, Conditions } from "@/lib/types";
import { buoyForArea } from "@/lib/data/buoys";
import { riverSiteFor } from "@/lib/rivers";
import { salinityCoast, salinitySiteFor } from "@/lib/salinity";
import { habCovers } from "@/lib/hab";
import { sargassumCovers } from "@/lib/sargassum";

export type FeedState = "live" | "modeled" | "quiet" | "none";

export type FeedNote = {
  id: string;
  state: FeedState;
  label: string;
};

export function feedNotes(area: Area, conditions: Conditions): FeedNote[] {
  const notes: FeedNote[] = [];

  if (conditions.tides.source === "noaa") {
    notes.push({ id: "tide", state: "live", label: area.noaaStation ? `Tide · NOAA ${area.noaaStation}` : "Tide · NOAA" });
  } else if (area.noaaStation) {
    notes.push({ id: "tide", state: "modeled", label: `Tide · modeled — NOAA ${area.noaaStation} quiet` });
  } else {
    notes.push({ id: "tide", state: "modeled", label: "Tide · modeled — no NOAA gauge" });
  }

  const buoy = buoyForArea(area.id);
  if (conditions.buoy) {
    notes.push({ id: "buoy", state: "live", label: `NDBC ${conditions.buoy.id} · witness` });
  } else if (buoy) {
    notes.push({ id: "buoy", state: "quiet", label: `NDBC ${buoy.id} quiet` });
  } else {
    notes.push({ id: "buoy", state: "none", label: "No NDBC on this desk" });
  }

  if (salinityCoast(area.theater)) {
    const well = salinitySiteFor(area.id);
    if (conditions.salinity) {
      notes.push({
        id: "salinity",
        state: "live",
        label: `Salinity · ${conditions.salinity.kind === "river" ? "river well" : "bay well"}`,
      });
    } else if (well) {
      notes.push({ id: "salinity", state: "quiet", label: "Salinity probe quiet or stale" });
    } else {
      notes.push({ id: "salinity", state: "none", label: "No salinity probe on this desk" });
    }
  }

  if (area.theater === "texas" || area.theater === "louisiana") {
    const river = riverSiteFor(area.id);
    if (conditions.river) {
      notes.push({ id: "river", state: "live", label: `River · USGS ${conditions.river.site}` });
    } else if (river) {
      notes.push({ id: "river", state: "quiet", label: `${river.river} gauge quiet` });
    } else {
      notes.push({ id: "river", state: "none", label: "No river gauge on this desk" });
    }
  }

  if (habCovers(area)) {
    if (conditions.hab) {
      notes.push({
        id: "hab",
        state: "live",
        label: conditions.hab.hot ? `K. brevis · ${conditions.hab.level}` : "K. brevis · background",
      });
    } else {
      notes.push({ id: "hab", state: "quiet", label: "Red-tide check failed — not all-clear" });
    }
  }

  if (sargassumCovers(area)) {
    if (conditions.sargassum) {
      notes.push({
        id: "sargassum",
        state: "live",
        label: conditions.sargassum.elevated ? "Sargassum · elevated" : "Sargassum · background",
      });
    } else {
      notes.push({ id: "sargassum", state: "quiet", label: "Sargassum check failed — not all-clear" });
    }
  }

  const expectTemp = Boolean(area.noaaTempStation ?? area.noaaStation);
  if (conditions.waterTempF != null) {
    notes.push({ id: "temp", state: "live", label: "Water temp · gauge" });
  } else if (expectTemp) {
    notes.push({ id: "temp", state: "quiet", label: "Water temp quiet" });
  }

  return notes;
}

export function coastExpected(area: Area) {
  return habCovers(area) || sargassumCovers(area) || salinityCoast(area.theater);
}
