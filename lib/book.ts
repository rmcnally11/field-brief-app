import type { ActivityId, Briefing, CalendarDay, SkyKind, SpeciesId, TheaterId, TideStage } from "@/lib/types";
import { SPECIES } from "@/lib/data/species";

export type CatchFate = "released" | "kept" | "both";

export const BOOK_STORAGE_KEY = "otw-book-v1";
export const BOOK_EVENT = "otw-book";
export const BOOK_UNLOCK_KEY = "otw-book-open";
export const RHYME_MIN = 4;

export type CatchSnapshot = {
  takenAt: string;
  forDate: string;
  areaId: string;
  theater: string;
  shortName: string;
  score: number;
  kind: string;
  confidence: string;
  windMph: number | null;
  windCardinal: string | null;
  wx: SkyKind | null;
  sky: string | null;
  precipChance: number | null;
  moonName: string;
  moonPhase: number;
  illumination: number;
  springNeap: "spring" | "neap" | "mid";
  tideStage: TideStage;
  tideRangeFt: number | null;
  waterTempF: number | null;
  pressureMb: number | null;
  pressureTrendMb: number | null;
  headline: string;
};

export type CatchEntry = {
  id: string;
  createdAt: string;
  when: string;
  speciesId: SpeciesId;
  speciesName: string;
  count: number;
  inches: number | null;
  fate: CatchFate;
  activity: ActivityId | "all";
  waterNote: string;
  notes: string;
  snapshot: CatchSnapshot;
};

export type BookState = {
  handle: string;
  lockHash: string | null;
  catches: CatchEntry[];
};

export type RhymeHit = {
  date: string;
  catchId: string;
  speciesName: string;
  points: number;
  reasons: string[];
};

export function emptyBook(): BookState {
  return { handle: "", lockHash: null, catches: [] };
}

export type LogContext = {
  snapshot: CatchSnapshot;
  activity: ActivityId | "all";
  theater: TheaterId;
  inPlay: { id: SpeciesId; commonName: string }[];
};

export function logContextFromBriefing(briefing: Briefing): LogContext {
  return {
    snapshot: snapshotFromBriefing(briefing),
    activity: briefing.activity,
    theater: briefing.area.theater,
    inPlay: briefing.species
      .filter((s) => s.inPlay && !s.closed)
      .map((s) => ({ id: s.species.id, commonName: s.species.commonName })),
  };
}

export function snapshotFromBriefing(briefing: Briefing): CatchSnapshot {
  const w = briefing.conditions.weather;
  return {
    takenAt: new Date().toISOString(),
    forDate: briefing.forDate,
    areaId: briefing.area.id,
    theater: briefing.area.theater,
    shortName: briefing.area.shortName,
    score: briefing.overall,
    kind: briefing.kind,
    confidence: briefing.confidence,
    windMph: w.windMph,
    windCardinal: w.windCardinal,
    wx: w.wx,
    sky: w.sky,
    precipChance: w.precipChance,
    moonName: briefing.conditions.moon.name,
    moonPhase: briefing.conditions.moon.phase,
    illumination: briefing.conditions.moon.illumination,
    springNeap: briefing.conditions.moon.springNeap,
    tideStage: briefing.conditions.tides.stage,
    tideRangeFt: briefing.conditions.tides.rangeTodayFt,
    waterTempF: briefing.conditions.waterTempF,
    pressureMb: w.pressureMb,
    pressureTrendMb: w.pressureTrendMb,
    headline: briefing.headline,
  };
}

