import type {
  ActivityId,
  Area,
  Briefing,
  Conditions,
  Habitat,
  OfficialMark,
  SpeciesPick,
  Spot,
  SpotPick,
  TideStage,
  WindowPick,
} from "@/lib/types";
import { SPECIES, SPECIES_BY_ID } from "@/lib/data/species";
import { leadsFor } from "@/lib/data/areas";
import { spotsForArea } from "@/lib/data/spots";
import {
  flounderClosed,
  louisianaFlounderClosed,
  snookClosedOn,
} from "@/lib/data/species";
import { clockParts, hourInZone } from "@/lib/time";
import { composeHeadline, pickHeadlineSpecies } from "@/lib/headline";

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function thermalScore(temp: number | null, opt: [number, number], min: number, max: number) {
  if (temp == null) return 0.55;
  if (temp < min || temp > max) return 0.15;
  if (temp >= opt[0] && temp <= opt[1]) return 1;
  if (temp < opt[0]) return clamp((temp - min) / (opt[0] - min), 0, 1);
  return clamp((max - temp) / (max - opt[1]), 0, 1);
}

function monthIn(list: number[], month: number) {
  return list.includes(month);
}

function habitatTideFit(habitat: Habitat, stage: TideStage) {
  const table: Record<Habitat, Partial<Record<TideStage, number>>> = {
    "marsh-drain": { outgoing: 1, incoming: 0.75, "high-slack": 0.35, "low-slack": 0.2 },
    "grass-flat": { incoming: 1, "high-slack": 0.7, outgoing: 0.55, "low-slack": 0.25 },
    "hard-flat": { incoming: 1, outgoing: 0.75, "high-slack": 0.55, "low-slack": 0.3 },
    "oyster-reef": { incoming: 0.85, outgoing: 0.85, "high-slack": 0.7, "low-slack": 0.55 },
    "pass-jetty": { incoming: 0.9, outgoing: 1, "high-slack": 0.4, "low-slack": 0.45 },
    "channel-gut": { outgoing: 1, incoming: 0.7, "low-slack": 0.65, "high-slack": 0.4 },
    "sand-dropoff": { outgoing: 0.9, incoming: 0.75, "low-slack": 0.5, "high-slack": 0.4 },
    "structure-piling": { incoming: 0.9, outgoing: 0.9, "high-slack": 0.55, "low-slack": 0.5 },
    "mangrove-edge": { outgoing: 1, incoming: 0.75, "high-slack": 0.4, "low-slack": 0.35 },
    "wreck-edge": { outgoing: 0.95, incoming: 0.85, "low-slack": 0.55, "high-slack": 0.4 },
    "creek-bight": { outgoing: 0.95, incoming: 0.8, "high-slack": 0.45, "low-slack": 0.4 },
    "river-delta": { outgoing: 0.85, incoming: 0.7, "high-slack": 0.4, "low-slack": 0.35 },
    "spoil-bank": { incoming: 0.85, outgoing: 0.75, "high-slack": 0.55, "low-slack": 0.35 },
    "serpulid-reef": { incoming: 0.8, outgoing: 0.8, "high-slack": 0.7, "low-slack": 0.6 },
    "blue-water": { incoming: 0.8, outgoing: 0.8, "high-slack": 0.65, "low-slack": 0.6 },
  };
  return table[habitat]?.[stage] ?? 0.5;
}

function windFishability(mph: number | null, activity: ActivityId | "all") {
  if (mph == null) return 0.65;
  const cap =
    activity === "fly" || activity === "kayak"
      ? 16
      : activity === "wade"
        ? 20
        : activity === "offshore"
          ? 28
          : 22;
  if (mph < 4) return activity === "fly" ? 0.72 : 0.7; // slick: spooky for sight
  if (mph <= 12) return 1;
  if (mph <= cap) return 0.7;
  if (mph <= cap + 6) return 0.4;
  return 0.15;
}

