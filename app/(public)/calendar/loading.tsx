import { CalendarSkeleton } from "@/components/calendar-body";
import { Waterline } from "@/components/viz/waterline";

export default function CalendarLoading() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">This month and next</p>
        <h1 className="mt-1 font-heading text-4xl text-[color:var(--cream)] md:text-5xl">Amazing-day calendar</h1>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--cream)]/65">
          Pulling hi/lo tides and the wind grid for this pair of months.
        </p>
        <Waterline className="mt-3" />
      </div>
      <CalendarSkeleton />
    </div>
  );
}
