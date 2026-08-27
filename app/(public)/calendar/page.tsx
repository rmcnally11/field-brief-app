import { Suspense } from "react";
import { parseActivity } from "@/lib/briefing";
import { FilterBar } from "@/components/filters";
import { CalendarBody, CalendarSkeleton } from "@/components/calendar-body";
import { clockParts } from "@/lib/time";
import { Waterline } from "@/components/viz/waterline";
import { readWaterPref, resolveDeskForTheater } from "@/lib/prefs";
import { tideGauge } from "@/lib/data/tide-gauges";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; activity?: string; theater?: string; month?: string }>;
}) {
  const q = await searchParams;
  const pref = await readWaterPref();
  const desk = resolveDeskForTheater(q, pref);
  const area = desk.area;
  const gauge = tideGauge(area.noaaStation);
  const activity = parseActivity(q.activity ?? desk.activity);
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
          Two months for this micro-area. Each cell is a moon, tide range, sky, and a 1–10 — the
          month recipe, not Today’s ring and not a When window. Copper outline = book it. Rain and
          thunderstorms tax the score — a soaker cannot be a copper day. Wind and sky are only
          inside the forecast; farther out is tide + moon + season.{" "}
          {gauge
            ? `Clock is NOAA ${gauge.id} ${gauge.name} — a tide gauge on the bank, not a weather buoy.`
            : "Clock is a modeled M2 tide. There is no NOAA gauge on this water."}
        </p>
        <Waterline className="mt-3" />
      </div>
      <Suspense>
        <FilterBar areaId={area.id} activity={activity} theater={q.theater ?? area.theater} />
      </Suspense>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <a
          className="rounded-full border border-[color:var(--line)] px-3 py-1 text-xs text-[color:var(--cream)]/70 hover:text-[color:var(--cream)]"
          href={href(prev.getUTCFullYear(), prev.getUTCMonth() + 1)}
        >
          Previous pair
        </a>
        <a
          className="rounded-full border border-[color:var(--line)] px-3 py-1 text-xs text-[color:var(--cream)]/70 hover:text-[color:var(--cream)]"
          href={href(next.getUTCFullYear(), next.getUTCMonth() + 1)}
        >
          Next pair
        </a>
      </div>
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarBody area={area} activity={activity} year={year} month={month} />
      </Suspense>
      <div className="flex flex-wrap items-center gap-3 text-xs text-[color:var(--cream)]/55">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#e23b3b] font-mono text-[9px] text-white">2</span>
          stay / structure
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#f0c14b] font-mono text-[9px] text-[#3a2a00]">5</span>
          pick water
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2dd4bf] font-mono text-[9px] text-[#042f2e]">8</span>
          go
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-5 w-5 rounded-md border border-[color:var(--gold)]" />
          gold = amazing dry day
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-5 w-5 rounded-md border border-[color:var(--copper)]" />
          copper = YOLO
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-5 w-5 rounded-md border border-dashed border-[color:var(--line)]" />
          dashed = tide + moon only
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-5 w-5 rounded-md border border-[color:var(--sea)]" />
          sea = a day in your book, or a rhyme
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="16" height="12" viewBox="0 0 18 14" className="text-[color:var(--cream)]/50" aria-hidden>
            <path d="M1 3.6 C6 2.2, 11 4.6, 17 3.1" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          one streamer = light
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="16" height="12" viewBox="0 0 18 14" className="text-[color:var(--coral)]" aria-hidden>
            <path d="M1 3.6 C6 2.2, 11 4.6, 17 3.1" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M1 7 C6 5.6, 11 8, 17 6.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M1 10.4 C6 9, 11 11.4, 17 9.9" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          three = windy
        </span>
      </div>
    </div>
  );
}
