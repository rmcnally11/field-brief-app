import type { TheaterId } from "@/lib/types";
import { AREA_BY_ID } from "@/lib/data/areas";
import { THEATER_IDS, THEATER_META } from "@/lib/data/theaters";
import { DESKS } from "@/lib/desks";

export const COASTS_COOKIE = "fb_coasts";

export const CADENCES = ["daily", "weekly", "seasonal"] as const;
export type Cadence = (typeof CADENCES)[number];

export const CADENCE_META: { id: Cadence; label: string; blurb: string }[] = [
  { id: "daily", label: "Daily", blurb: "The 5am line for the desks you pick" },
  { id: "weekly", label: "Weekly", blurb: "Saturday’s letter, those desks only" },
  { id: "seasonal", label: "Seasonal", blurb: "This month’s fundamentals for those coasts" },
];

export function parseCoasts(raw?: string | null): TheaterId[] {
  if (!raw || raw === "all") return [];
  const wanted = new Set<string>(THEATER_IDS);
  return [
    ...new Set(
      raw
        .split(/[,+|]/)
        .map((s) => s.trim().toLowerCase())
        .filter((s): s is TheaterId => wanted.has(s)),
    ),
  ];
}

export function parseCadence(raw: unknown): Cadence[] {
  const wanted = new Set<string>(CADENCES);
  const list = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(/[,|]/) : [...CADENCES];
  const out = [
    ...new Set(
      list
        .map((c) => String(c).trim().toLowerCase())
        .filter((c): c is Cadence => wanted.has(c)),
    ),
  ];
  return out.length ? out : [...CADENCES];
}

export function cadenceLabels(cadence: Cadence[]) {
  return cadence.map((id) => CADENCE_META.find((m) => m.id === id)?.label ?? id);
}

export function desksForCoasts(coasts: TheaterId[]): string[] {
  if (!coasts.length) return DESKS.map((d) => d.areaId);
  return DESKS.filter((d) => coasts.includes(d.theater)).map((d) => d.areaId);
}

export function coastsForDesks(desks: string[]): TheaterId[] {
  return [...new Set(DESKS.filter((d) => desks.includes(d.areaId)).map((d) => d.theater))];
}

export function letterDeskForArea(areaId?: string | null) {
  if (!areaId) return undefined;
  if (DESKS.some((d) => d.areaId === areaId)) return areaId;
  const area = AREA_BY_ID[areaId];
  return DESKS.find((d) => d.theater === area?.theater)?.areaId;
}

export function encodeCoasts(coasts: TheaterId[]) {
  return coasts.join(",");
}

export function coastsCookieOptions() {
  return {
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
    sameSite: "lax" as const,
  };
}

export function resolveElectedCoasts(opts: {
  coastsQuery?: string | null;
  desksQuery?: string | null;
  cookie?: string | null;
}): TheaterId[] | null {
  if (opts.coastsQuery === "all") return [...THEATER_IDS];
  const fromQuery = parseCoasts(opts.coastsQuery);
  if (fromQuery.length) return fromQuery;
  if (opts.desksQuery) {
    const desks = opts.desksQuery
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);
    const fromDesks = coastsForDesks(desks);
    if (fromDesks.length) return fromDesks;
  }
  const fromCookie = parseCoasts(opts.cookie);
  return fromCookie.length ? fromCookie : null;
}

export function coastEditionLabel(coasts: TheaterId[] | null) {
  if (!coasts || coasts.length === 0 || coasts.length === THEATER_IDS.length) return "All coasts";
  return coasts.map((id) => THEATER_META.find((t) => t.id === id)?.label ?? id).join(" · ");
}

export function isAllCoasts(coasts: TheaterId[] | null) {
  return !coasts || coasts.length === 0 || coasts.length === THEATER_IDS.length;
}
