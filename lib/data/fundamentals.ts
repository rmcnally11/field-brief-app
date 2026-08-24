import type { ActivityId, Habitat, SpeciesId, TheaterId } from "@/lib/types";
import { AREAS } from "@/lib/data/areas";
import { SPECIES, flounderClosed, seFloridaSnookClosed } from "@/lib/data/species";

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export type WaterTypeId =
  | "fly"
  | "spin"
  | "sight"
  | "wade"
  | "skiff"
  | "structure"
  | "marsh"
  | "skinny";

export const WATER_TYPES: {
  id: WaterTypeId;
  label: string;
  short: string;
  activities?: ActivityId[];
  habitats?: Habitat[];
  species: SpeciesId[];
  essay: string;
}[] = [
  {
    id: "fly",
    label: "Fly",
    short: "Fly",
    activities: ["fly"],
    species: ["redfish", "speckled-trout", "snook", "tarpon", "bonefish", "permit"],
    essay:
      "Fly when the day allows it. That is the whole doctrine. Eight-weight for tails and bones, nine for permit, ten-plus when a tarpon is the job. Wind is the tax — above about 16 mph the presentation gets ugly and the honest move is the spinning rod. Lead the fish, put the fly where he is going, and do not trout-set a trout. Keys fish have seen every Gotcha in the catalog. Bahamas will forgive a sloppy landing Texas and Biscayne will not.",
  },
  {
    id: "spin",
    label: "Spin",
    short: "Spin",
    activities: ["spin"],
    species: ["redfish", "speckled-trout", "flounder", "black-drum", "sheepshead", "snook", "tarpon", "permit"],
    essay:
      "Spin is not a consolation prize. It is what you do when the wind, the depth, or the fish does not allow the fly. Gold spoon in grass. Soft plastic when they will not come up. Live crab for a Keys permit that has refused every merkin. A 30-pound black drum in a Galveston channel is a day that does not owe you a strip-set. Carry both. Decide on the water.",
  },
  {
    id: "sight",
    label: "Sight fishing",
    short: "Sight",
    habitats: ["hard-flat", "grass-flat", "sand-dropoff"],
    species: ["bonefish", "permit", "redfish", "speckled-trout"],
    essay:
      "Sight water wants cleaner, often smaller range and a sun angle you can read. Lower Laguna and Baffin are the Texas classrooms — inches of water, serpulid rock, a tail that looks like a redfish until it is a drum. Keys oceanside is permit and bones on banks that get a boat every hour. Bahamas is the same game with more fish and fewer excuses. Polarized glasses are not optional. If you cannot see the bottom, you are fishing yesterday's rumor.",
  },
  {
    id: "wade",
    label: "Wade",
    short: "Wade",
    activities: ["wade"],
    species: ["redfish", "speckled-trout", "bonefish"],
    essay:
      "Feet on the flat. You need water you can stand in and a tide that does not strand you. Texas mid-coast grass and the Laguna spoil banks are the classic walk. Grand Bahama and the Abaco Marls are the thinking wade — pancake sand, long shots, no engine to spook the school. Do not wade a Keys oceanside bank you have not watched for a full cycle. The water leaves.",
  },
  {
    id: "skiff",
    label: "Skiff",
    short: "Skiff",
    activities: ["skiff"],
    species: ["permit", "bonefish", "tarpon", "redfish", "snook"],
    essay:
      "Pole the skinny, run the guts. A skiff loses a flat at dead low and loses the fish when you run across the bank they are using. Islamorada and Biscayne are poling theaters with boat traffic as a species. Flamingo is a different boat — backcountry, color, wind. Texas Rockport and Baffin are the same idea in grass and rock. Idle before you think you should.",
  },
  {
    id: "structure",
    label: "Jetty / rocks",
    short: "Rocks",
    activities: ["structure"],
    habitats: ["pass-jetty", "structure-piling", "oyster-reef"],
    species: ["sheepshead", "black-drum", "redfish", "flounder"],
    essay:
      "Granite, pilings, passes. Midday is legal — sheep face the tide and pick. Fall jetty bulls are a Texas event, not a rumor. Flounder sit the sand drains on the outgoing. This is spinning-rod country with a short, ugly leader if you insist on a fly. Do not invent a wreck as a honey hole. Named structure only, and the fish still have to be in season.",
  },
  {
    id: "marsh",
    label: "Marsh & drains",
    short: "Marsh",
    habitats: ["marsh-drain", "mangrove-edge", "creek-bight"],
    species: ["redfish", "speckled-trout", "flounder", "snook"],
    essay:
      "Marsh wants moving water. Flood the grass, drain the creek. On the Texas coast the wind often moves more water than the printed tide — observed minus predicted is the real story. Sabine and Galveston dump after a blow. Flamingo is the Florida version: reds and snook in the backcountry, not on the oceanside. If the table says incoming and the marsh is emptying, believe the marsh.",
  },
  {
    id: "skinny",
    label: "Skinny water",
    short: "Skinny",
    habitats: ["hard-flat", "grass-flat", "serpulid-reef"],
    species: ["bonefish", "permit", "redfish", "speckled-trout"],
    essay:
      "Inches. Baffin, Lower Laguna, Keys oceanside banks, Andros west-side sand. Tide character is sight-skinny: a huge range can empty the flat; a dead-small range can leave fish in a bathtub with no refresh. Push too far and you are walking the boat home. Trophy trout on serpulid rock is not the same as a school of 3-pound bones — same depth, different fish, different mistake.",
  },
];

