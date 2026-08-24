import { cookies } from "next/headers";
import { AREAS, getArea } from "@/lib/data/areas";
import { parseActivity } from "@/lib/briefing";
import type { ActivityId, TheaterId } from "@/lib/types";
import { COASTS_COOKIE, parseCoasts } from "@/lib/coasts";

export const WATER_COOKIE = "fb_water";
export { COASTS_COOKIE };

export type WaterPref = {
  areaId: string;
  theater: string;
  activity: ActivityId | "all";
};

export function encodeWaterPref(pref: WaterPref) {
  return `${pref.areaId}|${pref.theater}|${pref.activity}`;
}

export function parseWaterPref(raw?: string | null): WaterPref | null {
  if (!raw) return null;
  const [areaId, theater, activity] = raw.split("|");
  const area = AREAS.find((a) => a.id === areaId);
  if (!area) return null;
  return {
    areaId: area.id,
    theater: theater && theater !== "all" ? theater : area.theater,
    activity: parseActivity(activity),
  };
}

export function waterCookieOptions() {
  return {
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
    sameSite: "lax" as const,
  };
}

export async function readWaterPref() {
  const jar = await cookies();
  return parseWaterPref(jar.get(WATER_COOKIE)?.value);
}

export async function readCoastsPref(): Promise<TheaterId[] | null> {
  const jar = await cookies();
  const coasts = parseCoasts(jar.get(COASTS_COOKIE)?.value);
  return coasts.length ? coasts : null;
}

export function resolveDesk(
  query: { area?: string; activity?: string; theater?: string },
  pref?: WaterPref | null,
) {
  const area = getArea(query.area ?? pref?.areaId);
  const activity = parseActivity(query.activity ?? pref?.activity);
  const theater = query.theater ?? pref?.theater ?? area.theater;
  return { area, activity, theater };
}

