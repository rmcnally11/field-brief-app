import type { CalendarDay } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MoonDisk } from "@/components/viz/moon-disk";
import { scoreHex, scoreInk, sea } from "@/lib/viz";
import { briefHref } from "@/lib/hrefs";
import { skyWord } from "@/lib/wx";
import { formatYmdLong } from "@/lib/time";
import { Waterline } from "@/components/viz/waterline";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function TideSpark({ day }: { day: CalendarDay }) {
  const tides = day.tides.slice(0, 4);
  if (tides.length >= 2) {
    const heights = tides.map((t) => t.height);
    const min = Math.min(...heights);
    const max = Math.max(...heights);
    const span = Math.max(0.25, max - min);
    const w = 52;
    const h = 16;
    const pts = tides
      .map((t, i) => {
        const x = tides.length === 1 ? w / 2 : (i / (tides.length - 1)) * w;
        const y = h - 2 - ((t.height - min) / span) * (h - 4);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="mt-1.5" aria-hidden>
        <polyline points={pts} fill="none" stroke={sea} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (day.tideRangeFt == null) return null;
  return (
    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[color:var(--cream)]/10">
      <div
        className="h-full rounded-full bg-[color:var(--sea)]/70"
        style={{ width: `${Math.min(100, (day.tideRangeFt / 2.4) * 100)}%` }}
      />
    </div>
  );
}

function ScoreDot({ score }: { score: number }) {
  return (
    <span
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-semibold sm:h-7 sm:w-7 sm:text-[11px]"
      style={{ background: scoreHex(score), color: scoreInk(score) }}
    >
      {score.toFixed(0)}
    </span>
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
  const copperDays = days.filter((d) => d.amazing || d.yolo).length;
  const astro = days.filter((d) => d.confidence === "astronomical").length;

  return (
    <section className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)] p-3 sm:p-5">
      {title ? (
        <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-heading text-2xl text-[color:var(--cream)] md:text-3xl">{title}</h2>
            <p className="mt-1 text-xs text-[color:var(--cream)]/45">
              {copperDays
                ? `${copperDays} ${copperDays === 1 ? "day" : "days"} to book`
                : "No copper day in this month yet"}
              {astro ? ` · ${astro} tide + moon only` : ""}
            </p>
          </div>
        </header>
      ) : null}
      {title ? <Waterline className="mb-3" /> : null}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-[0.16em] text-[color:var(--cream)]/40 sm:gap-1.5">
        {DOW.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1 sm:gap-1.5">
        {Array.from({ length: pad }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const n = Number(day.date.slice(-2));
          const past = day.date < today;
          const sky = skyWord(day.wx);
          return (
            <a
              key={day.date}
              href={briefHref({ areaId, theater, activity, date: day.date })}
              title={`${day.date} · ${day.score} · ${day.moon.name} · ${day.drivers.join(" · ")}`}
              className={cn(
                "flex min-h-[6.8rem] flex-col rounded-2xl border bg-[color:var(--ink)] p-1.5 sm:min-h-[8rem] sm:p-2",
                day.yolo
                  ? "border-[color:var(--copper)] shadow-[0_0_0_1px_var(--copper)]"
                  : day.amazing
                    ? "border-[color:var(--gold)] shadow-[0_0_0_1px_var(--gold)]"
                    : "border-[color:var(--line)]",
                day.date === today && "ring-2 ring-[color:var(--cream)] ring-offset-1 ring-offset-[color:var(--panel)]",
                day.confidence === "astronomical" && !day.yolo && !day.amazing && "border-dashed",
                past && "opacity-55",
              )}
            >
              <div className="flex items-start justify-between gap-1">
                <span className="font-heading text-sm leading-none text-[color:var(--cream)] sm:text-base">{n}</span>
                <ScoreDot score={day.score} />
              </div>
              <div className="mt-1 flex items-center justify-between gap-1">
                <MoonDisk
                  phase={day.moon.phase}
                  illumination={day.moon.illumination}
                  size={22}
                  uid={day.date}
                  className="!items-start"
                />
                {day.windMph != null ? (
                  <span className="font-mono text-[9px] text-[color:var(--cream)]/50 sm:text-[10px]">
                    {Math.round(day.windMph)}
                    <span className="opacity-60">mph</span>
                  </span>
                ) : (
                  <span className="text-[9px] uppercase tracking-wide text-[color:var(--cream)]/30">tide</span>
                )}
              </div>
              {sky ? (
                <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-[color:var(--copper)]">
                  {sky}
                </p>
              ) : null}
              <TideSpark day={day} />
              <div className="mt-auto pt-1">
                {day.yolo ? (
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[color:var(--copper)]">YOLO</p>
                ) : day.amazing ? (
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[color:var(--gold)]">Go</p>
                ) : day.confidence === "astronomical" ? (
                  <p className="text-[8px] uppercase tracking-wide text-[color:var(--cream)]/30">Moon</p>
                ) : null}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

export function AmazingChip({
  day,
  areaId,
  theater,
  activity,
  timezone,
}: {
  day: CalendarDay;
  areaId: string;
  theater: string;
  activity: string;
  timezone: string;
}) {
  return (
    <li>
      <a
        href={briefHref({ areaId, theater, activity, date: day.date })}
        className={cn(
          "flex items-center gap-3 rounded-2xl border bg-[color:var(--ink)] p-3",
          day.yolo
            ? "border-[color:var(--copper)]/50"
            : "border-[color:var(--gold)]/40",
        )}
      >
        <MoonDisk
          phase={day.moon.phase}
          illumination={day.moon.illumination}
          size={44}
          uid={`chip-${day.date}`}
        />
        <div className="min-w-0 flex-1">
          <p className="font-heading text-lg text-[color:var(--cream)]">
            {formatYmdLong(day.date, timezone)}
          </p>
          <p className="truncate text-xs text-[color:var(--cream)]/55">
            {day.yolo ? "YOLO · " : "Copper · "}
            {day.moon.name} · {day.moon.springNeap}
            {day.tideRangeFt != null ? ` · Δ ${day.tideRangeFt.toFixed(1)} ft` : ""}
            {day.windMph != null ? ` · ${Math.round(day.windMph)} mph` : ""}
          </p>
        </div>
        <ScoreDot score={day.score} />
      </a>
    </li>
  );
}
