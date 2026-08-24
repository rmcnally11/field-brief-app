import type { Species, TheaterId } from "@/lib/types";

export const SPECIES: Species[] = [
  {
    id: "redfish",
    commonName: "Redfish",
    latin: "Sciaenops ocellatus",
    role: "primary",
    theaters: ["texas", "louisiana", "florida"],
    peakMonths: [3, 4, 5, 9, 10, 11],
    presentMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    tempMin: 52,
    tempMax: 88,
    tempOpt: [62, 82],
    habitats: ["grass-flat", "marsh-drain", "oyster-reef", "pass-jetty", "mangrove-edge"],
    preferTide: ["incoming", "outgoing"],
    flyNote: "8-weight. Crab or shrimp on bead-chain for tailers. Gold spoon when the wind wrecks the fly. 20 lb near oyster.",
    spinNote: "Weedless gold spoon, paddle, or soft plastic. Heavy spoon or big paddle for the fall jetty bulls.",
    why: "Texas and Louisiana main event. Tails in flooded grass, wakes on shell, winter schools on mud, bulls in the passes. Keys: backcountry only, not oceanside. Boca Harbor yes. Jupiter is a snook desk.",
    regulation:
      "Texas (Sep 1 2025–Aug 31 2026): 3/day, 20–28 in slot. One over 28 in per license year with a Red Drum Tag (plus bonus tag). Florida SE: typically 18–27 in, 1/person, 2/vessel — harvest banned in federal waters. Bahamas: absent.",
    regulationUrl: "https://tpwd.texas.gov/regulations/outdoor-annual/fishing/saltwater-fishing/bag-length-limits/drum-bag-length-limits",
  },
  {
    id: "speckled-trout",
    commonName: "Speckled trout",
    latin: "Cynoscion nebulosus",
    role: "primary",
    theaters: ["texas", "louisiana"],
    peakMonths: [3, 4, 5, 10, 11],
    presentMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    tempMin: 48,
    tempMax: 86,
    tempOpt: [62, 78],
    habitats: ["grass-flat", "oyster-reef", "channel-gut", "spoil-bank"],
    preferTide: ["incoming", "outgoing"],
    flyNote: "7–8 wt. Baitfish and shrimp. Gurgler when they are up. Soft mouth — strip-set, do not trout-set a trout.",
    spinNote: "Topwater at dawn. Soft plastic on a light jig the rest of the day. Slow down after a front.",
    why: "Same bays as the red, a foot deeper. Birds are GPS. Heat drives them off the flat at midday. Cold drives them to guts and mud. Louisiana lives on this fish.",
    regulation:
      "Texas: 3/day, 15–20 in slot. One over 28 in per license year with a Spotted Seatrout Tag (plus bonus). Soft mouth + slot = measure every fish.",
    regulationUrl: "https://tpwd.texas.gov/regulations/outdoor-annual/fishing/saltwater-fishing/bag-length-limits/seatrout-bag-length-limits",
  },
  {
    id: "flounder",
    commonName: "Southern flounder",
    latin: "Paralichthys lethostigma",
    role: "primary",
    theaters: ["texas", "louisiana"],
    peakMonths: [10, 11],
    presentMonths: [3, 4, 5, 6, 9, 10, 11, 12],
    tempMin: 50,
    tempMax: 84,
    tempOpt: [58, 74],
    habitats: ["sand-dropoff", "marsh-drain", "pass-jetty", "channel-gut"],
    preferTide: ["outgoing", "incoming"],
    flyNote: "Clouser or shrimp on the bottom. Slow. The eat is a weight, not a tap.",
    spinNote: "Gulp or soft plastic hopped on sand drains and jetty guts. Fall nights at the passes are the run.",
    why: "Fall migration to the Gulf when water drops a few degrees. Males leave first. Spring return. Texas closed Nov 1–Dec 14. Louisiana typically closed Oct 15–Nov 30 — verify LDWF.",
    regulation:
      "Texas: 5/day, 15 in minimum (verify Outdoor Annual). Fishery closed Nov 1–Dec 14. Possession equals the daily bag.",
    regulationUrl: "https://tpwd.texas.gov/regulations/outdoor-annual/fishing/saltwater-fishing/bag-length-limits/",
  },
  {
    id: "black-drum",
    commonName: "Black drum",
    latin: "Pogonias cromis",
    role: "primary",
    theaters: ["texas", "louisiana", "florida"],
    peakMonths: [12, 1, 2, 3],
    presentMonths: [1, 2, 3, 4, 11, 12],
    tempMin: 50,
    tempMax: 84,
    tempOpt: [55, 72],
    habitats: ["oyster-reef", "channel-gut", "sand-dropoff", "structure-piling"],
    preferTide: ["outgoing", "incoming", "high-slack"],
    flyNote: "Crab/shrimp a size bigger than the red. 8 wt schoolies, 9–10 for shoulders. He will eat a fly that sits.",
    spinNote: "Crab, light jig, or dead shrimp. A 30-pounder in a channel is a day that does not allow the fly.",
    why: "Winter/early spring. Schools with reds on Galveston mud. Roots — look for puffs and a thicker, darker tail.",
    regulation:
      "Texas: 5/day, 14–30 in. One over 52 in allowed as part of the bag. Florida: check FWC regional rules.",
    regulationUrl: "https://tpwd.texas.gov/regulations/outdoor-annual/fishing/saltwater-fishing/bag-length-limits/drum-bag-length-limits",
  },
  {
    id: "sheepshead",
    commonName: "Sheepshead",
    latin: "Archosargus probatocephalus",
    role: "primary",
    theaters: ["texas", "louisiana", "florida"],
    peakMonths: [12, 1, 2, 3],
    presentMonths: [11, 12, 1, 2, 3, 4],
    tempMin: 52,
    tempMax: 80,
    tempOpt: [55, 70],
    habitats: ["pass-jetty", "structure-piling", "oyster-reef"],
    preferTide: ["incoming", "outgoing"],
    flyNote: "7–8 wt, short 16–20 lb leader, ugly small crab. You are putting food on a post, not presenting to a cruiser.",
    spinNote: "The honest tool. Light jig or fiddler, 15–20 fluoro, watch the line. The bite is a tick.",
    why: "Winter and early spring on jetty granite and pilings. Midday better than dawn. He faces the tide and picks.",
    regulation: "Texas: 5/day, 15 in minimum. Florida: check FWC. Bahamas: not your fish.",
    regulationUrl: "https://tpwd.texas.gov/regulations/outdoor-annual/fishing/saltwater-fishing/bag-length-limits/",
  },
  {
    id: "snook",
    commonName: "Snook",
    latin: "Centropomus undecimalis",
    role: "primary",
    theaters: ["florida", "texas"],
    peakMonths: [4, 5, 9, 10],
    presentMonths: [3, 4, 5, 6, 7, 8, 9, 10, 11],
    tempMin: 60,
    tempMax: 88,
    tempOpt: [70, 84],
    habitats: ["mangrove-edge", "pass-jetty", "creek-bight", "channel-gut"],
    preferTide: ["outgoing", "incoming"],
    flyNote: "8–9 wt. Wide-gap baitfish or shrimp. Strip-set and keep him out of the roots.",
    spinNote: "Walk-the-dog or soft plastic along mangrove points on a moving tide.",
    why: "Florida backcountry and passes. Rare in deep-south Texas. Cold-sensitive — a hard norther empties the shoreline.",
    regulation:
      "Florida SE/Atlantic: typically 28–32 in, 1/day, snook permit required. Closed summer spawn window (often June–Aug) and a winter closure in some regions. Texas: 1/day, 24–28 in. Verify FWC regional map before you keep one.",
    regulationUrl: "https://myfwc.com/fishing/saltwater/recreational/snook/",
  },
  {
    id: "tarpon",
    commonName: "Tarpon",
    latin: "Megalops atlanticus",
    role: "primary",
    theaters: ["texas", "louisiana", "florida", "bahamas"],
    peakMonths: [4, 5, 6, 7],
    presentMonths: [3, 4, 5, 6, 7, 8, 9, 10],
    tempMin: 72,
    tempMax: 90,
    tempOpt: [76, 86],
    habitats: ["pass-jetty", "channel-gut", "creek-bight", "mangrove-edge", "wreck-edge"],
    preferTide: ["incoming", "outgoing"],
    flyNote: "10–12 wt. Cockroach, toad, or baitfish. Bow to the king on the jump. 40–60 lb shock.",
    spinNote: "Live crab or large swimbaits at passes. Texas beachfront July–early fall is a bay-boat game, not the skinny skiff.",
    why: "Keys migratory peak Apr–May. Boca Grande Pass is the spring stack. Jupiter inlet and beach. Texas beach/passes mid-summer. Venice south passes in the heat. Bahamas: resident fish in bights Apr–Oct.",
    regulation:
      "Florida: catch-and-release. Fish over 40 in must stay in the water. One harvest tag/year ($50) only for a potential IGFA record. Texas/Bahamas: treat as C&R.",
    regulationUrl: "https://myfwc.com/fishing/saltwater/recreational/tarpon/",
  },
  {
    id: "bonefish",
    commonName: "Bonefish",
    latin: "Albula vulpes",
    role: "primary",
    theaters: ["florida", "bahamas"],
    peakMonths: [11, 12, 1, 2, 3, 4, 5, 6],
    presentMonths: [1, 2, 3, 4, 5, 6, 10, 11, 12],
    tempMin: 68,
    tempMax: 88,
    tempOpt: [72, 84],
    habitats: ["hard-flat", "grass-flat", "sand-dropoff", "creek-bight"],
    preferTide: ["incoming", "outgoing"],
    flyNote: "8 wt. Gotcha, Crazy Charlie, shrimp. Long fluoro, soft landing. Bahamas will forgive more than Biscayne.",
    spinNote: "Possible with a tiny jig. The honest tool here is the fly.",
    why: "Absent in Texas. Keys: big, few, educated. Bahamas: the capital — winter singles, summer schools of 3–5 lb fish.",
    regulation:
      "Florida: catch-and-release only, hook-and-line only. Bahamas: treat as C&R; flats licensing rules have been tightening — verify before you wade.",
    regulationUrl: "https://myfwc.com/fishing/saltwater/recreational/bonefish/",
  },
  {
    id: "permit",
    commonName: "Permit",
    latin: "Trachinotus falcatus",
    role: "primary",
    theaters: ["florida", "bahamas"],
    peakMonths: [3, 4, 5, 6, 7],
    presentMonths: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    tempMin: 70,
    tempMax: 88,
    tempOpt: [74, 84],
    habitats: ["hard-flat", "wreck-edge", "sand-dropoff", "channel-gut"],
    preferTide: ["incoming", "outgoing"],
    flyNote: "9 wt, 10 in wind. Merkin / Del Brown / Raghead. Lead the tailer, let the crab sink, one slow twitch.",
    spinNote: "Often deadlier. Live crab, DOA crab, 20–30 fluoro. No apology.",
    why: "None in Texas. Keys mecca — flats, banks, wrecks. Best window ~1.5–3 hours into the incoming. Bahamas west sides May–Oct, less pressured.",
    regulation:
      "Florida: hook-and-line. Special Permit Zone (Keys) is more restrictive than the rest of the state — typically C&R or a tight slot. Verify FWC before you keep anything. Bahamas: C&R.",
    regulationUrl: "https://myfwc.com/fishing/saltwater/recreational/permit/",
  },
  {
    id: "jacks",
    commonName: "Jack crevalle",
    latin: "Caranx hippos",
    role: "incidental",
    theaters: ["texas", "louisiana", "florida", "bahamas"],
    peakMonths: [5, 6, 7, 8, 9],
    presentMonths: [4, 5, 6, 7, 8, 9, 10],
    tempMin: 68,
    tempMax: 90,
    tempOpt: [74, 86],
    habitats: ["pass-jetty", "spoil-bank", "sand-dropoff", "grass-flat"],
    preferTide: ["incoming", "outgoing"],
    flyNote: "9–10 wt baitfish. They will destroy a trout setup. Fun, not subtle.",
    spinNote: "Topwater or heavy spoon. If the birds are on them, you are late — cast past the boil.",
    why: "Summer noise. Texas passes and beachfront. Not the reason you booked Andros, but they will find you. They do not own a Texas or Keys headline.",
    regulation: "Generally unregulated or liberal bag. Still, do not leave a pile.",
    regulationUrl: "https://tpwd.texas.gov/regulations/outdoor-annual/fishing/saltwater-fishing/bag-length-limits/",
  },
  {
    id: "mahi",
    commonName: "Mahi-mahi",
    latin: "Coryphaena hippurus",
    role: "bluewater",
    theaters: ["florida", "bahamas", "texas"],
    peakMonths: [5, 6, 7, 8, 9],
    presentMonths: [4, 5, 6, 7, 8, 9, 10],
    tempMin: 70,
    tempMax: 88,
    tempOpt: [74, 84],
    habitats: ["wreck-edge", "sand-dropoff"],
    preferTide: ["incoming", "outgoing"],
    flyNote: "10–12 wt. Baitfish or a chugger on a weedline. This is a boat-in-blue-water game, not a skiff on the flat.",
    spinNote: "Ballyhoo or a heavy spoon on color changes, sargassum, and the humps. If you can see the bank, you are inshore of them.",
    why: "Dolphin. Keys and Bahamas summer bluewater — weedlines, FADs, the edge. Texas: offshore, not the bay. Absent from a Galveston grass headline.",
    regulation:
      "Florida: typically 10/person, 60/vessel, 20 in fork. Texas: 3/day in federal waters under HMS/coastal rules — verify NOAA HMS and TPWD before you keep one. Bahamas: check current bag.",
    regulationUrl: "https://myfwc.com/fishing/saltwater/recreational/dolphin/",
  },
  {
    id: "sailfish",
    commonName: "Sailfish",
    latin: "Istiophorus platypterus",
    role: "bluewater",
    theaters: ["florida", "bahamas", "texas"],
    peakMonths: [12, 1, 2, 3, 4],
    presentMonths: [11, 12, 1, 2, 3, 4, 5],
    tempMin: 70,
    tempMax: 86,
    tempOpt: [74, 82],
    habitats: ["wreck-edge", "sand-dropoff"],
    preferTide: ["incoming", "outgoing"],
    flyNote: "12 wt. A shot on a teaser, then the fly. Not a wade. Not a poling skiff.",
    spinNote: "Kite, live bait, or a dredge off the reef edge. Islamorada and Stuart in winter. Texas sail are a rare offshore event, not the jetty.",
    why: "SE Florida and the Keys are the winter sail coast. Bahamas bluewater. Texas: possible way offshore, not Matagorda. Do not headline a flat with a billfish.",
    regulation:
      "Florida: catch-and-release for Atlantic sail except a rare harvest tag. Federal HMS permit in federal waters. Texas/Bahamas: treat as C&R.",
    regulationUrl: "https://myfwc.com/fishing/saltwater/recreational/sailfish/",
  },
  {
    id: "tuna",
    commonName: "Tuna (blackfin / yellowfin)",
    latin: "Thunnus atlanticus / Thunnus albacares",
    role: "bluewater",
    theaters: ["florida", "bahamas", "texas"],
    peakMonths: [4, 5, 6, 7, 8],
    presentMonths: [3, 4, 5, 6, 7, 8, 9, 10],
    tempMin: 70,
    tempMax: 88,
    tempOpt: [74, 84],
    habitats: ["wreck-edge"],
    preferTide: ["incoming", "outgoing"],
    flyNote: "12 wt on a blackfin blitz if they come up. Yellowfin is a stand-up outfit, not an 8-weight.",
    spinNote: "Humps, wrecks, and the edge. Live bait or a heavy jig. Texas tuna live in 50–100 fathoms, not West Bay.",
    why: "Blackfin on Keys/Bahamas humps and wrecks. Yellowfin farther out. Texas: Flower Garden / canyon water. Not a Baffin or Biscayne headline.",
    regulation:
      "Federal HMS rules. Yellowfin typically 27 in curved fork. Blackfin often more liberal — verify NOAA HMS and FWC/TPWD the morning you leave the inlet.",
    regulationUrl: "https://www.fisheries.noaa.gov/atlantic-highly-migratory-species/atlantic-highly-migratory-species-recreational-fishing",
  },
  {
    id: "roosterfish",
    commonName: "Roosterfish",
    latin: "Nematistius pectoralis",
    role: "pacific",
    theaters: [],
    peakMonths: [5, 6, 7, 8, 9],
    presentMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    tempMin: 72,
    tempMax: 88,
    tempOpt: [76, 84],
    habitats: ["sand-dropoff", "pass-jetty"],
    preferTide: ["incoming", "outgoing"],
    flyNote: "10–12 wt. A big baitfish in the surf. Baja and Central America Pacific, not the Gulf.",
    spinNote: "Live mullet in the wash. Same ocean as the rooster comb — the Pacific.",
    why: "Eastern Pacific only — Baja, Costa Rica, Panama. Absent from Texas, the Keys, and the Bahamas. In the book so you do not invent him on a Laguna Madre morning.",
    regulation: "Not a U.S. Atlantic or Gulf fish. No TPWD or FWC season. Do not report him on this water.",
    regulationUrl: "https://www.fisheries.noaa.gov/",
  },
];

