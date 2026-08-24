import type { CalendarDay } from "@/lib/types";
import { cn } from "@/lib/utils";
import { scoreColor } from "@/components/score-pip";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthGrid({
  year,
  month,
  days,
  timezone,
}: {
  year: number;
  month: number;
  days: CalendarDay[];
  timezone: string;
}) {
  const first = new Date(Date.UTC(year, month - 1, 1, 12));
  const startPad = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short" }).format(first);
  const padMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  // Use a reliable pad from UTC weekday of the 1st in local-ish: construct via the date string
  const localFirst = new Date(`${year}-${String(month).padStart(2, "0")}-01T12:00:00`);
  const pad = localFirst.getDay();
  void startPad;
  void padMap;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] uppercase tracking-[0.14em] text-[color:var(--cream)]/40">
        {DOW.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1.5">
        {Array.from({ length: pad }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const n = Number(day.date.slice(-2));
          return (
            <div
              key={day.date}
              title={`${day.date} · ${day.score} · ${day.drivers.join(" · ")}`}
              className={cn(
                "min-h-20 rounded-lg p-1.5 text-left",
                scoreColor(day.score),
                day.date === today && "ring-2 ring-[color:var(--ink)] ring-offset-2 ring-offset-[color:var(--ink)]",
              )}
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold">{n}</span>
                <span className="font-mono text-xs">{day.score.toFixed(0)}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-[10px] leading-tight opacity-80">
                {day.bestWindow ?? day.confidence}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
