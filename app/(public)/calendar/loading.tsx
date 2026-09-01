import { CalendarSkeleton } from "@/components/calendar-body";
import { Waterline } from "@/components/viz/waterline";

export default function CalendarLoading() {
  return (
    <div className="space-y-6">
      <div>
        <p className="kicker text-[color:var(--copper)]">This month and next</p>
        <h1 className="page-title mt-3 text-[color:var(--cream)]">Amazing-day calendar</h1>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--cream)]/65">
          Pulling hi/lo tides and the wind grid for this pair of months.
        </p>
        <Waterline className="mt-3" />
      </div>
      <CalendarSkeleton />
    </div>
  );
}
