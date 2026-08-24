import type { TheaterId } from "@/lib/types";

export type RegStamp = {
  book: string;
  span: string;
  rollsOn: string;
  url: string;
  note: string;
};

const STAMPS: Record<TheaterId, RegStamp> = {
  texas: {
    book: "TPWD Outdoor Annual",
    span: "Sep 1, 2025–Aug 31, 2026",
    rollsOn: "2026-09-01",
    url: "https://tpwd.texas.gov/regulations/outdoor-annual/",
    note: "Texas bag and season roll every September 1. The stamp is the book we cited, not a license.",
  },
  louisiana: {
    book: "LDWF recreational saltwater",
    span: "current LDWF coastal finfish",
    rollsOn: "2026-09-01",
    url: "https://www.wlf.louisiana.gov/page/recreational-saltwater-finfish",
    note: "Louisiana flounder is typically closed Oct 15–Nov 30. Verify LDWF the week you keep one.",
  },
  florida: {
    book: "FWC saltwater recreational",
    span: "current FWC regional rules",
    rollsOn: "2026-09-01",
    url: "https://myfwc.com/fishing/saltwater/recreational/",
    note: "Snook closures are regional. Boca Grande is not Jupiter. Verify FWC before you keep one.",
  },
  bahamas: {
    book: "Bahamas flats and bonefish rules",
    span: "current Bahamas guidance",
    rollsOn: "2026-09-01",
    url: "https://www.bahamas.com/fishing",
    note: "Catch-and-release is the culture on the bonefish flats. No NOAA gauge. No invented holes.",
  },
  mexico: {
    book: "CONAPESCA recreational license",
    span: "current CONAPESCA rules",
    rollsOn: "2026-09-01",
    url: "https://www.gob.mx/conapesca",
    note: "Sian Ka’an, Contoy, and Espíritu Santo are park or biosphere water. Roosterfish is Baja, not the Gulf.",
  },
  "puerto-rico": {
    book: "DNER Puerto Rico",
    span: "current DNER recreational rules",
    rollsOn: "2026-09-01",
    url: "https://www.drna.pr.gov/",
    note: "This is DNER water, not FWC. Do not paste a Jupiter snook closure onto Condado.",
  },
  seychelles: {
    book: "Seychelles Fishing Authority",
    span: "current SFA license and harvest",
    rollsOn: "2026-09-01",
    url: "https://www.sfa.sc/",
    note: "Outer atolls are lodge water. Giant trevally lives here. Not on Texas. Not in Puerto Rico.",
  },
};

export function regsStamp(theater: TheaterId): RegStamp {
  return STAMPS[theater];
}

export function daysUntilRollover(theater: TheaterId) {
  const stamp = STAMPS[theater];
  const roll = new Date(`${stamp.rollsOn}T12:00:00Z`).getTime();
  const days = Math.ceil((roll - Date.now()) / 86400000);
  return days;
}
