import { Suspense } from "react";
import { getArea } from "@/lib/data/areas";
import { parseActivity } from "@/lib/briefing";
import { buildCalendar } from "@/lib/calendar";
import { FilterBar } from "@/components/filters";
import { MonthGrid } from "@/components/month-grid";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; activity?: string; theater?: string; month?: string }>;
}) {
  const q = await searchParams;
  const area = getArea(q.area);
  const activity = parseActivity(q.activity);
  const now = new Date();
  let year = now.getUTCFullYear();
  let month = now.getUTCMonth() + 1;
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

  let days;
  let error: string | null = null;
  try {
    days = await buildCalendar(area, year, month, activity);
  } catch (e) {
    error = e instanceof Error ? e.message : "Calendar failed.";
  }

  const title = new Date(Date.UTC(year, month - 1, 1)).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">
          Monthly 1–10 · {area.name}
        </p>
        <h1 className="mt-1 font-heading text-4xl text-[color:var(--cream)]">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--cream)]/65">
          Color is a score, not a promise. Days inside the weather forecast use wind. Days beyond that
          are tide + moon + season only — that is the honest horizon. Filter by wade, skiff, fly, or
          spin; the wind tax changes.
        </p>
      </div>
      <Suspense>
        <FilterBar areaId={area.id} activity={activity} theater={q.theater ?? area.theater} />
      </Suspense>
      <div className="flex items-center justify-between">
        <Link className="text-sm text-[color:var(--cream)]/70 hover:text-[color:var(--cream)]" href={href(prev.getUTCFullYear(), prev.getUTCMonth() + 1)}>
          ← Previous
        </Link>
        <Link className="text-sm text-[color:var(--cream)]/70 hover:text-[color:var(--cream)]" href={href(next.getUTCFullYear(), next.getUTCMonth() + 1)}>
          Next →
        </Link>
      </div>
      {error || !days ? (
        <p className="text-rose-200">{error}</p>
      ) : (
        <MonthGrid year={year} month={month} days={days} timezone={area.timezone} />
      )}
      <div className="flex flex-wrap gap-3 text-xs text-[color:var(--cream)]/50">
        <span className="rounded bg-rose-400/90 px-2 py-0.5 text-rose-950">1–3 stay home / structure</span>
        <span className="rounded bg-orange-400 px-2 py-0.5 text-orange-950">4–5 workable if you pick water</span>
        <span className="rounded bg-amber-300 px-2 py-0.5 text-amber-950">6–7 go</span>
        <span className="rounded bg-teal-400 px-2 py-0.5 text-teal-950">8–10 the day you booked for</span>
      </div>
    </div>
  );
}
