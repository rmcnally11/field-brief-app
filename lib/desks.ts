export const DESKS = [
  {
    theater: "texas" as const,
    areaId: "galveston",
    desk: "Texas water",
    kicker: "Wind is the tide",
  },
  {
    theater: "louisiana" as const,
    areaId: "venice",
    desk: "Louisiana water",
    kicker: "River is the tide",
  },
  {
    theater: "florida" as const,
    areaId: "islamorada",
    desk: "Florida water",
    kicker: "Educated fish, short windows",
  },
  {
    theater: "bahamas" as const,
    areaId: "andros",
    desk: "Bahamas water",
    kicker: "Bonefish country",
  },
  {
    theater: "mexico" as const,
    areaId: "ascension",
    desk: "Mexico water",
    kicker: "Two oceans",
  },
  {
    theater: "puerto-rico" as const,
    areaId: "san-juan",
    desk: "Puerto Rico water",
    kicker: "Urban tarpon, then the drop",
  },
  {
    theater: "seychelles" as const,
    areaId: "alphonse",
    desk: "Seychelles water",
    kicker: "GT country",
  },
] as const;

export function letterDeskForTheater(theater: string) {
  return DESKS.find((d) => d.theater === theater)?.areaId;
}

export function deskChoiceLabel(desk: (typeof DESKS)[number]) {
  const place =
    desk.areaId === "san-juan"
      ? "San Juan"
      : desk.areaId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return `${desk.desk.replace(" water", "")} — ${place}`;
}