function timeOfDayScore(hour: number, month: number, waterTemp: number | null) {
  const hot = (waterTemp ?? 75) >= 84 || month === 7 || month === 8;
  const cold = (waterTemp ?? 70) <= 58 || month === 12 || month === 1;
  if (hot) {
    if (hour < 8 || hour >= 17) return 1;
    if (hour < 10 || hour >= 16) return 0.7;
    return 0.25;
  }
  if (cold) {
    if (hour >= 11 && hour <= 16) return 1;
    if (hour >= 9 && hour <= 17) return 0.7;
    return 0.35;
  }
  if (hour >= 6 && hour <= 10) return 1;
  if (hour >= 16 && hour <= 19) return 0.9;
  return 0.55;
}

function isClosed(speciesId: string, area: Area, now: Date) {
  if (speciesId === "flounder" && area.theater === "texas") {
    return flounderClosed(now, area.timezone);
  }
  if (speciesId === "flounder" && area.theater === "louisiana") {
    return louisianaFlounderClosed(now, area.timezone);
  }
  if (speciesId === "snook") {
    return snookClosedOn(area.id, area.theater, now, area.timezone);
  }
  return false;
}

export function scoreSpecies(
  area: Area,
  conditions: Conditions,
  now: Date,
  activity: ActivityId | "all" = "all",
): SpeciesPick[] {
  const month = clockParts(now, area.timezone).month;
  const water = conditions.waterTempF;
  const leads = leadsFor(area, activity);
  const offshore = activity === "offshore";
  return SPECIES.filter((s) => s.theaters.includes(area.theater)).map((s) => {
    const closed = isClosed(s.id, area, now);
    const present = monthIn(s.presentMonths, month);
    const peak = monthIn(s.peakMonths, month);
    const season = !present ? 0.1 : peak ? 1 : 0.55;
    const thermal = thermalScore(water, s.tempOpt, s.tempMin, s.tempMax);
    const tideFit = Math.max(...s.preferTide.map((t) => (t === conditions.tides.stage ? 1 : 0.55)));
    let score = 10 * (0.4 * season + 0.35 * thermal + 0.25 * tideFit);
    if (closed) score *= 0.35;
    if (s.role === "incidental") score = Math.min(score, 5.8);
    if (s.role === "bluewater" && !offshore) score *= 0.42;
    if (s.role === "pacific" && area.theater !== "mexico") score = 0;
    const bits: string[] = [];
    if (s.role === "incidental") bits.push("Bycatch and beach noise — not the reason you came.");
    if (s.role === "bluewater") {
      bits.push(
        offshore
          ? "Bluewater. Weedlines, humps, and the edge — this is the method."
          : "Bluewater. Weedlines, humps, and the edge — not this flat or marsh. Switch method to Offshore.",
      );
    }
    if (s.role === "pacific") {
      bits.push(
        area.theater === "mexico"
          ? "Pacific / Sea of Cortez. Baja, not the Gulf."
          : "Pacific fish. Not on this atlas.",
      );
    }
    if (closed) bits.push("Closed to harvest — still swims, do not keep.");
    if (peak) bits.push("In peak season for this water.");
    else if (present) bits.push("Present, not peak.");
    else bits.push("Off-season here.");
    if (water != null) {
      if (water > s.tempMax - 2) bits.push(`Water ${water.toFixed(0)}°F is the hot edge for this fish.`);
      else if (water < s.tempMin + 3) bits.push(`Water ${water.toFixed(0)}°F is the cold edge.`);
      else if (water >= s.tempOpt[0] && water <= s.tempOpt[1]) bits.push(`Water ${water.toFixed(0)}°F sits in the feeding window.`);
    }
    if (s.preferTide.includes(conditions.tides.stage)) bits.push(`This tide stage (${conditions.tides.stage.replace("-", " ")}) matches how they hunt.`);
    const canHeadline =
      leads.includes(s.id) &&
      (s.role === "primary" ||
        (s.role === "pacific" && area.theater === "mexico") ||
        (s.role === "bluewater" && (offshore || area.leadSpecies.includes(s.id))));
    return {
      species: s,
      score: Number(clamp(score, 0, 10).toFixed(1)),
      inPlay: score >= 5 && present && canHeadline,
      closed,
      why: bits.join(" "),
    };
  }).sort((a, b) => b.score - a.score);
}