export const SPECIES_BY_ID = Object.fromEntries(SPECIES.map((s) => [s.id, s])) as Record<
  Species["id"],
  Species
>;

/** Briefing cards show the rule for this water, not a Texas + Florida mash. */
export function regulationFor(species: Species, theater: TheaterId) {
  const byTheater: Partial<Record<Species["id"], Partial<Record<TheaterId, string>>>> = {
    redfish: {
      texas: "Texas (Sep 1 2025–Aug 31 2026): 3/day, 20–28 in slot. One over 28 in per license year with a Red Drum Tag.",
      louisiana:
        "Louisiana: 4/day, 18–27 in slot. None over 27. No harvest in federal waters. Charter captain/crew bag is zero. Verify LDWF.",
      florida: "Florida SE: typically 18–27 in, 1/person, 2/vessel. Harvest banned in federal waters. Keys backcountry, not oceanside. Boca Harbor yes.",
    },
    "speckled-trout": {
      texas: "Texas: 3/day, 15–20 in slot. One over 28 in per license year with a Spotted Seatrout Tag (plus bonus). Soft mouth + slot = measure every fish.",
      louisiana:
        "Louisiana: 15/day, 13–20 in slot, no more than two over 20. Charter captain/crew bag is zero. Verify LDWF.",
    },
    flounder: {
      texas: "Texas: 5/day, 15 in minimum (verify Outdoor Annual). Closed Nov 1–Dec 14.",
      louisiana:
        "Louisiana: typically 10/day. Recreational harvest usually closed Oct 15–Nov 30 — verify LDWF the week you keep one.",
    },
    "black-drum": {
      texas: "Texas: 5/day, 14–30 in. One over 52 in allowed as part of the bag.",
      louisiana: "Louisiana: check LDWF coastal finfish before you keep a drum.",
      florida: "Florida: check FWC regional rules before you keep a drum.",
    },
    sheepshead: {
      texas: "Texas: 5/day, 15 in minimum.",
      louisiana: "Louisiana: check LDWF coastal finfish.",
      florida: "Florida: check FWC regional sheepshead rules.",
    },
    snook: {
      texas: "Texas: 1/day, 24–28 in. Rare this far west — verify before you keep one.",
      florida:
        "Region matters. SE/Atlantic (Jupiter, Biscayne): typically 28–32 in, 1/day, closed Dec 15–Jan 31 and June 1–Aug 31. Charlotte Harbor / Southwest (Boca Grande): typically 28–33 in, closed Dec 1–end of Feb and May 1–Sep 30. Snook permit required. Verify FWC.",
    },
    tarpon: {
      texas: "Texas: treat as catch-and-release.",
      louisiana: "Louisiana: treat as catch-and-release.",
      florida: "Florida: catch-and-release. Fish over 40 in must stay in the water. One harvest tag/year only for a potential IGFA record.",
      bahamas: "Bahamas: treat as catch-and-release.",
    },
    bonefish: {
      florida: "Florida: catch-and-release only, hook-and-line only.",
      bahamas: "Bahamas: treat as C&R. Flats licensing has been tightening — verify before you wade.",
    },
    permit: {
      florida: "Florida: hook-and-line. Special Permit Zone (Keys) is tighter than the rest of the state — typically C&R. Verify FWC.",
      bahamas: "Bahamas: catch-and-release.",
    },
    jacks: {
      texas: "Generally unregulated. Still, do not leave a pile.",
      louisiana: "Generally unregulated. Still, do not leave a pile.",
      florida: "Generally unregulated. Still, do not leave a pile.",
      bahamas: "Treat as incidental. Not why you booked the flat.",
    },
  };
  return byTheater[species.id]?.[theater] ?? species.regulation;
}

