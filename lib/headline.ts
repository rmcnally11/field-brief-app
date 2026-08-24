import type { Area, Conditions, SpeciesPick, TideStage } from "@/lib/types";

function pickLead(area: Area, species: SpeciesPick[]): SpeciesPick | undefined {
  const ranked = area.leadSpecies
    .map((id) => species.find((s) => s.species.id === id))
    .filter((s): s is SpeciesPick => Boolean(s));
  return ranked.find((s) => s.inPlay) ?? ranked[0] ?? species.find((s) => s.species.role === "primary");
}

function heatNote(water: number | null, wind: number | null) {
  if (water != null && water >= 88) return "Heat is the clock — first light or last light.";
  if (water != null && water <= 58) return "Cold fish slide to guts and mud. Midday sun is legal.";
  if (wind != null && wind >= 18) return "The wind is the tide. Work the leeward shore.";
  return null;
}

const PLACE: Record<
  string,
  Record<TideStage, string>
> = {
  sabine: {
    incoming: "flood the Neches and Sabine marsh, then the drains at Texas Point",
    outgoing: "sit the river-marsh drains — this water dumps after a blow",
    "high-slack": "wait — slack on a border estuary is a pause, not a hunt",
    "low-slack": "wait for the next dump off the marsh",
  },
  galveston: {
    incoming: "push West and East Bay grass as the wind lets water back in",
    outgoing: "fish the wind-blown shoreline — the table is not the tide here",
    "high-slack": "hold for moving water; Galveston slack is a boat ride",
    "low-slack": "slide to guts and the ship-channel edges until it moves",
  },
  matagorda: {
    incoming: "work East Matagorda reefs and the ICW exchange — there is almost no Gulf inlet",
    outgoing: "Mitchell's Cut and the ship-channel side do the exchanging",
    "high-slack": "wait; this bay does not refresh itself",
    "low-slack": "mid-bay shell and the channel until current starts",
  },
  aransas: {
    incoming: "flood Copano and Redfish Bay grass — this is the mid-coast skiff day",
    outgoing: "drain Lydia Ann and the oyster edges, not a Galveston jetty program",
    "high-slack": "pole the remaining water; slack here is short",
    "low-slack": "get off the skinny and sit the reefs",
  },
  corpus: {
    incoming: "Packery and the Mustang backside, then the Port A jetties if the bulls are in",
    outgoing: "the pass at Port Aransas — this is current water, not a marsh drain",
    "high-slack": "wait for the next push through the jetties",
    "low-slack": "Nueces and Shamrock guts until the pass turns",
  },
  baffin: {
    incoming: "sight the grass and serpulid — do not fish Baffin like Rockport",
    outgoing: "slide to Land Cut and the holes; trophy trout leave the skinny",
    "high-slack": "look, do not grind — this water is clear and they see you",
    "low-slack": "Nine Mile and the Badlands guts, not a wade across the flat",
  },
  "lower-laguna": {
    incoming: "sight-cast reds in inches on South Bay and the spoils",
    outgoing: "the drops off Brazos Santiago and the spoil edges",
    "high-slack": "wait for a push — skinny clear water at slack is a walk",
    "low-slack": "get in the remaining water; this is a sight fishery, not a drain",
  },
  biscayne: {
    incoming: "oceanside banks for bones and permit — west-side mangroves for baby tarpon and snook",
    outgoing: "the ocean banks as they empty; these fish are educated and the window is short",
    "high-slack": "do not grind a Biscayne slack — boat traffic already did",
    "low-slack": "wait for the next incoming; they will not eat a bad presentation here",
  },
  islamorada: {
    incoming: "oceanside permit and bones, or Channel 5 current — not a Texas marsh sentence",
    outgoing: "the wrecks and the falling ocean bank; pressured fish want a clean shot",
    "high-slack": "run or rest — slack on this water is not a hunt",
    "low-slack": "wait for the flood; Islamorada does not forgive a low-slack cast",
  },
  "florida-bay": {
    incoming: "flood Snake Bight and the Flamingo banks — backcountry reds and snook, not oceanside bones",
    outgoing: "the drains and the colored water west of Flamingo",
    "high-slack": "wind and color decide; slack here is a look, not a grind",
    "low-slack": "sit the remaining guts until the bay breathes",
  },
  marathon: {
    incoming: "Seven Mile current and the oceanside patches — permit and tarpon, not a bonefish morning",
    outgoing: "the bridge shadow and the falling wrecks",
    "high-slack": "wait for the next push under the bridges",
    "low-slack": "bayside basins until Vaca water turns",
  },
  "key-west": {
    incoming: "Marquesas and Harbor Key on a clean incoming — permit country",
    outgoing: "the oceanside wrecks and the falling contentment flats",
    "high-slack": "make the run or wait; slack out here is expensive",
    "low-slack": "wait for the next flood after the shower clears",
  },
  andros: {
    incoming: "west-side white sand — schools, then the double-digit singles",
    outgoing: "the creek mouths and the bights; tarpon live in the darker water",
    "high-slack": "look, do not wade a high-slack school into the next zip code",
    "low-slack": "wait for the flood on the west side",
  },
  abaco: {
    incoming: "the Marls and Cherokee on foot, or the ocean cays by skiff",
    outgoing: "the Sea of Abaco edges as they empty",
    "high-slack": "verify which creeks are actually open, then wait for water",
    "low-slack": "sit the remaining Marls guts",
  },
  "grand-bahama": {
    incoming: "East or West End pancakes — one fish, on foot",
    outgoing: "the same flat, thinner; pick the darker single",
    "high-slack": "this is a thinking wade — slack is a look",
    "low-slack": "wait for the next inch of water",
  },
  eleuthera: {
    incoming: "Current Cut and the east-side ocean flats — permit first, bones second",
    outgoing: "the cut and the Exuma-edge banks as they fall",
    "high-slack": "weather decides more than Andros; wait",
    "low-slack": "hold for the next push through the cut",
  },
};

export function pickHeadlineSpecies(area: Area, species: SpeciesPick[]) {
  return pickLead(area, species);
}

export function composeHeadline(
  area: Area,
  lead: SpeciesPick | undefined,
  conditions: Conditions,
): string {
  const fish = lead?.species.commonName ?? "Fish";
  const verb =
    lead && lead.score >= 6.5 ? "should be the day" : lead && lead.inPlay ? "are the hunt" : "are in the mix";
  const place = PLACE[area.id]?.[conditions.tides.stage] ?? "wait for moving water on this micro-area";
  const extra = heatNote(conditions.waterTempF, conditions.weather.windMph);
  return extra ? `${fish} ${verb} — ${place}. ${extra}` : `${fish} ${verb} — ${place}.`;
}
