import type { ActivityId, Briefing } from "@/lib/types";
import { getArea } from "@/lib/data/areas";
import { loadConditions } from "@/lib/conditions";
import { buildBriefing } from "@/lib/engine";
import { loadOfficialLayers } from "@/lib/layers";

const ACTIVITIES = new Set(["wade", "skiff", "kayak", "fly", "spin", "structure", "all"]);

export function parseActivity(raw?: string | null): ActivityId | "all" {
  if (!raw || !ACTIVITIES.has(raw)) return "all";
  return raw as ActivityId | "all";
}

export async function getBriefing(areaId?: string | null, activityRaw?: string | null): Promise<Briefing> {
  const area = getArea(areaId);
  const activity = parseActivity(activityRaw);
  const [conditions, official] = await Promise.all([loadConditions(area), loadOfficialLayers(area)]);
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