export const REGION_ESSAYS: Record<
  TheaterId,
  { title: string; dek: string; body: string }
> = {
  texas: {
    title: "Texas — wind is the tide",
    dek: "Seven working bays, one printed table that is often a suggestion.",
    body: "This coast runs from a brackish border estuary at Sabine to hypersaline rock at Baffin and the clear classroom of the Lower Laguna. The main event is the red. Trout live a foot deeper in the same bays. Flounder own the fall nights at the passes until the November closure. Winter belongs to drum and sheep on mud and granite. Corpus still sees a tarpon along the beach in mid-summer — Port A was once Tarpon, Texas — but that is a bay-boat job, not the skinny skiff. Do not fish Baffin like Rockport. Do not invent Rollover Pass; it was filled in 2019. Birds are GPS for trout. A hard norther empties the shoreline and stacks fish in the guts. Fly when the morning is honest. The gold spoon is what you came for when it is not.",
  },
  florida: {
    title: "Miami & the Keys — educated fish, short windows",
    dek: "Oceanside is bones and permit. Backcountry is reds and snook. Do not mix the two.",
    body: "Biscayne is the north end of the grand-slam stage and the most watched water in the hemisphere. Islamorada is the mecca — Channel 5 current, oceanside banks, wrecks for permit that have seen every crab. Flamingo is a different country: Snake Bight and the banks west of the dock, color and wind deciding the day, reds that do not live on the oceanside. Marathon and Key West stretch the same idea south — more tarpon, longer runs, summer showers that can switch a flat on once they pass. Best permit window is often an hour and a half to three hours into the incoming. Snook close in the summer spawn on the SE/Atlantic side. Tarpon peak in the spring migration, then thin. Treat bones and permit as catch-and-release. The FKNMS polygons on the map are law, not decoration.",
  },
  bahamas: {
    title: "Bahamas — bonefish country",
    dek: "Winter singles. Summer schools. Permit on the west sides when it lays down.",
    body: "Andros is the capital — west-side white sand, schools by the acre, double-digit singles in the creeks, tarpon in the bights, permit May through October on the west side and outer cays. Abaco is Marls and ocean cays; verify what is actually running after Dorian. Grand Bahama is the thinking wade, a town to sleep in, big singles on foot. Eleuthera and the Exuma edge take more weather and give you more permit. Tides here are a modeled lunar clock, labeled as such — there is no NOAA gauge on these islands. Flats licensing has been tightening; verify before you wade. Jacks will find you. They are not why you booked the week.",
  },
};

