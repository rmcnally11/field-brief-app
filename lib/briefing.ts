import { unstable_cache } from "next/cache";
import type { ActivityId, Briefing } from "@/lib/types";
import { getArea } from "@/lib/data/areas";
import { loadConditions } from "@/lib/conditions";
import { buildBriefing } from "@/lib/engine";
import { loadOfficialLayers } from "@/lib/layers";

const ACTIVITIES = new Set(["wade", "skiff", "kayak", "fly", "spin", "structure", "offshore", "all"]);

export function parseActivity(raw?: string | null): ActivityId | "all" {
  if (!raw || !ACTIVITIES.has(raw)) return "all";
  return raw as ActivityId | "all";
}

async function computeBriefing(areaId: string, activity: ActivityId | "all"): Promise<Briefing> {
  const area = getArea(areaId);
  const [conditions, official] = await Promise.all([
    loadConditions(area),
    loadOfficialLayers(area, { includeGnis: false, timeoutMs: 1600 }),
  ]);
  const built = buildBriefing(area, conditions, activity, new Date(), {
    wrecks: official.wrecks,
    zones: official.zones,
    access: official.access,
  });
  return {
    ...built,
    generatedAt: new Date().toISOString(),
  };
}

const cachedBriefing = unstable_cache(computeBriefing, ["field-briefing-v4"], {
  revalidate: 180,
});

export async function getBriefing(areaId?: string | null, activityRaw?: string | null): Promise<Briefing> {
  const area = getArea(areaId);
  const activity = parseActivity(activityRaw);
  return cachedBriefing(area.id, activity);
}