export function flounderClosed(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  if (month === 11) return true;
  if (month === 12 && day <= 14) return true;
  return false;
}

export function seFloridaSnookClosed(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  // SE/Atlantic typical: Dec 15–Jan 31 and June 1–Aug 31.
  if (month === 6 || month === 7 || month === 8) return true;
  if (month === 1) return true;
  if (month === 12 && day >= 15) return true;
  return false;
}

/** Charlotte Harbor / Southwest (Boca Grande): Dec 1–end of Feb and May 1–Sep 30. */
export function charlotteHarborSnookClosed(date: Date, timezone: string) {
  const month = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: timezone, month: "numeric" }).format(date),
  );
  return month === 12 || month === 1 || month === 2 || month === 5 || month === 6 || month === 7 || month === 8 || month === 9;
}

export function louisianaFlounderClosed(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  // LDWF typical recreational closure Oct 15–Nov 30 — verify the week you keep one.
  if (month === 11) return true;
  if (month === 10 && day >= 15) return true;
  return false;
}

export function snookClosedOn(areaId: string, theater: TheaterId, date: Date, timezone: string) {
  if (theater !== "florida") return false;
  if (areaId === "boca-grande") return charlotteHarborSnookClosed(date, timezone);
  return seFloridaSnookClosed(date, timezone);
}
