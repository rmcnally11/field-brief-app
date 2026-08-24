import { Suspense } from "react";
import { getArea } from "@/lib/data/areas";
import { parseActivity } from "@/lib/briefing";
import { FilterBar } from "@/components/filters";
import { CalendarBody, CalendarSkeleton } from "@/components/calendar-body";
import { clockParts } from "@/lib/time";
import { Waterline } from "@/components/viz/waterline";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; activity?: string; theater?: string; month?: string }>;
}) {
  const q = await searchParams;
  const area = getArea(q.area);
  const activity = parseActivity(q.activity);
  const now = clockParts(new Date(), area.timezone);
  let year = now.year;
  let month = now.month;
  if (q.month && /^\d{4}-\d{2}$/.test(q.month)) {
    year = Number(q.month.slice(0, 4));
    month = Number(q.month.slice(5, 7));
  }
  const prev = new Date(Date.UTC(year, month - 2, 1));
  const next = new Date(Date.UTC(year, month, 1));
  const href = (y: number, m: number) => {
    const p = new URLSearchParams();
    p.set("area", area.id);
    p.set("theater", area.theater);
    if (activity !== "all") p.set("activity", activity);
    p.set("month", `${y}-${String(m).padStart(2, "0")}`);
    return `/calendar?${p}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">
          This month and next · {area.name}
        </p>
        <h1 className="mt-1 font-heading text-4xl text-[color:var(--cream)] md:text-5xl">Amazing-day calendar</h1>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--cream)]/65">
          Two months for this micro-area. Each cell is a moon, tide range, and a 1–10. Copper
          outline = book it. Wind is only inside the forecast; farther out is tide + moon + season.
          Station {area.noaaStation ?? "modeled M2"}.
        </p>
        <Waterline className="mt-3" />
      </div>
      <Suspense>
        <FilterBar areaId={area.id} activity={activity} theater={q.theater ?? area.theater} />
      </Suspense>
      <div className="flex items-center justify-between">
        <a className="text-sm text-[color:var(--cream)]/70 hover:text-[color:var(--cream)]" href={href(prev.getUTCFullYear(), prev.getUTCMonth() + 1)}>
          ← Previous pair
        </a>
        <a className="text-sm text-[color:var(--cream)]/70 hover:text-[color:var(--cream)]" href={href(next.getUTCFullYear(), next.getUTCMonth() + 1)}>
          Next pair →
        </a>
      </div>
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarBody area={area} activity={activity} year={year} month={month} />
      </Suspense>
      <div className="flex flex-wrap gap-3 text-xs text-[color:var(--cream)]/50">
        <span className="rounded bg-rose-400/90 px-2 py-0.5 text-rose-950">1–3 stay home / structure</span>
        <span className="rounded bg-orange-400 px-2 py-0.5 text-orange-950">4–5 workable if you pick water</span>
        <span className="rounded bg-amber-300 px-2 py-0.5 text-amber-950">6–7 go</span>
        <span className="rounded bg-teal-400 px-2 py-0.5 text-teal-950">8–10 with a wind forecast + gold = amazing</span>
      </div>
    </div>
  );
}
