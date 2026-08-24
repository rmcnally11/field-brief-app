import { buildCalendarRange } from "@/lib/calendar";
import { AmazingChip, MonthGrid } from "@/components/month-grid";
import type { ActivityId, Area } from "@/lib/types";

export function CalendarSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-2 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-[color:var(--panel)]" />
        ))}
      </div>
      <div className="grid gap-10 xl:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i}>
            <div className="mb-3 h-8 w-48 animate-pulse rounded bg-[color:var(--cream)]/8" />
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, j) => (
                <div key={j} className="min-h-[6.4rem] animate-pulse rounded-xl bg-[color:var(--panel)]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function CalendarBody({
  area,
  activity,
  year,
  month,
}: {
  area: Area;
  activity: ActivityId | "all";
  year: number;
  month: number;
}) {
  let months;
  try {
    months = await buildCalendarRange(area, year, month, activity, 2);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Calendar failed.";
    return <p className="text-rose-800">{message}</p>;
  }

  const amazing = months.flatMap((m) => m.days.filter((d) => d.amazing));

  return (
    <>
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
    </>
  );
}
