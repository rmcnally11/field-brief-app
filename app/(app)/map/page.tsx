import { Suspense } from "react";
import { getBriefing, parseActivity } from "@/lib/briefing";
import { readWaterPref, resolveDesk } from "@/lib/prefs";
import { MapPageClient } from "@/components/map-page";
import type { SpotPick } from "@/lib/types";

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; activity?: string; theater?: string }>;
}) {
  const q = await searchParams;
  const pref = await readWaterPref();
  const desk = resolveDesk(q, pref);
  let briefed: SpotPick[] = [];
  try {
    const briefing = await getBriefing(desk.area.id, parseActivity(q.activity ?? desk.activity));
    briefed = briefing.where;
  } catch {
    briefed = [];
  }
  return (
    <Suspense>
      <MapPageClient
        areaId={desk.area.id}
        activity={q.activity ?? desk.activity}
        theater={q.theater ?? desk.theater}
        briefed={briefed}
      />
    </Suspense>
  );
}