export const MONTH_THEATER: Record<number, Record<TheaterId, string>> = {
  1: {
    texas:
      "Gut month. Black drum and sheep on mud and granite. Trout slide to holes after a norther. Midday sun is legal. Reds still eat; they just will not tail in a north wind.",
    florida:
      "Cold fronts thin the bones, then hand you a bluebird day. Snook are typically closed on the SE/Atlantic side. Winter sail live offshore — not on the flat.",
    bahamas:
      "Single-bone season. Fewer fish, bigger shoulders, longer leaders. Dress for the front. The school of 3-pounders is a summer story.",
  },
  2: {
    texas:
      "Still winter. Sheep and drum until the water climbs. Early reds start to show on mud flats on the warm afternoons. Do not trust a February trout on the grass at dawn.",
    florida:
      "Bones and permit if the front missed you. Tarpon are a rumor that becomes a fish in March. Backcountry reds do not care what month the calendar thinks it is.",
    bahamas:
      "The last honest month of winter singles. Book the wade. West-side permit are still early.",
  },
  3: {
    texas:
      "The coast wakes up. Reds and trout both peak. Water is finally in the window. Windy, but the fish are on the grass again.",
    florida:
      "Permit season opens its shoulders. Bones still around. Tarpon start to show on the oceanside and in the harbor.",
    bahamas:
      "Transition. Winter singles mix with the first schools. A good month to have both a shrimp and a crab tied.",
  },
  4: {
    texas:
      "Prime. Reds tailing, trout on bait, water not yet a bathtub. This is the Texas month people move for.",
    florida:
      "Tarpon migration. Permit still in play. Bones on the banks before the boats. Snook on the mangrove points.",
    bahamas:
      "Bones through the spring. Tarpon in the bights. The week starts to feel like the photograph.",
  },
  5: {
    texas:
      "Still excellent if you beat the heat. First light on the grass, then deeper. Jacks arrive as noise.",
    florida:
      "Tarpon peak. Permit on wrecks and banks. Afternoon storms start rewriting the flat. Bones get harder in the glare.",
    bahamas:
      "West-side permit turn on. Bones still school. This is the grand-slam calendar month if the wind allows the fly.",
  },
  6: {
    texas:
      "Heat is the clock. Trout leave the flat at midday. Reds work drains at dawn. Corpus beach tarpon is a different boat.",
    florida:
      "Snook typically closed on the SE/Atlantic spawn. Tarpon still around. Early bones, then the storm. Do not harvest a snook because the brief scored an 8.",
    bahamas:
      "Summer schools of 3–5 lb bones. Permit on the west sides. Bring the buff and the 8-weight and go early.",
  },
  7: {
    texas:
      "Bathtub bays. Night and first-light reds. Trout in guts and over deep grass. Beach tarpon if you already know the water.",
    florida:
      "Snook still closed. Summer showers can switch a Key West flat on once they clear. Permit on the incoming if you can stand the glare.",
    bahamas:
      "Schoolie bones and resident tarpon. The lodge week is a heat-management problem as much as a fish problem.",
  },
  8: {
    texas:
      "Same heat, slightly shorter days. Trout still deep. Reds on the first moving water. Flounder are a September story — do not force them.",
    florida:
      "Last of the spawn closure for snook. Bones at first light. Afternoon thunder is the tide you did not order.",
    bahamas:
      "Summer pattern holds. Smaller packs, honest shots, west-side permit if it lays down. Fly in the morning. Shade at noon.",
  },
  9: {
    texas:
      "The coast exhales. Reds peak again. Trout come back up. Jetty bulls start to show. Water finally loses a few degrees.",
    florida:
      "Snook reopen on the typical SE calendar — verify FWC the morning you keep one. Permit still around. Tarpon thin.",
    bahamas:
      "Bones and permit both still in play. The first cool nights are a rumor that becomes a fish in November.",
  },
  10: {
    texas:
      "The best month many years. Reds, trout, and the flounder run to the Gulf. Nights at the passes. Measure every flatfish — the closure is coming.",
    florida:
      "Snook and reds in the backcountry. Bones on cooler fronts. Permit if you still want the argument.",
    bahamas:
      "Permit taper on the west sides. Bones start to look like winter again. A lovely shoulder week.",
  },
  11: {
    texas:
      "Flounder closed the entire month. Do not keep one. Reds still peak. Trout on the last warm grass. Drum show up with the first real front.",
    florida:
      "Bones like the cooler water. Backcountry reds. Tarpon are mostly gone. Dress for the front that was a Texas story yesterday.",
    bahamas:
      "Winter singles begin. This is why people book Andros in November. Long leaders, soft landings, fewer boats.",
  },
  12: {
    texas:
      "Flounder stay closed through the 14th. Drum and sheep take the granite. Trout in the guts. A Christmas cold snap is a plan, not a cancellation.",
    florida:
      "Bones if the front missed you. Sailfish live on the edge — not in this brief. Backcountry still holds reds.",
    bahamas:
      "Peak winter bonefishing. Schools give way to singles. Permit are a maybe. You came for the grey ghost.",
  },
};

