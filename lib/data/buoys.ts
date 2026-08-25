/** NDBC stations near enough to be an honest witness. Not the tide clock. */

export type BuoyKind = "buoy" | "c-man";

export type BuoyMeta = {
  id: string;
  name: string;
  kind: BuoyKind;
  /** One line: where it sits, so nobody treats it as the flat. */
  where: string;
};

const BY_AREA: Record<string, BuoyMeta> = {
  sabine: { id: "42035", name: "Galveston", kind: "buoy", where: "Gulf, east of Galveston — not Sabine Lake" },
  galveston: { id: "42035", name: "Galveston", kind: "buoy", where: "Gulf, ~20 nm east of the jetties — not East Bay" },
  matagorda: { id: "42035", name: "Galveston", kind: "buoy", where: "Nearest reporting Gulf buoy — not East Matagorda" },
  aransas: { id: "ANPT2", name: "Aransas Pass", kind: "c-man", where: "Pass C-MAN — wind at the inlet, not Copano grass" },
  corpus: { id: "ANPT2", name: "Aransas Pass", kind: "c-man", where: "Pass C-MAN — not Packery or Nueces" },
  baffin: { id: "BABT2", name: "Baffin Bay", kind: "c-man", where: "Bay C-MAN — wind on this water, not a Gulf buoy" },
  "lower-laguna": { id: "PTIT2", name: "Port Isabel", kind: "c-man", where: "Brazos Santiago C-MAN — not South Padre surf" },
  venice: { id: "BURL1", name: "Southwest Pass", kind: "c-man", where: "Birdfoot C-MAN — not a pond, not mid-Gulf" },
  "grand-isle": { id: "GISL1", name: "Grand Isle", kind: "c-man", where: "Island C-MAN — Barataria wind, not Venice" },
  calcasieu: { id: "42035", name: "Galveston", kind: "buoy", where: "Nearest reporting Gulf buoy — not Calcasieu Lake" },
  biscayne: { id: "VAKF1", name: "Virginia Key", kind: "c-man", where: "Biscayne C-MAN — not Fowey, not a Gulf buoy" },
  "key-largo": { id: "LONF1", name: "Long Key", kind: "c-man", where: "Keys C-MAN — oceanside wind, not Blackwater" },
  islamorada: { id: "LONF1", name: "Long Key", kind: "c-man", where: "Keys C-MAN — not Channel 5" },
  "florida-bay": { id: "LONF1", name: "Long Key", kind: "c-man", where: "Nearest Keys C-MAN — not Snake Bight" },
  marathon: { id: "SMKF1", name: "Sombrero Key", kind: "c-man", where: "Reef C-MAN — not a Vaca Key tide" },
  "key-west": { id: "SANF1", name: "Sand Key", kind: "c-man", where: "Reef C-MAN — not the harbor well" },
  "boca-grande": { id: "42013", name: "Venice, FL", kind: "buoy", where: "West Florida shelf — not Charlotte Harbor" },
  jupiter: { id: "LKWF1", name: "Lake Worth", kind: "c-man", where: "Inlet C-MAN — not the Loxahatchee trees" },
  "san-juan": { id: "41053", name: "San Juan", kind: "buoy", where: "North coast buoy — not Condado Lagoon" },
  vieques: { id: "41056", name: "Vieques", kind: "buoy", where: "East of the island — not Mosquito Bay" },
  parguera: { id: "42085", name: "South of Ponce", kind: "buoy", where: "Caribbean south of the island — not the mangroves" },
};

export function buoyForArea(areaId: string): BuoyMeta | null {
  return BY_AREA[areaId] ?? null;
}

export function ndbcHref(id: string) {
  return `https://www.ndbc.noaa.gov/station_page.php?station=${encodeURIComponent(id)}`;
}
