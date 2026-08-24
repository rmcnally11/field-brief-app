import type { CalendarDay } from "@/lib/types";
import { formatYmdLong } from "@/lib/time";
import { briefHref } from "@/lib/hrefs";

export function YoloBanner({
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
    <a
      href={briefHref({ areaId, theater, activity, date: day.date })}
      className="block rounded-3xl border border-[color:var(--copper)] bg-[color:var(--copper)]/10 px-5 py-4"
    >
      <p className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--copper)]">Monthly YOLO day</p>
      <p className="mt-1 font-heading text-2xl text-[color:var(--cream)]">
        {formatYmdLong(day.date, timezone)} · {day.score.toFixed(1)}
      </p>
      <p className="mt-1 text-sm text-[color:var(--cream)]/65">
        Best remaining dry day this month with a real wind forecast
        {day.amazing ? " — and it is a copper day." : "."} {day.drivers.join(" · ")}
      </p>
    </a>
  );
}