export function newCatchId() {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function speciesName(id: SpeciesId) {
  return SPECIES.find((s) => s.id === id)?.commonName ?? id;
}

export function speciesForTheater(theater: TheaterId) {
  return SPECIES.filter((s) => s.theaters.includes(theater) && s.role === "primary");
}

function moonFamily(name: string, phase?: number) {
  const n = name.toLowerCase();
  if (n.includes("new")) return "new";
  if (n.includes("full")) return "full";
  if (n.includes("first") || n.includes("wax")) return "wax";
  if (n.includes("last") || n.includes("third") || n.includes("wane")) return "wane";
  if (phase != null) {
    if (phase < 0.08 || phase > 0.92) return "new";
    if (phase >= 0.42 && phase <= 0.58) return "full";
    if (phase < 0.5) return "wax";
    return "wane";
  }
  return "other";
}

function skyFamily(wx: SkyKind | null) {
  if (wx === "rain" || wx === "storm") return "wet";
  if (wx === "clear" || wx === "clouds") return "dry";
  return null;
}

/** How much this calendar day rhymes with one catch. Same glass, not the same fish. */
export function rhymePoints(snap: CatchSnapshot, day: CalendarDay): { points: number; reasons: string[] } {
  let points = 0;
  const reasons: string[] = [];

  if (snap.windMph != null && day.windMph != null) {
    const diff = Math.abs(snap.windMph - day.windMph);
    if (diff <= 4) {
      points += 2;
      reasons.push(`wind ${Math.round(day.windMph)} mph`);
    } else if (diff <= 8) {
      points += 1;
      reasons.push(`wind close (${Math.round(day.windMph)} mph)`);
    }
  }

  const snapSky = skyFamily(snap.wx);
  const daySky = skyFamily(day.wx);
  if (snap.wx && day.wx && snap.wx === day.wx) {
    points += 2;
    reasons.push(day.wx === "clear" ? "clear" : day.wx);
  } else if (snapSky && daySky && snapSky === daySky) {
    points += 1;
    reasons.push(daySky === "dry" ? "dry sky" : "wet sky");
  }

  if (snap.precipChance != null && day.precipChance != null) {
    const bothDry = snap.precipChance < 30 && day.precipChance < 30;
    const bothWet = snap.precipChance >= 40 && day.precipChance >= 40;
    if (bothDry || bothWet) {
      points += 1;
      reasons.push(bothDry ? "low rain odds" : "rain in the forecast");
    }
  }

  if (snap.springNeap !== "mid" && snap.springNeap === day.moon.springNeap) {
    points += 2;
    reasons.push(`${day.moon.springNeap} tide`);
  }

  const snapMoon = moonFamily(snap.moonName, snap.moonPhase);
  const dayMoon = moonFamily(day.moon.name, day.moon.phase);
  if (snapMoon !== "other" && snapMoon === dayMoon) {
    points += 1;
    reasons.push(day.moon.name);
  }

  if (snap.tideRangeFt != null && day.tideRangeFt != null) {
    if (Math.abs(snap.tideRangeFt - day.tideRangeFt) <= 0.4) {
      points += 1;
      reasons.push(`Δ ${day.tideRangeFt.toFixed(1)} ft`);
    }
  }

  if (Math.abs(snap.score - day.score) <= 1.2) {
    points += 1;
    reasons.push(`score ${day.score.toFixed(1)}`);
  }

  return { points, reasons: reasons.slice(0, 4) };
}

export function bestRhyme(day: CalendarDay, catches: CatchEntry[], areaId: string): RhymeHit | null {
  let best: RhymeHit | null = null;
  for (const entry of catches) {
    if (entry.snapshot.areaId !== areaId) continue;
    if (entry.snapshot.forDate === day.date) continue;
    const { points, reasons } = rhymePoints(entry.snapshot, day);
    if (points < RHYME_MIN) continue;
    if (!best || points > best.points) {
      best = {
        date: day.date,
        catchId: entry.id,
        speciesName: entry.speciesName,
        points,
        reasons,
      };
    }
  }
  return best;
}

export function wroteOn(day: CalendarDay, catches: CatchEntry[], areaId: string) {
  return catches.filter((c) => c.snapshot.areaId === areaId && (c.snapshot.forDate === day.date || c.when.slice(0, 10) === day.date));
}

export function parseBook(raw: unknown): BookState {
  if (!raw || typeof raw !== "object") return emptyBook();
  const o = raw as Partial<BookState>;
  const handle = typeof o.handle === "string" ? o.handle.trim().slice(0, 32) : "";
  const lockHash = typeof o.lockHash === "string" && o.lockHash.length > 8 ? o.lockHash : null;
  const catches = Array.isArray(o.catches) ? o.catches.filter(isCatchEntry) : [];
  return { handle, lockHash, catches };
}

function isCatchEntry(value: unknown): value is CatchEntry {
  if (!value || typeof value !== "object") return false;
  const c = value as CatchEntry;
  return typeof c.id === "string" && typeof c.speciesName === "string" && c.snapshot != null && typeof c.snapshot.areaId === "string";
}

export async function hashLock(phrase: string) {
  const data = new TextEncoder().encode(`otw-book|${phrase}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