function spotMatchesActivity(spot: Spot, activity: ActivityId | "all") {
  if (activity === "all") return true;
  return spot.activities.includes(activity);
}

function wreckMarkToSpot(mark: OfficialMark, area: Area): Spot {
  return {
    id: mark.id,
    areaId: area.id,
    name: mark.name,
    lat: mark.lat,
    lon: mark.lon,
    habitat: "wreck-edge",
    activities: ["skiff", "spin", "fly", "offshore"],
    species:
      area.theater === "florida"
        ? ["permit", "tarpon", "mahi", "tuna"]
        : ["redfish", "speckled-trout", "sheepshead"],
    source: "public-structure",
    note: `${mark.detail || "Charted wreck / obstruction."} NOAA ENC — surveyed position, not a navigation chart.`,
    depth: "deep",
  };
}

export function pickSpots(
  area: Area,
  conditions: Conditions,
  activity: ActivityId | "all",
  species: SpeciesPick[],
  wrecks: OfficialMark[] = [],
): SpotPick[] {
  const inPlay = new Set(species.filter((s) => s.inPlay).map((s) => s.species.id));
  const wind = conditions.weather.windMph;
  const windDir = conditions.weather.windDirDeg;
  const water = conditions.waterTempF;
  const hot = (water ?? 75) >= 84;
  const cold = (water ?? 70) <= 58;

  const catalog = [
    ...spotsForArea(area.id, activity),
    ...wrecks
      .filter((w) => {
        const n = w.name.trim();
        if (!n || n === "Charted wreck") return false;
        if (/test/i.test(n) || /dangerous wreck/i.test(n)) return false;
        return true;
      })
      .slice(0, 8)
      .map((w) => wreckMarkToSpot(w, area)),
  ];

  return catalog
    .filter((spot) => {
      if (!spotMatchesActivity(spot, activity)) return false;
      const n = `${spot.name} ${spot.note}`.toLowerCase();
      const offshoreMark =
        n.includes("troll") ||
        n.includes("color change") ||
        n.includes("blue water") ||
        n.includes("hump") ||
        spot.habitat === "blue-water";
      if (activity === "offshore") return offshoreMark || spot.activities.includes("offshore");
      if (offshoreMark) return false;
      return true;
    })
    .map((spot) => {
      const why: string[] = [];
      let score = 4;
      const tideFit = habitatTideFit(spot.habitat, conditions.tides.stage);
      score += 3 * tideFit;
      why.push(
        `${spot.habitat.replace("-", " ")} on a ${conditions.tides.stage.replace("-", " ")} tide is a ${tideFit >= 0.8 ? "classic" : tideFit >= 0.55 ? "workable" : "secondary"} match.`,
      );

      const speciesHit = spot.species.filter((id) => inPlay.has(id));
      score += Math.min(2, speciesHit.length * 0.7);
      if (speciesHit.length) {
        why.push(
          `In-play: ${speciesHit.map((id) => SPECIES_BY_ID[id]?.commonName ?? id).join(", ")}.`,
        );
      }

      if (hot && spot.depth === "deep") {
        score += 1.2;
        why.push("Water is hot — deeper guts, passes, and shade hold oxygen and fish.");
      }
      if (hot && spot.depth === "skinny" && clockParts(new Date(), area.timezone).hour > 10 && clockParts(new Date(), area.timezone).hour < 16) {
        score -= 1.4;
        why.push("Skinny water at midday in this heat is a walk, not a hunt.");
      }
      if (cold && (spot.depth === "deep" || spot.habitat === "channel-gut" || spot.habitat === "oyster-reef")) {
        score += 1.1;
        why.push("Cold water: fish slide to guts, shell, and the remaining water.");
      }

      const anomaly = conditions.tides.anomalyFt;
      const gulfMarsh =
        (area.theater === "texas" || area.theater === "louisiana") && area.tideCharacter === "marsh-current";
      if (anomaly != null && anomaly < -0.4 && (spot.depth === "deep" || spot.habitat === "channel-gut" || spot.habitat === "marsh-drain")) {
        score += 1;
        why.push(
          gulfMarsh
            ? `Observed water is ${anomaly.toFixed(1)} ft below the tide table — wind is pulling water out.`
            : `Observed water is ${anomaly.toFixed(1)} ft below the tide table — sit the remaining guts.`,
        );
      }
      if (anomaly != null && anomaly > 0.4 && (spot.habitat === "grass-flat" || spot.habitat === "hard-flat" || spot.habitat === "marsh-drain")) {
        score += 0.8;
        why.push(
          gulfMarsh
            ? `Observed water is ${anomaly.toFixed(1)} ft above the table — the marsh and flats are wetter than printed.`
            : `Observed water is ${anomaly.toFixed(1)} ft above the table — the banks are wetter than printed.`,
        );
      }

      if (wind != null && wind >= 15 && spot.protectedFrom && windDir != null) {
        const { min, max } = spot.protectedFrom;
        const sheltered = min <= max ? windDir >= min && windDir <= max : windDir >= min || windDir <= max;
        if (sheltered) {
          score += 1;
          why.push("Leeward of this wind.");
        }
      }
      if (activity === "fly" && wind != null && wind > 16) {
        score -= 1.2;
        why.push("Fly suffers in this wind — tighten the loop or pick spin.");
      }
      if (activity === "wade" && spot.depth === "deep") {
        score -= 0.8;
      }
      if (activity === "skiff" && conditions.tides.stage === "low-slack" && spot.depth === "skinny") {
        score -= 0.7;
        why.push("Skiff may be off plane / off the flat at dead low.");
      }
      if (
        activity !== "offshore" &&
        area.tideCharacter === "sight-skinny" &&
        (spot.habitat === "wreck-edge" || spot.habitat === "blue-water") &&
        spot.depth === "deep"
      ) {
        score -= 2.4;
        why.push("Offshore wreck or hump — secondary to the flat on this brief.");
      }
      if (activity === "offshore") {
        if (spot.habitat === "blue-water" || spot.habitat === "wreck-edge") {
          score += 1.6;
          why.push("Troll, edge, or jig water — this is the method.");
        }
        if (spot.depth === "skinny") {
          score -= 2.2;
          why.push("Skinny water. Not the offshore brief.");
        }
      }

      return { spot, score: Number(clamp(score, 0, 10).toFixed(1)), why };
    })
    .sort((a, b) => b.score - a.score);
}

