import { getBriefing, parseActivity, parseBriefDate } from "@/lib/briefing";
import { AREAS, getArea, neighborArea } from "@/lib/data/areas";
import { THEATER_META } from "@/lib/data/theaters";
import { readWaterPref } from "@/lib/prefs";
import { ScoreRing } from "@/components/viz/score-ring";
import { Waterline } from "@/components/viz/waterline";
import { WindTable } from "@/components/wind-table";
import { compareHref, briefHref } from "@/lib/hrefs";
import { formatYmdLong } from "@/lib/time";
import type { Briefing } from "@/lib/types";

export const dynamic = "force-dynamic";

function DeskColumn({ briefing, error }: { briefing?: Briefing; error?: string }) {
  if (error || !briefing) {
    return (
      <div className="rounded-3xl border border-rose-400/40 bg-rose-50 p-5 text-rose-900">
        <p className="font-heading text-xl">Gauge quiet</p>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    );
  }
  const { area, conditions } = briefing;
  return (
    <article className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">
            {area.theater} · {area.shortName}
          </p>
          <h2 className="mt-1 font-heading text-3xl text-[color:var(--cream)]">{area.name}</h2>
        </div>
        <ScoreRing
          score={briefing.overall}
          size={92}
          label={briefing.kind === "today" ? "Today" : "Day"}
          sub={briefing.confidence}
        />
      </div>
      <p className="mt-4 font-heading text-xl leading-snug text-[color:var(--cream)]">{briefing.headline}</p>
      <p className="mt-3 text-sm text-[color:var(--cream)]/65">
        {conditions.weather.windMph != null
          ? `${Math.round(conditions.weather.windMph)} mph ${conditions.weather.windCardinal ?? ""}`.trim()
          : "Wind not in"}
        {conditions.tides.stage ? ` · ${conditions.tides.stage.replace("-", " ")}` : ""}
      </p>
      {(area.theater === "texas" || area.theater === "louisiana" || conditions.tides.anomalyFt != null) && (
        <div className="mt-4">
          <WindTable
            anomalyFt={conditions.tides.anomalyFt}
            series={conditions.tides.anomalySeries}
            theater={area.theater}
          />
        </div>
      )}
      <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-[color:var(--copper)]">Where</p>
      <ul className="mt-2 space-y-2 text-sm text-[color:var(--cream)]/70">
        {briefing.where.slice(0, 3).map((pick) => (
          <li key={pick.spot.id}>
            <span className="font-medium text-[color:var(--cream)]">{pick.spot.name}</span>
            <span className="text-[color:var(--cream)]/45"> · {pick.score.toFixed(1)}</span>
            <span className="block text-xs text-[color:var(--cream)]/50">{pick.why[0]}</span>
          </li>
        ))}
      </ul>
      <a
        href={briefHref({
          areaId: area.id,
          theater: area.theater,
          activity: briefing.activity,
          date: briefing.kind === "today" ? null : briefing.forDate,
        })}
        className="mt-5 inline-block text-sm text-[color:var(--sea)] underline decoration-[color:var(--sea)]/40"
      >
        Open the {area.shortName} brief
      </a>
    </article>
  );
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string; activity?: string; date?: string }>;
}) {
  const q = await searchParams;
  const pref = await readWaterPref();
  const left = getArea(q.a ?? pref?.areaId);
  const right = getArea(q.b && q.b !== left.id ? q.b : neighborArea(left).id);
  const activity = parseActivity(q.activity ?? pref?.activity);
  const date = parseBriefDate(q.date);

  const [leftSettled, rightSettled] = await Promise.allSettled([
    getBriefing(left.id, activity, date),
    getBriefing(right.id, activity, date),
  ]);

  const leftBrief = leftSettled.status === "fulfilled" ? leftSettled.value : undefined;
  const rightBrief = rightSettled.status === "fulfilled" ? rightSettled.value : undefined;
  const dayLabel = date ? formatYmdLong(date, left.timezone) : "this morning";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">Stay or drive</p>
        <h1 className="mt-1 font-heading text-4xl text-[color:var(--cream)] md:text-5xl">Two desks, one day</h1>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--cream)]/65">
          {dayLabel}. Same method. Same 1–10. Pick the water, not the drive you already decided.
        </p>
        <Waterline className="mt-3" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {THEATER_META.filter((t) => t.id === left.theater || t.id === right.theater).map((t) => (
          <span
            key={t.id}
            className="rounded-full border border-[color:var(--sea)] bg-[color:var(--sea)]/15 px-3 py-1 text-xs uppercase tracking-[0.14em]"
          >
            {t.label}
          </span>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[color:var(--cream)]/40">Left desk</p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {AREAS.map((area) => (
              <a
                key={`l-${area.id}`}
                href={compareHref({ a: area.id, b: right.id, activity, date })}
                className={`rounded-md px-2.5 py-1 text-sm ${
                  area.id === left.id
                    ? "bg-[color:var(--cream)] text-[color:var(--ink)]"
                    : "bg-[color:var(--cream)]/5 text-[color:var(--cream)]/70"
                }`}
              >
                {area.shortName}
              </a>
            ))}
          </div>
          <DeskColumn
            briefing={leftBrief}
            error={leftSettled.status === "rejected" ? String(leftSettled.reason) : undefined}
          />
        </div>
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[color:var(--cream)]/40">Right desk</p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {AREAS.map((area) => (
              <a
                key={`r-${area.id}`}
                href={compareHref({ a: left.id, b: area.id, activity, date })}
                className={`rounded-md px-2.5 py-1 text-sm ${
                  area.id === right.id
                    ? "bg-[color:var(--cream)] text-[color:var(--ink)]"
                    : "bg-[color:var(--cream)]/5 text-[color:var(--cream)]/70"
                }`}
              >
                {area.shortName}
              </a>
            ))}
          </div>
          <DeskColumn
            briefing={rightBrief}
            error={rightSettled.status === "rejected" ? String(rightSettled.reason) : undefined}
          />
        </div>
      </div>
    </div>
  );
}
