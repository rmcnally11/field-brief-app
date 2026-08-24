import type { CalendarDay } from "@/lib/types";
import { cn } from "@/lib/utils";
import { scoreColor } from "@/components/score-pip";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmtTide(day: CalendarDay) {
  if (!day.tides.length) {
    return day.tideRangeFt != null ? `Δ ${day.tideRangeFt.toFixed(1)} ft` : "";
  }
  return day.tides
    .slice(0, 4)
    .map((t) => `${t.type}${t.time}`)
    .join(" ");
}

export function MonthGrid({
  year,
  month,
  days,
  timezone,
  title,
}: {
  year: number;
  month: number;
  days: CalendarDay[];
  timezone: string;
  title?: string;
}) {
  const localFirst = new Date(`${year}-${String(month).padStart(2, "0")}-01T12:00:00`);
  const pad = localFirst.getDay();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: timezone });

  return (
    <div>
      {title ? (
        <h2 className="mb-3 font-heading text-2xl text-[color:var(--cream)]">{title}</h2>
      ) : null}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-[0.14em] text-[color:var(--cream)]/40">
        {DOW.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: pad }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const n = Number(day.date.slice(-2));
          return (
            <div
              key={day.date}
              title={`${day.date} · ${day.score} · ${day.moon.name} · ${day.drivers.join(" · ")}`}
              className={cn(
                "min-h-[5.5rem] rounded-lg p-1 text-left sm:min-h-24 sm:p-1.5",
                scoreColor(day.score),
                day.date === today && "ring-2 ring-[color:var(--cream)]",
                day.amazing && "outline outline-2 outline-offset-1 outline-[color:var(--copper)]",
              )}
            >
              <div className="flex items-start justify-between gap-0.5">
                <span className="text-xs font-semibold">{n}</span>
                <span className="font-mono text-[11px]">{day.score.toFixed(0)}</span>
              </div>
              <p className="mt-0.5 text-[11px] leading-none">
                {day.moon.glyph}{" "}
                <span className="hidden sm:inline">{day.moon.springNeap}</span>
              </p>
              <p className="mt-1 line-clamp-2 font-mono text-[9px] leading-tight opacity-80 sm:text-[10px]">
                {fmtTide(day)}
              </p>
              {day.amazing ? (
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wide">Go</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
