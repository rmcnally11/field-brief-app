import type { Briefing } from "@/lib/types";
import { goWhen } from "@/lib/go-when";
import { DockPostedHandoff } from "@/components/dock-posted-handoff";

export function GoWhen({ today, tomorrow }: { today: Briefing; tomorrow: Briefing }) {
  const row = goWhen(today, tomorrow);
  return (
    <section className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">Today or tomorrow</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-heading text-2xl text-[color:var(--cream)]">{row.title}</h2>
        <p className="font-mono text-sm text-[color:var(--cream)]/70">
          {row.todayScore.toFixed(1)} today · {row.tomorrowScore.toFixed(1)} tomorrow
        </p>
      </div>
      <p className="mt-2 text-sm text-[color:var(--cream)]/75">{row.line}</p>
      <p className="mt-2 text-sm text-[color:var(--cream)]/55">{row.driver}</p>
      <a
        href={row.tomorrowHref}
        className="mt-4 inline-block text-sm text-[color:var(--sea)] underline decoration-[color:var(--sea)]/40 underline-offset-4"
      >
        Open {row.tomorrowLabel}
      </a>
      <DockPostedHandoff theater={today.area.theater} areaId={today.area.id} />
    </section>
  );
}
