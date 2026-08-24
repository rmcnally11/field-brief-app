import type { CalendarDay } from "@/lib/types";
import { MoonDisk } from "@/components/viz/moon-disk";
import { scoreHex, scoreInk } from "@/lib/viz";
import { cn } from "@/lib/utils";

function weekday(ymd: string, timezone: string) {
  const d = new Date(`${ymd}T12:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short", timeZone: timezone });
}

export function UpcomingStrip({
  days,
  timezone,
  hrefBase = "/calendar",
}: {
  days: CalendarDay[];
  timezone: string;
  hrefBase?: string;
}) {
  if (!days.length) {
    return (
      <p className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)] p-4 text-sm text-[color:var(--cream)]/55">
        The two-week strip is empty — the calendar fetch did not return days.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">Next two weeks</p>
          <h2 className="font-heading text-2xl text-[color:var(--cream)]">Look at the water, not the table</h2>
        </div>
        <a href={hrefBase} className="text-xs text-[color:var(--cream)]/55 underline decoration-[color:var(--copper)]/40">
          Full calendar
        </a>
      </div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        {days.map((day) => {
          const hex = scoreHex(day.score);
          const ink = scoreInk(day.score);
          return (
            <article
              key={day.date}
              className={cn(
                "w-[5.6rem] shrink-0 rounded-2xl border p-2 text-center",
                day.amazing
                  ? "border-[color:var(--copper)] bg-[color:var(--copper)]/15"
                  : "border-[color:var(--line)] bg-[color:var(--panel)]",
              )}
              title={day.drivers.join(" · ")}
            >
              <p className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--cream)]/45">
                {weekday(day.date, timezone)}
              </p>
              <p className="font-heading text-lg text-[color:var(--cream)]">{Number(day.date.slice(-2))}</p>
              <div className="mx-auto my-1">
                <MoonDisk phase={day.moon.phase} illumination={day.moon.illumination} size={44} />
              </div>
              <div
                className="mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full font-mono text-[11px] font-semibold"
                style={{ background: hex, color: ink }}
              >
                {day.score.toFixed(0)}
              </div>
              {day.tideRangeFt != null ? (
                <p className="mt-1 font-mono text-[9px] text-[color:var(--cream)]/45">Δ{day.tideRangeFt.toFixed(1)}ft</p>
              ) : null}
              {day.amazing ? (
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-[color:var(--copper)]">Go</p>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
