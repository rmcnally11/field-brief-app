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
import { SPECIES } from "@/lib/data/species";
import { spotsForArea } from "@/lib/data/spots";
import { flounderClosed, seFloridaSnookClosed } from "@/lib/data/species";
import { clockParts, hourInZone } from "@/lib/time";

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
  };
  return table[habitat]?.[stage] ?? 0.5;
}

function windFishability(mph: number | null, activity: ActivityId | "all") {
  if (mph == null) return 0.65;
  const cap = activity === "fly" || activity === "kayak" ? 16 : activity === "wade" ? 20 : 22;
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
  if (speciesId === "snook" && area.theater === "florida") {
    return seFloridaSnookClosed(now, area.timezone);
  }
  return false;
}

export function scoreSpecies(
  area: Area,
  conditions: Conditions,
  now: Date,
): SpeciesPick[] {
  const month = clockParts(now, area.timezone).month;
  const water = conditions.waterTempF;
  return SPECIES.filter((s) => s.theaters.includes(area.theater)).map((s) => {
    const closed = isClosed(s.id, area, now);
    const present = monthIn(s.presentMonths, month);
    const peak = monthIn(s.peakMonths, month);
    const season = !present ? 0.1 : peak ? 1 : 0.55;
    const thermal = thermalScore(water, s.tempOpt, s.tempMin, s.tempMax);
    const tideFit = Math.max(...s.preferTide.map((t) => (t === conditions.tides.stage ? 1 : 0.55)));
    let score = 10 * (0.4 * season + 0.35 * thermal + 0.25 * tideFit);
    if (closed) score *= 0.35;
    const bits: string[] = [];
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
    return {
      species: s,
      score: Number(clamp(score, 0, 10).toFixed(1)),
      inPlay: score >= 5 && present,
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
    activities: ["skiff", "spin", "fly"],
    species:
      area.theater === "florida"
        ? ["permit", "tarpon", "jacks"]
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
    ...spotsForArea(area.id),
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
    .filter((spot) => spotMatchesActivity(spot, activity))
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
      if (speciesHit.length) why.push(`In-play: ${speciesHit.join(", ")}.`);

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
      if (anomaly != null && anomaly < -0.4 && (spot.depth === "deep" || spot.habitat === "channel-gut" || spot.habitat === "marsh-drain")) {
        score += 1;
        why.push(`Observed water is ${anomaly.toFixed(1)} ft below the tide table — wind is pulling water out.`);
      }
      if (anomaly != null && anomaly > 0.4 && (spot.habitat === "grass-flat" || spot.habitat === "hard-flat" || spot.habitat === "marsh-drain")) {
        score += 0.8;
        why.push(`Observed water is ${anomaly.toFixed(1)} ft above the table — the marsh and flats are wetter than printed.`);
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
  const species = scoreSpecies(area, conditions, now);
  const where = pickSpots(area, conditions, activity, species, official?.wrecks ?? []).slice(0, 6);
  const when = pickWindows(area, conditions, activity, now);
  const month = clockParts(now, area.timezone).month;
  const water = conditions.waterTempF;
  const wind = conditions.weather.windMph;
  const why: string[] = [];
  const warnings: string[] = [];

  why.push(
    `Tide is ${conditions.tides.stage.replace("-", " ")}${conditions.tides.source === "modeled" ? " (modeled — no NOAA gauge on this island)" : " from NOAA"}.`,
  );
  if (conditions.tides.anomalyFt != null) {
    const a = conditions.tides.anomalyFt;
    if (Math.abs(a) >= 0.35) {
      why.push(
        `On this coast the wind often outruns the printed tide. Observed water is ${a > 0 ? "+" : ""}${a.toFixed(2)} ft versus the prediction.`,
      );
    } else {
      why.push("Observed water is close to the astronomical prediction — the table is telling the truth today.");
    }
  }
  if (water != null) {
    why.push(`Water ${water.toFixed(1)}°F. ${water >= 86 ? "Heat is the locator: early, late, deeper." : water <= 58 ? "Cold is the locator: guts, mud, midday sun." : "Temperature is in a workable band."}`);
  }
  if (wind != null) {
    why.push(
      `Wind ${wind.toFixed(0)} mph ${conditions.weather.windCardinal ?? ""}. ${wind <= 12 ? "Castable. Sight-fishing is on if the sun is out." : wind <= 18 ? "Work the leeward shore. Fly gets harder." : "This is a spin / structure / stay-home call."}`,
    );
  }
  why.push(
    `${conditions.moon.name} moon — ${conditions.moon.springNeap} tide range. ${
      area.tideCharacter === "sight-skinny"
        ? "Sight water often prefers a moderate range and clean water over a huge spring."
        : "Marsh and passes usually want the extra current of a spring."
    }`,
  );

  if (water != null && water >= 88) warnings.push("Extreme water temperature. Fish stress quickly — keep them wet, or don't boat them.");
  if (wind != null && wind >= 22) warnings.push("Small-craft wind. The score is not a safety brief.");
  if (flounderClosed(now, area.timezone) && area.theater === "texas") {
    warnings.push("Texas flounder season is closed Nov 1–Dec 14. Catch-and-release only if you hook one.");
  }
  if (seFloridaSnookClosed(now, area.timezone) && area.theater === "florida") {
    warnings.push("Snook are typically closed to harvest on the SE/Atlantic coast in this month. Verify FWC.");
  }
  const zones = official?.zones ?? [];
  if (zones.length) {
    const names = zones.slice(0, 3).map((z) => z.name).join(", ");
    warnings.push(
      `FKNMS no-take water in this box: ${names}${zones.length > 3 ? ` + ${zones.length - 3} more` : ""}. The red polygons are the legal source — do not fish them.`,
    );
  }

  const top = species[0];
  const overall = clamp(
    0.4 * (where[0]?.score ?? 4) +
      0.3 * (top?.score ?? 4) +
      0.3 * (when[0]?.score ?? 4),
    1,
    10,
  );

  const headline = `${top?.species.commonName ?? "Fish"} ${top && top.score >= 6.5 ? "should be the day" : "are in the mix"} — ${
    conditions.tides.stage === "incoming"
      ? "push onto the flat with the flood"
      : conditions.tides.stage === "outgoing"
        ? "stage on drains, edges, and passes"
        : "wait for the water to start moving"
  }.`;

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
    legal: zones,
  };
}

export function activityWindPenalty(activity: ActivityId | "all", windMph: number | null) {
  return windFishability(windMph, activity);
}

export { timeOfDayScore, habitatTideFit };