export function theaterLabel(theater: TheaterId) {
  if (theater === "florida") return "Miami & the Keys";
  if (theater === "texas") return "Texas";
  return "Bahamas";
}

export function waterTypeById(id: string | null | undefined) {
  return WATER_TYPES.find((t) => t.id === id) ?? null;
}

export function areasForType(type: WaterTypeId, theater?: TheaterId | "all") {
  const def = waterTypeById(type);
  return AREAS.filter((a) => {
    if (theater && theater !== "all" && a.theater !== theater) return false;
    if (type === "marsh") return a.tideCharacter === "marsh-current";
    if (type === "skinny" || type === "sight") return a.tideCharacter === "sight-skinny";
    if (type === "structure") return a.tideCharacter === "pass-current" || a.theater === "texas";
    if (type === "fly" || type === "spin" || type === "wade" || type === "skiff") {
      return a.leadSpecies.some((id) => def?.species.includes(id));
    }
    return true;
  });
}

export function speciesForFilters(opts: {
  theater?: TheaterId | "all";
  type?: WaterTypeId | "all";
  speciesId?: SpeciesId | "all";
  month?: number;
}) {
  const type = opts.type && opts.type !== "all" ? waterTypeById(opts.type) : null;
  return SPECIES.filter((s) => {
    if (s.role === "bluewater" || s.role === "pacific") return false;
    if (opts.speciesId && opts.speciesId !== "all" && s.id !== opts.speciesId) return false;
    if (opts.theater && opts.theater !== "all" && !s.theaters.includes(opts.theater)) return false;
    if (type && !type.species.includes(s.id)) return false;
    if (opts.month && !s.presentMonths.includes(opts.month)) return false;
    return true;
  });
}

export function peaksThisMonth(month: number, theater?: TheaterId | "all") {
  return SPECIES.filter((s) => {
    if (s.role !== "primary") return false;
    if (!s.peakMonths.includes(month)) return false;
    if (theater && theater !== "all" && !s.theaters.includes(theater)) return false;
    return true;
  });
}

export function closuresThisMonth(month: number, date = new Date()) {
  const notes: { title: string; body: string }[] = [];
  if (flounderClosed(date, "America/Chicago")) {
    notes.push({
      title: "Texas flounder",
      body: "Closed Nov 1–Dec 14. The fall run is real in October. This week the correct fish is a red or a trout.",
    });
  } else if (month === 10) {
    notes.push({
      title: "Texas flounder — last call",
      body: "The run to the Gulf is on. Measure every fish. The season shuts Nov 1 through Dec 14.",
    });
  }
  if (seFloridaSnookClosed(date, "America/New_York")) {
    notes.push({
      title: "SE Florida snook",
      body: "Typically closed June–August (spawn) and January. Catch-and-release is still fishing. Do not harvest a snook because a desk scored an 8.",
    });
  } else if (month === 5) {
    notes.push({
      title: "SE Florida snook — spawn window ahead",
      body: "The typical June–August closure is next. Verify FWC the morning you keep one.",
    });
  }
  return notes;
}
