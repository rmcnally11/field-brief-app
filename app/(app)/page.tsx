import { Suspense } from "react";
import { getBriefing, parseActivity, parseBriefDate } from "@/lib/briefing";
import { FilterBar } from "@/components/filters";
import { BriefingPanel } from "@/components/briefing-panel";
import { UpcomingLoader, UpcomingSkeleton } from "@/components/upcoming-loader";
import { readWaterPref, resolveDesk } from "@/lib/prefs";
import { getYoloDay } from "@/lib/calendar";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; activity?: string; theater?: string; date?: string }>;
}) {
  const q = await searchParams;
  const pref = await readWaterPref();
  const desk = resolveDesk(q, pref);
  const date = parseBriefDate(q.date);
  let briefing;
  let yolo = null;
  let error: string | null = null;
  try {
    [briefing, yolo] = await Promise.all([
      getBriefing(desk.area.id, desk.activity, date),
      getYoloDay(desk.area, desk.activity),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not build the briefing.";
  }

  return (
    <div className="space-y-6">
      <Suspense>
        <FilterBar
          areaId={briefing?.area.id ?? desk.area.id}
          activity={q.activity ?? desk.activity}
          theater={q.theater ?? desk.theater}
        />
      </Suspense>
      {error || !briefing ? (
        <div className="rounded-2xl border border-rose-400/40 bg-rose-50 p-6 text-rose-900">
          <p className="font-heading text-xl">The gauges did not answer.</p>
          <p className="mt-2 text-sm opacity-80">{error}</p>
        </div>
      ) : (
        <BriefingPanel
          briefing={briefing}
          yolo={yolo}
          upcomingSlot={
            <Suspense fallback={<UpcomingSkeleton />}>
              <UpcomingLoader area={briefing.area} activity={parseActivity(q.activity ?? desk.activity)} />
            </Suspense>
          }
        />
      )}
    </div>
  );
}
