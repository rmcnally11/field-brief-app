import { Suspense } from "react";
import { getArea } from "@/lib/data/areas";
import { parseActivity } from "@/lib/briefing";
import { buildCalendarRange } from "@/lib/calendar";
import { FilterBar } from "@/components/filters";
import { AmazingChip, MonthGrid } from "@/components/month-grid";
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

  let months;
  let error: string | null = null;
  try {
    months = await buildCalendarRange(area, year, month, activity, 2);
  } catch (e) {
    error = e instanceof Error ? e.message : "Calendar failed.";
  }

  const amazing = (months ?? []).flatMap((m) => m.days.filter((d) => d.amazing));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">
          This month and next · {area.name}
        </p>
        <h1 className="mt-1 font-heading text-4xl text-[color:var(--cream)] md:text-5xl">Amazing-day calendar</h1>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--cream)]/65">
          Two months for this micro-area. Each cell is a moon disk, tide range, and a 1–10. Copper
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
      {amazing.length > 0 && (
        <section>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--copper)]">
            Amazing days on {area.shortName}
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {amazing.map((d) => (
              <AmazingChip key={d.date} day={d} />
            ))}
          </ul>
        </section>
      )}
      {error || !months ? (
        <p className="text-rose-200">{error}</p>
      ) : (
        <div className="grid gap-10 xl:grid-cols-2">
          {months.map((m) => (
            <MonthGrid
              key={`${m.year}-${m.month}`}
              year={m.year}
              month={m.month}
              days={m.days}
              timezone={area.timezone}
              title={m.label}
            />
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-3 text-xs text-[color:var(--cream)]/50">
        <span className="rounded bg-rose-400/90 px-2 py-0.5 text-rose-950">1–3 stay home / structure</span>
        <span className="rounded bg-orange-400 px-2 py-0.5 text-orange-950">4–5 workable if you pick water</span>
        <span className="rounded bg-amber-300 px-2 py-0.5 text-amber-950">6–7 go</span>
        <span className="rounded bg-teal-400 px-2 py-0.5 text-teal-950">8–10 / copper outline = amazing</span>
      </div>
    </div>
  );
}
