import type { SpeciesId } from "@/lib/types";
import rawNets from "@/data/tpwd-gill-net.json";
import rawDock from "@/data/tpwd-creel.json";

export type GillNetSpeciesRow = {
  id: SpeciesId;
  name: string;
  catch: number;
  perSet: number;
  setsPresent: number;
  pctSets: number;
};

export type GillNetSeasonBlock = {
  sets: number;
  fish: number;
  yearStart: number;
  yearEnd: number;
  species: GillNetSpeciesRow[];
};

export type GillNetBay = {
  system: string;
  majorArea: number;
  sets: number;
  fish: number;
  seasons: Partial<Record<"spring" | "fall", GillNetSeasonBlock>>;
};

export type GillNetFile = {
  source: string;
  doi: string;
  href: string;
  gear: string;
  protocol: string;
  yearStart: number;
  yearEnd: number;
  published: string;
  cadence: string;
  all: Record<string, GillNetBay>;
  late: Record<string, GillNetBay>;
};

export type CreelSpeciesRow = {
  id: SpeciesId;
  name: string;
  water: "bay" | "gulf";
  catch: number;
  interviews: number;
  perInterview: number;
  pctInterviews: number;
  perAnglerHour: number;
  meanInches: number | null;
};

export type CreelSeasonBlock = {
  interviews: number;
  fish: number;
  yearStart: number;
  yearEnd: number;
  species: CreelSpeciesRow[];
};

export type CreelBay = {
  system: string;
  majorArea: number;
  interviews: number;
  fish: number;
  seasons: Partial<Record<"high" | "low", CreelSeasonBlock>>;
};

export type CreelFile = {
  source: string;
  doi: string;
  href: string;
  program: string;
  gear: string;
  protocol: string;
  yearStart: number;
  yearEnd: number;
  published: string;
  cadence: string;
  all: Record<string, CreelBay>;
  late: Record<string, CreelBay>;
};

export const GILL_NET = rawNets as GillNetFile;
export const CREEL = rawDock as CreelFile;

export const LONG_RECORD = {
  program: "TPWD Coastal Fisheries",
  request: "cfish@tpwd.texas.gov",
  hrefs: {
    bcoDmo: GILL_NET.href,
    doi: GILL_NET.doi,
    creel: CREEL.href,
    creelProgram: CREEL.program,
    request: "mailto:cfish@tpwd.texas.gov",
  },
} as const;

const BAY_NOTE: Record<string, string> = {
  sabine: "Border estuary. Sampling here started later than the mid-coast.",
  galveston: "Trinity, East, West, and Christmas in the same TPWD bay system.",
  matagorda: "West Matagorda / Port O’Connor side of the TPWD grid. East Matagorda is not this count.",
  aransas: "Copano and Redfish sit in this system. San Antonio Bay is the next grid west.",
  corpus: "Packery and the pass. Not Upper Laguna.",
  baffin: "Baffin / Land Cut. Clear water. Not Corpus.",
  "lower-laguna": "South Bay and Brazos Santiago. Not Baffin.",
};

export function longRecordBay(areaId: string) {
  const bay = GILL_NET.all[areaId];
  if (!bay) return null;
  return { system: bay.system, note: BAY_NOTE[areaId] ?? GILL_NET.protocol, areaId };
}

export function gillNetSeason(month: number): {
  id: "spring" | "fall";
  inSeason: boolean;
  label: string;
} {
  if (month >= 4 && month <= 6) {
    return { id: "spring", inSeason: true, label: "Spring nets are in (April–June)" };
  }
  if (month >= 9 && month <= 11) {
    return { id: "fall", inSeason: true, label: "Fall nets are in (September–November)" };
  }
  if (month >= 7 && month <= 8) {
    return { id: "fall", inSeason: false, label: "Nets are out until September. Showing the fall record." };
  }
  return { id: "spring", inSeason: false, label: "Nets are out until April. Showing the spring record." };
}

export type NetSeasonId = "spring" | "fall";
export type DockSeasonId = "high" | "low";
export type RecordEra = "all" | "late";
export type SharedFishId = "redfish" | "speckled-trout";

export const SHARED_FISH: { id: SharedFishId; name: string }[] = [
  { id: "redfish", name: "Redfish" },
  { id: "speckled-trout", name: "Speckled trout" },
];