export function pickWindows(
  area: Area,
  conditions: Conditions,
  activity: ActivityId | "all",
  now = new Date(),
): WindowPick[] {
  const hourly = conditions.tides.hourly;
  if (hourly.length < 4) return [];
  const windows: WindowPick[] = [];
  const parsed = hourly.map((h) => ({
    ...h,
    at: new Date(h.time.includes("T") ? `${h.time}:00Z` : `${h.time.replace(" ", "T")}:00Z`),
  }));

  for (let i = 1; i < parsed.length - 1; i++) {
    const slope = parsed[i].height - parsed[i - 1].height;
    const moving = Math.abs(slope) >= 0.03;
    if (!moving) continue;
    const hour = hourInZone(parsed[i].at, area.timezone);
    const tod = timeOfDayScore(hour, clockParts(parsed[i].at, area.timezone).month, conditions.waterTempF);
    const wind = conditions.weather.windMph;
    const w = windFishability(wind, activity);
    if (parsed[i].at < now) continue;
    const score = clamp(10 * (0.45 * (moving ? 1 : 0.3) + 0.35 * tod + 0.2 * w), 1, 10);
    windows.push({
      start: parsed[i].time,
      end: parsed[Math.min(i + 2, parsed.length - 1)].time,
      label: slope > 0 ? "Incoming water" : "Outgoing water",
      score: Number(score.toFixed(1)),
      why:
        tod > 0.8
          ? "Moving water in the right part of the day."
          : "Water is moving, but the clock is against you — heat or dark.",
    });
  }

  const collapsed: WindowPick[] = [];
  for (const w of windows) {
    const last = collapsed[collapsed.length - 1];
    if (last && last.label === w.label && w.score >= 5) {
      last.end = w.end;
      last.score = Math.max(last.score, w.score);
    } else if (w.score >= 5.2) {
      collapsed.push({ ...w });
    }
  }
  return collapsed.slice(0, 5);
}

