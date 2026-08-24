export type TheaterId =
  | "texas"
  | "louisiana"
  | "florida"
  | "bahamas"
  | "mexico"
  | "puerto-rico"
  | "seychelles";

export type ActivityId = "wade" | "skiff" | "kayak" | "fly" | "spin" | "structure" | "offshore";

export type Habitat =
  | "grass-flat"
  | "marsh-drain"
  | "oyster-reef"
  | "pass-jetty"
  | "channel-gut"
  | "sand-dropoff"
  | "hard-flat"
  | "mangrove-edge"
  | "wreck-edge"
  | "creek-bight"
  | "river-delta"
  | "spoil-bank"
  | "serpulid-reef"
  | "structure-piling"
  | "blue-water";

export type TideStage =
  | "incoming"
  | "high-slack"
  | "outgoing"
  | "low-slack";

export type MarkSource = "field-manual" | "public-structure" | "saved-map";

export type SpeciesId =
  | "redfish"
  | "speckled-trout"
  | "flounder"
  | "black-drum"
  | "sheepshead"
  | "snook"
  | "tarpon"
  | "bonefish"
  | "permit"
  | "jacks"
  | "mahi"
  | "sailfish"
  | "tuna"
  | "roosterfish"
  | "gt";

/** Who may own a brief headline. Incidental = noise. Bluewater ≠ a flat. */
export type SpeciesRole = "primary" | "incidental" | "bluewater" | "pacific";

export type Area = {
  id: string;
  theater: TheaterId;
  name: string;
  shortName: string;
  lat: number;
  lon: number;
  timezone: string;
  noaaStation: string | null;
  noaaTempStation?: string | null;
  summary: string;
  /** Sight-fishing flats want cleaner, often smaller range. Marsh wants moving water. */
  tideCharacter: "marsh-current" | "sight-skinny" | "pass-current" | "blue-water";
  meanRangeFt: number;
  modeledTideOffsetHours?: number;
  /** Species that may own this micro-area's headline, in preference order. */
  leadSpecies: SpeciesId[];
  /** When method is offshore — troll, edge, jig. Inshore leads stay on the flat. */
  offshoreLead?: SpeciesId[];
};

export type Spot = {
  id: string;
  areaId: string;
  name: string;
  lat: number;
  lon: number;
  habitat: Habitat;
  activities: ActivityId[];
  species: SpeciesId[];
  source: MarkSource;
  note: string;
  /** Wind directions this shoreline is sheltered from, 0-360. */
  protectedFrom?: { min: number; max: number };
  depth: "skinny" | "mid" | "deep";
  /** USGS GNIS feature ID when the pin is snapped to the gazetteer. */
  gnisId?: number;
};

export type OfficialKind = "gnis" | "enc-wreck" | "fknms-zone" | "access" | "pins" | "saved-map";

export type OfficialMark = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  kind: OfficialKind;
  source: string;
  sourceUrl: string;
  detail: string;
  legal?: boolean;
};

export type Species = {
  id: SpeciesId;
  commonName: string;
  latin: string;
  role: SpeciesRole;
  theaters: TheaterId[];
  peakMonths: number[];
  presentMonths: number[];
  tempMin: number;
  tempMax: number;
  tempOpt: [number, number];
  habitats: Habitat[];
  preferTide: TideStage[];
  flyNote: string;
  spinNote: string;
  why: string;
  regulation: string;
  regulationUrl: string;
};

export type HiLo = {
  time: string;
  height: number;
  type: "H" | "L";
};

export type HourlyTide = {
  time: string;
  height: number;
};

export type AnomalyPoint = {
  time: string;
  predicted: number;
  observed: number;
  anomaly: number;
};

export type TideAnalysis = {
  stage: TideStage;
  rising: boolean;
  predictedNow: number | null;
  observedNow: number | null;
  anomalyFt: number | null;
  anomalySeries: AnomalyPoint[];
  rangeTodayFt: number | null;
  nextHiLo: HiLo[];
  hourly: HourlyTide[];
  source: "noaa" | "modeled";
};

export type SkyKind = "clear" | "clouds" | "rain" | "storm";

export type WeatherNow = {
  airF: number | null;
  windMph: number | null;
  windGustMph: number | null;
  windDirDeg: number | null;
  windCardinal: string | null;
  pressureMb: number | null;
  /** 0–100. NWS POP or Open-Meteo probability. */
  precipChance: number | null;
  /** Inches this hour when Open-Meteo answered. */
  precipIn: number | null;
  /** NWS shortForecast or a sky phrase. */
  sky: string | null;
  wx: SkyKind | null;
  source: "noaa" | "nws" | "open-meteo";
  fetchedAt: string;
};

export type Conditions = {
  areaId: string;
  waterTempF: number | null;
  waterTempSource: string | null;
  tides: TideAnalysis;
  weather: WeatherNow;
  moon: {
    phase: number;
    name: string;
    illumination: number;
    springNeap: "spring" | "neap" | "mid";
  };
};

export type SpotPick = {
  spot: Spot;
  score: number;
  why: string[];
};

export type WindowPick = {
  start: string;
  end: string;
  label: string;
  score: number;
  why: string;
};

export type SpeciesPick = {
  species: Species;
  score: number;
  inPlay: boolean;
  closed: boolean;
  why: string;
};

export type BriefKind = "today" | "forecast" | "astronomical";

export type Briefing = {
  area: Area;
  activity: ActivityId | "all";
  generatedAt: string;
  /** Local Y-M-D this brief is built for. */
  forDate: string;
  kind: BriefKind;
  confidence: "high" | "medium" | "low";
  overall: number;
  headline: string;
  where: SpotPick[];
  when: WindowPick[];
  why: string[];
  species: SpeciesPick[];
  conditions: Conditions;
  warnings: string[];
  /** TPWD / GLO / NPS public launches and drive-on corridors near this water. */
  access: OfficialMark[];
  /** FKNMS no-take polygons and other legal closures in the box. */
  legal: OfficialMark[];
  /** Zones in the GIS box beyond the six shown on the brief. */
  extraLegal?: number;
};

export type CalendarTide = {
  type: "H" | "L";
  time: string;
  height: number;
};

export type CalendarDay = {
  date: string;
  score: number;
  confidence: "observed" | "forecast" | "astronomical";
  drivers: string[];
  bestWindow: string | null;
  /** Score high enough that this is a book-the-day window for this micro-area. */
  amazing: boolean;
  /** Best remaining dry day this month with a real wind forecast. */
  yolo: boolean;
  moon: {
    name: string;
    glyph: string;
    phase: number;
    illumination: number;
    springNeap: "spring" | "neap" | "mid";
  };
  tides: CalendarTide[];
  tideRangeFt: number | null;
  windMph: number | null;
  precipChance: number | null;
  wx: SkyKind | null;
};