export const NET_SEASON_LABEL: Record<NetSeasonId, string> = {
  spring: "Spring nets (April–June)",
  fall: "Fall nets (September–November)",
};

export const DOCK_SEASON_LABEL: Record<DockSeasonId, string> = {
  high: "High-use dock (May 15–Nov 20)",
  low: "Low-use dock (Nov 21–May 14)",
};

export function gillNetAt(areaId: string, season: NetSeasonId) {
  const all = GILL_NET.all[areaId]?.seasons[season] ?? null;
  const late = GILL_NET.late[areaId]?.seasons[season] ?? null;
  const bay = GILL_NET.all[areaId] ?? null;
  if (!bay || !all) return null;
  return { bay, all, late, note: BAY_NOTE[areaId] ?? GILL_NET.protocol };
}

export function gillNetFor(areaId: string, month: number) {
  const season = gillNetSeason(month);
  const picked = gillNetAt(areaId, season.id);
  if (!picked) return null;
  return { ...picked, season };
}

export function gillNetCoastAt(season: NetSeasonId, era: RecordEra, speciesId: SpeciesId) {
  const file = era === "late" ? GILL_NET.late : GILL_NET.all;
  const rows = Object.entries(file)
    .filter(([id]) => id !== "san-antonio")
    .map(([id, bay]) => {
      const block = bay.seasons[season];
      const fish = block?.species.find((s) => s.id === speciesId);
      return {
        id,
        system: bay.system,
        sets: block?.sets ?? 0,
        fish: fish?.catch ?? 0,
        rate: fish?.perSet ?? 0,
        pct: fish?.pctSets ?? 0,
      };
    })
    .sort((a, b) => b.rate - a.rate);
  return rows;
}

export function gillNetCoast(month: number) {
  const season = gillNetSeason(month);
  const rows = gillNetCoastAt(season.id, "all", "redfish").map((row) => ({
    ...row,
    redsPerSet: row.rate,
  }));
  return { season, rows };
}

export function creelSeason(month: number): {
  id: "high" | "low";
  inSeason: boolean;
  label: string;
} {
  if (month >= 6 && month <= 10) {
    return { id: "high", inSeason: true, label: "High-use dock (May 15–Nov 20)" };
  }
  if (month === 5) {
    return { id: "high", inSeason: true, label: "High-use starts May 15. Showing the high-use record." };
  }
  if (month === 11) {
    return { id: "high", inSeason: true, label: "High-use ends Nov 20. Showing the high-use record." };
  }
  return { id: "low", inSeason: true, label: "Low-use dock (Nov 21–May 14)" };
}

export function creelAt(areaId: string, season: DockSeasonId) {
  const all = CREEL.all[areaId]?.seasons[season] ?? null;
  const late = CREEL.late[areaId]?.seasons[season] ?? null;
  const bay = CREEL.all[areaId] ?? null;
  if (!bay || !all) return null;
  return { bay, all, late, note: BAY_NOTE[areaId] ?? CREEL.protocol };
}

export function creelFor(areaId: string, month: number) {
  const season = creelSeason(month);
  const picked = creelAt(areaId, season.id);
  if (!picked) return null;
  return { ...picked, season };
}

export function creelCoastAt(season: DockSeasonId, era: RecordEra, speciesId: SpeciesId) {
  const file = era === "late" ? CREEL.late : CREEL.all;
  const rows = Object.entries(file)
    .filter(([id]) => id !== "san-antonio")
    .map(([id, bay]) => {
      const block = bay.seasons[season];
      const fish = block?.species.find((s) => s.id === speciesId);
      return {
        id,
        system: bay.system,
        interviews: fish?.interviews ?? 0,
        fish: fish?.catch ?? 0,
        rate: fish?.perInterview ?? 0,
        pct: fish?.pctInterviews ?? 0,
        inches: fish?.meanInches ?? null,
      };
    })
    .sort((a, b) => b.rate - a.rate);
  return rows;
}

export function creelCoast(month: number) {
  const season = creelSeason(month);
  const rows = creelCoastAt(season.id, "all", "speckled-trout").map((row) => ({
    ...row,
    troutPerInterview: row.rate,
  }));
  return { season, rows };
}

export function texasRecordBays() {
  return Object.entries(GILL_NET.all)
    .filter(([id]) => id !== "san-antonio")
    .map(([id, bay]) => ({ id, system: bay.system }));
}