export function buildBriefing(
  area: Area,
  conditions: Conditions,
  activity: ActivityId | "all",
  now = new Date(),
  official?: { wrecks?: OfficialMark[]; zones?: OfficialMark[]; access?: OfficialMark[] },
): Omit<Briefing, "generatedAt"> {
  const leads = leadsFor(area, activity);
  const species = scoreSpecies(area, conditions, now, activity)
    .filter((s) => {
      if (activity === "offshore") {
        return (
          s.species.role === "bluewater" ||
          s.species.role === "pacific" ||
          s.species.role === "incidental" ||
          leads.includes(s.species.id)
        );
      }
      if (s.species.role === "pacific") return area.theater === "mexico" && leads.includes(s.species.id);
      if (s.species.role === "bluewater") return area.leadSpecies.includes(s.species.id);
      return s.species.role === "primary" || s.species.role === "incidental";
    })
    .filter((s) => s.species.role === "incidental" || leads.includes(s.species.id))
    .sort((a, b) => {
      if (a.species.role !== b.species.role) {
        const rank = { primary: 0, pacific: 1, bluewater: 2, incidental: 3 } as const;
        return rank[a.species.role] - rank[b.species.role];
      }
      return b.score - a.score;
    });
  const where = pickSpots(area, conditions, activity, species, official?.wrecks ?? []).slice(0, 6);
  const when = pickWindows(area, conditions, activity, now);
  const month = clockParts(now, area.timezone).month;
  const water = conditions.waterTempF;
  const wind = conditions.weather.windMph;
  const why: string[] = [];
  const warnings: string[] = [];

  const modeledNote =
    conditions.tides.source !== "modeled"
      ? " from NOAA"
      : area.noaaStation
        ? " (modeled — the NOAA gauge did not answer)"
        : area.theater === "bahamas" || area.theater === "mexico"
          ? " (modeled — no NOAA gauge on this water)"
          : " (modeled — no NOAA gauge on this water)";
  why.push(`Tide is ${conditions.tides.stage.replace("-", " ")}${modeledNote}.`);
  if (conditions.tides.anomalyFt != null) {
    const a = conditions.tides.anomalyFt;
    const signed = `${a > 0 ? "+" : ""}${a.toFixed(2)}`;
    if (Math.abs(a) >= 0.35) {
      if (area.theater === "texas" || area.theater === "louisiana") {
        why.push(
          `On this coast the wind often outruns the printed tide. Observed water is ${signed} ft versus the prediction.`,
        );
      } else if (area.theater === "florida") {
        why.push(
          `The gauge is ${signed} ft off the predicted table — read the water, not just the printout.`,
        );
      } else if (area.theater === "mexico" || area.theater === "bahamas") {
        why.push(
          `The model is ${signed} ft off the harmonic table. Treat it as setup, not a guarantee.`,
        );
      }
    } else {
      why.push("Observed water is close to the astronomical prediction — the table is telling the truth today.");
    }
  }
  if (water != null) {
    why.push(`Water ${water.toFixed(1)}°F. ${water >= 86 ? "Heat is the locator: early, late, deeper." : water <= 58 ? "Cold is the locator: guts, mud, midday sun." : "Temperature is in a workable band."}`);
  }
  if (wind != null) {
    if (activity === "offshore") {
      why.push(
        `Wind ${wind.toFixed(0)} mph ${conditions.weather.windCardinal ?? ""}. ${
          wind <= 18
            ? "Troll and jig are on."
            : wind <= 28
              ? "A workday on a real boat. Fly-and-teaser gets ugly."
              : "Stay tied. This is not a skiff number."
        }`,
      );
    } else {
      why.push(
        `Wind ${wind.toFixed(0)} mph ${conditions.weather.windCardinal ?? ""}. ${wind <= 12 ? "Castable. Sight-fishing is on if the sun is out." : wind <= 18 ? "Work the leeward shore. Fly gets harder." : "This is a spin / structure / stay-home call."}`,
      );
    }
  }
  why.push(
    `${conditions.moon.name} moon — ${conditions.moon.springNeap} tide range. ${
      area.tideCharacter === "sight-skinny"
        ? "Sight water often prefers a moderate range and clean water over a huge spring."
        : area.tideCharacter === "blue-water"
          ? "Offshore wants bait and current more than a skinny tide."
          : "Marsh and passes usually want the extra current of a spring."
    }`,
  );

  if (water != null && water >= 88) warnings.push("Extreme water temperature. Fish stress quickly — keep them wet, or don't boat them.");
  if (wind != null && wind >= (activity === "offshore" ? 30 : 22)) {
    warnings.push("Small-craft wind. The score is not a safety brief.");
  }
  if (area.theater === "mexico") {
    warnings.push("Mexico requires a CONAPESCA license. Sian Ka’an, Contoy, and Espíritu Santo are park or biosphere water — verify before you fish.");
  }
  if (flounderClosed(now, area.timezone) && area.theater === "texas") {
    warnings.push("Texas flounder season is closed Nov 1–Dec 14. Catch-and-release only if you hook one.");
  }
  if (louisianaFlounderClosed(now, area.timezone) && area.theater === "louisiana") {
    warnings.push("Louisiana flounder is typically closed Oct 15–Nov 30. Verify LDWF before you keep one.");
  }
  if (snookClosedOn(area.id, area.theater, now, area.timezone)) {
    warnings.push(
      area.id === "boca-grande"
        ? "Charlotte Harbor / Southwest snook harvest is typically closed May 1–Sep 30 and Dec 1–end of Feb. Verify FWC."
        : "Snook are typically closed to harvest on the SE/Atlantic coast in this window. Verify FWC.",
    );
  }
  const zones = [...(official?.zones ?? [])].sort((a, b) => {
    const da = Math.hypot(a.lat - area.lat, (a.lon - area.lon) * Math.cos((area.lat * Math.PI) / 180));
    const db = Math.hypot(b.lat - area.lat, (b.lon - area.lon) * Math.cos((area.lat * Math.PI) / 180));
    return da - db;
  });
  const legal = zones.slice(0, 6);
  const extraLegal = Math.max(0, zones.length - legal.length);
  if (legal.length) {
    const names = legal.slice(0, 3).map((z) => z.name).join(", ");
    warnings.push(
      `FKNMS no-take water in this box: ${names}${extraLegal ? ` + ${extraLegal} more on the map` : ""}. The red polygons are the legal source — do not fish them.`,
    );
  }

  const top = pickHeadlineSpecies(area, species, leads);
  const overall = clamp(
    0.4 * (where[0]?.score ?? 4) +
      0.3 * (top?.score ?? 4) +
      0.3 * (when[0]?.score ?? 4),
    1,
    10,
  );

  const headline = composeHeadline(area, top, conditions);

  let confidence: Briefing["confidence"] = "medium";
  if (conditions.tides.source === "noaa" && water != null && wind != null) confidence = "high";
  if (conditions.tides.source === "modeled") confidence = "medium";
  if (water == null && conditions.tides.source === "modeled") confidence = "low";

  void month;
  return {
    area,
    activity,
    confidence,
    overall: Number(overall.toFixed(1)),
    headline,
    where,
    when,
    why,
    species,
    conditions,
    warnings,
    access: (official?.access ?? []).slice(0, 6),
    legal,
    extraLegal,
  };
}

export function activityWindPenalty(activity: ActivityId | "all", windMph: number | null) {
  return windFishability(windMph, activity);
}

export { timeOfDayScore, habitatTideFit };
