import type { SpeciesId } from "@/lib/types";
import raw from "@/data/tpwd-gill-net.json";

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

export const GILL_NET = raw as GillNetFile;

export const LONG_RECORD = {
  program: "TPWD Coastal Fisheries",
  request: "cfish@tpwd.texas.gov",
  hrefs: {
    bcoDmo: GILL_NET.href,
    doi: GILL_NET.doi,
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

export function gillNetFor(areaId: string, month: number) {
  const season = gillNetSeason(month);
  const all = GILL_NET.all[areaId]?.seasons[season.id] ?? null;
  const late = GILL_NET.late[areaId]?.seasons[season.id] ?? null;
  const bay = GILL_NET.all[areaId] ?? null;
  if (!bay || !all) return null;
  return { bay, all, late, season, note: BAY_NOTE[areaId] ?? GILL_NET.protocol };
}

export function gillNetCoast(month: number) {
  const season = gillNetSeason(month);
  const rows = Object.entries(GILL_NET.all)
    .filter(([id]) => id !== "san-antonio")
    .map(([id, bay]) => {
      const block = bay.seasons[season.id];
      const reds = block?.species.find((s) => s.id === "redfish");
      return {
        id,
        system: bay.system,
        sets: block?.sets ?? 0,
        fish: block?.fish ?? 0,
        redsPerSet: reds?.perSet ?? 0,
      };
    })
    .sort((a, b) => b.redsPerSet - a.redsPerSet);
  return { season, rows };
}
