/** TPWD Coastal Fisheries long record. Not a live gauge. Not a bite. */

export type LongRecordBay = {
  system: string;
  /** Gill-net / bag-seine bay name in the TPWD grid. */
  note: string;
};

const BAY_BY_AREA: Record<string, LongRecordBay> = {
  sabine: { system: "Sabine Lake", note: "Border estuary. Sampling here started later than the mid-coast." },
  galveston: { system: "Galveston Bay", note: "Trinity, East, West, and Christmas in the same TPWD bay system." },
  matagorda: { system: "Matagorda Bay", note: "East Matagorda is a different pocket. Do not read it as Port O’Connor." },
  aransas: { system: "Aransas Bay", note: "Copano and Redfish sit in this system. San Antonio Bay is the next grid west — we do not have a desk there." },
  corpus: { system: "Corpus Christi Bay", note: "Packery and the pass. Not Upper Laguna." },
  baffin: { system: "Upper Laguna Madre", note: "Baffin / Land Cut. Clear water. Not Corpus." },
  "lower-laguna": { system: "Lower Laguna Madre", note: "South Bay and Brazos Santiago. Not Baffin." },
};

export const LONG_RECORD = {
  program: "TPWD Coastal Fisheries",
  independent:
    "Standardized gill nets (since 1975), bag seines (1977), bay trawls (1982), oyster dredges (1984), gulf trawls (1985). Every set: species, count, length, salinity, temperature, dissolved oxygen, grid.",
  creel:
    "Coastal creel since 1974 (current form since 1983). Boat ramps and wet slips, Port Arthur to Port Isabel. Trip-ending interviews — harvest across the dock, not fish still in the water.",
  gillNetSeasons: "Gill nets go in twice a year: spring (April–June) and fall (September–November). Forty-five overnight sets per bay per season. They are not a daily feed.",
  publicExtract:
    "Self-serve historical extracts (HARC / OBIS-USA / ScienceBase) run roughly 1975–2008. A BCO-DMO gill-net compilation covers 1986–2018. Years after that live at TPWD.",
  mrip: "Texas is the only Gulf state not in NOAA MRIP for private boats. Federal recreational catch tables have a Texas-shaped hole. Go to TPWD.",
  request: "cfish@tpwd.texas.gov",
  hrefs: {
    bcoDmo: "https://www.bco-dmo.org/dataset/828794",
    doi: "https://doi.org/10.26008/1912/bco-dmo.828794.1",
    scienceBase: "https://www.sciencebase.gov/catalog/items?q=TPWD%20HARC%20Texas%20Coastal%20Fisheries",
    tpwd: "https://tpwd.texas.gov/landwater/water/habitats/coastal/",
    request: "mailto:cfish@tpwd.texas.gov",
  },
} as const;

export function longRecordBay(areaId: string): LongRecordBay | null {
  return BAY_BY_AREA[areaId] ?? null;
}

export function gillNetSeason(month: number): {
  id: "spring" | "fall" | "off";
  label: string;
} {
  if (month >= 4 && month <= 6) return { id: "spring", label: "Spring gill-net season (April–June)" };
  if (month >= 9 && month <= 11) return { id: "fall", label: "Fall gill-net season (September–November)" };
  if (month >= 7 && month <= 8) {
    return { id: "off", label: "Nets are out until September. Summer is bag seines and trawls, not gill nets." };
  }
  return { id: "off", label: "Nets are out until April. Winter is the other gears, not gill nets." };
}
