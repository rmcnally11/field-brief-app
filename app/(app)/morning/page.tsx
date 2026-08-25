import { getBriefing, parseBriefDate } from "@/lib/briefing";
import { GoWhen } from "@/components/go-when";
import { addDaysYmd, ymdInZone } from "@/lib/time";
import { getYoloDay } from "@/lib/calendar";
import { morningLine } from "@/lib/morning";
import { readWaterPref, resolveDeskForTheater } from "@/lib/prefs";
import { siteOrigin } from "@/lib/brand";
import { CopyLine } from "@/components/copy-line";
import { YoloBanner } from "@/components/yolo-banner";
import { Waterline } from "@/components/viz/waterline";
import { ScoreRing } from "@/components/viz/score-ring";
import { briefHref, calendarHref, morningHref } from "@/lib/hrefs";
import { DESKS } from "@/lib/desks";
import { areasInTheater } from "@/lib/data/areas";
import { theaterLabel, THEATER_META } from "@/lib/data/theaters";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MorningPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; activity?: string; theater?: string; date?: string }>;
}) {
  const q = await searchParams;
  const pref = await readWaterPref();
  const desk = resolveDeskForTheater(q, pref);
  const date = parseBriefDate(q.date);
  const coast = areasInTheater(desk.area.theater);
  const todayYmd = date ?? ymdInZone(new Date(), desk.area.timezone);
  const tomorrowYmd = addDaysYmd(todayYmd, 1);
  const [briefing, yolo, tomorrow, coastBriefs] = await Promise.all([
    getBriefing(desk.area.id, desk.activity, date),
    getYoloDay(desk.area, desk.activity),
    date
      ? Promise.resolve(null)
      : getBriefing(desk.area.id, desk.activity, tomorrowYmd).catch(() => null),
    Promise.allSettled(
      coast.filter((a) => a.id !== desk.area.id).map((a) => getBriefing(a.id, desk.activity, date)),
    ),
  ]);
  const line = morningLine(briefing, yolo);
  const neighbors = coast
    .filter((a) => a.id !== desk.area.id)
    .map((area, i) => {
      const result = coastBriefs[i];
      return {
        area,
        briefing: result.status === "fulfilled" ? result.value : null,
      };
    });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">
          {theaterLabel(briefing.area.theater)} · {briefing.area.shortName}
        </p>
        <h1 className="mt-1 font-heading text-4xl text-[color:var(--cream)] md:text-5xl">This morning</h1>
        <p className="mt-2 text-sm text-[color:var(--cream)]/65">
          One sentence for the water on Today. Copy it. The gauges stay on the brief.
        </p>
        <Waterline className="mt-3" />
      </div>

      <nav className="flex flex-wrap gap-1.5">
        {THEATER_META.map((t) => {
          const lead = DESKS.find((d) => d.theater === t.id)?.areaId ?? desk.area.id;
          const on = briefing.area.theater === t.id;
          return (
            <a
              key={t.id}
              href={morningHref({ areaId: on ? briefing.area.id : lead, theater: t.id, activity: briefing.activity })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs uppercase tracking-[0.14em]",
                on
                  ? "border-[color:var(--sea)] bg-[color:var(--sea)]/20 text-[color:var(--cream)]"
                  : "border-[color:var(--line)] text-[color:var(--cream)]/60 hover:text-[color:var(--cream)]",
              )}
            >
              {t.short}
            </a>
          );
        })}
      </nav>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {coast.map((a) => (
          <a
            key={a.id}
            href={morningHref({ areaId: a.id, theater: a.theater, activity: briefing.activity })}
            className={cn(
              "shrink-0 rounded-md px-2.5 py-1 text-sm",
              a.id === briefing.area.id
                ? "bg-[color:var(--cream)] text-[color:var(--ink)]"
                : "bg-[color:var(--cream)]/5 text-[color:var(--cream)]/70 hover:bg-[color:var(--cream)]/10",
            )}
          >
            {a.shortName}
          </a>
        ))}
      </div>

      <article className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--copper)]">
              {briefing.area.name}
            </p>
            <p className="mt-2 font-heading text-3xl leading-snug text-[color:var(--cream)]">{line}</p>
          </div>
          <ScoreRing score={briefing.overall} size={88} label={briefing.kind === "today" ? "Today" : "Day"} />
        </div>
        <div className="mt-5">
          <CopyLine
            text={line}
            url={`${siteOrigin()}${briefHref({
              areaId: briefing.area.id,
              theater: briefing.area.theater,
              activity: briefing.activity,
              date,
            })}`}
          />
        </div>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <a
            href={briefHref({
              areaId: briefing.area.id,
              theater: briefing.area.theater,
              activity: briefing.activity,
              date,
            })}
            className="text-[color:var(--sea)] underline decoration-[color:var(--sea)]/40"
          >
            Open the brief
          </a>
          <a
            href={calendarHref({
              areaId: briefing.area.id,
              theater: briefing.area.theater,
              activity: briefing.activity,
            })}
            className="text-[color:var(--cream)]/60 underline"
          >
            Calendar
          </a>
        </div>
      </article>

      {tomorrow && briefing.kind === "today" ? <GoWhen today={briefing} tomorrow={tomorrow} /> : null}

      {yolo ? (
        <YoloBanner
          day={yolo}
          areaId={briefing.area.id}
          theater={briefing.area.theater}
          activity={briefing.activity}
          timezone={briefing.area.timezone}
        />
      ) : null}

      {neighbors.length > 0 ? (
        <section>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">
            {theaterLabel(briefing.area.theater)}
          </p>
          <h2 className="mt-1 font-heading text-2xl text-[color:var(--cream)]">Also this morning</h2>
          <ul className="mt-4 space-y-3">
            {neighbors.map(({ area, briefing: other }) => (
              <li key={area.id}>
                <a
                  href={morningHref({ areaId: area.id, theater: area.theater, activity: briefing.activity })}
                  className="block rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)] px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--cream)]/45">{area.shortName}</p>
                  <p className="mt-1 text-sm text-[color:var(--cream)]/80">
                    {other ? morningLine(other) : `${area.shortName} is quiet. The gauge did not answer.`}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
