import type { CalendarDay } from "@/lib/types";
import { cn } from "@/lib/utils";
import { scoreColor } from "@/components/score-pip";
import { MoonDisk } from "@/components/viz/moon-disk";
import { scoreHex } from "@/lib/viz";
import { briefHref } from "@/lib/hrefs";
import { skyWord } from "@/lib/wx";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function TideSpark({ day }: { day: CalendarDay }) {
  if (!day.tides.length && day.tideRangeFt == null) return null;
  const max = Math.max(1.2, ...(day.tides.map((t) => Math.abs(t.height))), day.tideRangeFt ?? 0);
  return (
    <div className="mt-1 space-y-0.5">
      <div className="flex h-1.5 overflow-hidden rounded-full bg-black/20">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, ((day.tideRangeFt ?? 0) / max) * 100)}%`,
            background: "rgba(47,143,214,0.55)",
          }}
        />
      </div>
      <p className="hidden font-mono text-[8px] leading-tight opacity-80 sm:block">
        {day.tides
          .slice(0, 4)
          .map((t) => `${t.type}${t.time}`)
          .join(" ")}
      </p>
    </div>
  );
}

export function MonthGrid({
  year,
  month,
  days,
  timezone,
  title,
  areaId,
  theater,
  activity,
}: {
  year: number;
  month: number;
  days: CalendarDay[];
  timezone: string;
  title?: string;
  areaId: string;
  theater: string;
  activity: string;
}) {
  const localFirst = new Date(`${year}-${String(month).padStart(2, "0")}-01T12:00:00`);
  const pad = localFirst.getDay();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: timezone });

  return (
    <div>
      {title ? <h2 className="mb-3 font-heading text-2xl text-[color:var(--cream)]">{title}</h2> : null}
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
            <a
              key={day.date}
              href={briefHref({ areaId, theater, activity, date: day.date })}
              title={`${day.date} · ${day.score} · ${day.moon.name} · ${day.drivers.join(" · ")}`}
              className={cn(
                "min-h-[6.4rem] rounded-xl p-1 text-left sm:min-h-[7.6rem] sm:p-1.5",
                scoreColor(day.score),
                day.date === today && "ring-2 ring-[color:var(--cream)]",
                day.amazing && "outline outline-2 outline-offset-1 outline-[color:var(--gold)]",
                day.yolo && "outline outline-2 outline-offset-1 outline-[color:var(--copper)]",
              )}
            >
              <div className="flex items-start justify-between gap-0.5">
                <span className="text-xs font-semibold">{n}</span>
                <span
                  className="rounded-full px-1 font-mono text-[10px] font-bold"
                  style={{ background: "rgba(18,32,44,0.18)", color: "inherit" }}
                >
                  {day.score.toFixed(0)}
                </span>
              </div>
              <div className="mt-0.5 flex items-center justify-between">
                <span className="text-lg leading-none" aria-hidden>
                  {day.moon.glyph}
                </span>
                {day.windMph != null ? (
                  <span className="text-[9px] opacity-70">{Math.round(day.windMph)}mph</span>
                ) : null}
              </div>
              {skyWord(day.wx) ? (
                <p className="text-[9px] font-semibold uppercase tracking-wide text-[color:var(--copper)]">
                  {skyWord(day.wx)}
                </p>
              ) : null}
              <TideSpark day={day} />
              {day.yolo ? (
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wide">YOLO</p>
              ) : day.amazing ? (
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wide">Go</p>
              ) : null}
            </a>
          );
        })}
      </div>
    </div>
  );
}

export function AmazingChip({
  day,
  areaId,
  theater,
  activity,
}: {
  day: CalendarDay;
  areaId: string;
  theater: string;
  activity: string;
}) {
  return (
    <li>
    <a
      href={briefHref({ areaId, theater, activity, date: day.date })}
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-2",
        day.yolo
          ? "border-[color:var(--copper)]/50 bg-[color:var(--copper)]/10"
          : "border-[color:var(--gold)]/40 bg-[color:var(--gold)]/10",
      )}
      style={{ boxShadow: `inset 3px 0 0 ${scoreHex(day.score)}` }}
    >
      <MoonDisk phase={day.moon.phase} illumination={day.moon.illumination} size={40} />
      <div className="min-w-0">
        <p className="font-medium text-[color:var(--cream)]">
          {day.date.slice(5)} · {day.score.toFixed(1)}
        </p>
        <p className="truncate text-xs text-[color:var(--cream)]/65">
          {day.yolo ? "YOLO · " : ""}
          {day.moon.name.toLowerCase()} · {day.moon.springNeap}
          {day.tides.length ? ` · ${day.tides.map((t) => `${t.type} ${t.time}`).join(", ")}` : ""}
          {day.tideRangeFt != null ? ` · Δ ${day.tideRangeFt.toFixed(1)} ft` : ""}
        </p>
      </div>
    </a>
    </li>
  );
}
