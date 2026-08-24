import { Suspense } from "react";
import { getBriefing, parseActivity } from "@/lib/briefing";
import { buildCalendarRange, upcomingDays } from "@/lib/calendar";
import { FilterBar } from "@/components/filters";
import { BriefingPanel } from "@/components/briefing-panel";
import { clockParts, ymdInZone } from "@/lib/time";
import type { CalendarDay } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; activity?: string; theater?: string }>;
}) {
  const q = await searchParams;
  let briefing;
  let upcoming: CalendarDay[] = [];
  let error: string | null = null;
  try {
    briefing = await getBriefing(q.area, q.activity);
    const now = clockParts(new Date(), briefing.area.timezone);
    try {
      const months = await buildCalendarRange(
        briefing.area,
        now.year,
        now.month,
        parseActivity(q.activity),
        2,
      );
      upcoming = upcomingDays(months, ymdInZone(new Date(), briefing.area.timezone), 14);
    } catch {
      upcoming = [];
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not build the briefing.";
  }

  return (
    <div className="space-y-6">
      <Suspense>
        <FilterBar
          areaId={briefing?.area.id ?? q.area ?? "galveston"}
          activity={q.activity ?? "all"}
          theater={q.theater ?? briefing?.area.theater}
        />
      </Suspense>
      {error || !briefing ? (
        <div className="rounded-2xl border border-rose-400/40 bg-rose-950/30 p-6 text-rose-100">
          <p className="font-heading text-xl">The gauges did not answer.</p>
          <p className="mt-2 text-sm opacity-80">{error}</p>
        </div>
      ) : (
        <BriefingPanel briefing={briefing} upcoming={upcoming} />
      )}
    </div>
  );
}
