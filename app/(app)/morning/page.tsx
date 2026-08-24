import { getBriefing, parseBriefDate } from "@/lib/briefing";
import { getYoloDay } from "@/lib/calendar";
import { morningLine } from "@/lib/morning";
import { readWaterPref, resolveDesk } from "@/lib/prefs";
import { CopyLine } from "@/components/copy-line";
import { YoloBanner } from "@/components/yolo-banner";
import { Waterline } from "@/components/viz/waterline";
import { ScoreRing } from "@/components/viz/score-ring";
import { briefHref, calendarHref } from "@/lib/hrefs";
import { DESKS } from "@/lib/desks";
import { MorningMail } from "@/components/morning-mail";

export const dynamic = "force-dynamic";

export default async function MorningPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; activity?: string; theater?: string; date?: string }>;
}) {
  const q = await searchParams;
  const pref = await readWaterPref();
  const desk = resolveDesk(q, pref);
  const date = parseBriefDate(q.date);
  const [briefing, yolo, desks] = await Promise.all([
    getBriefing(desk.area.id, desk.activity, date),
    getYoloDay(desk.area, desk.activity),
    Promise.allSettled(DESKS.map((d) => getBriefing(d.areaId))),
  ]);
  const line = morningLine(briefing, yolo);
  const others = DESKS.map((meta, i) => {
    const result = desks[i];
    return {
      meta,
      briefing: result.status === "fulfilled" ? result.value : null,
    };
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">Morning dispatch</p>
        <h1 className="mt-1 font-heading text-4xl text-[color:var(--cream)] md:text-5xl">One line, then go</h1>
        <p className="mt-2 text-sm text-[color:var(--cream)]/65">
          No account. No text service on Hobby. Copy it, or leave an email for the 5am dispatch. The brief stays live.
        </p>
        <Waterline className="mt-3" />
      </div>
      <article className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--copper)]">
              {briefing.area.shortName}
            </p>
            <p className="mt-2 font-heading text-3xl leading-snug text-[color:var(--cream)]">{line}</p>
          </div>
          <ScoreRing score={briefing.overall} size={88} label={briefing.kind === "today" ? "Today" : "Day"} />
        </div>
        <div className="mt-5">
          <CopyLine text={line} />
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
            href={calendarHref({ areaId: briefing.area.id, theater: briefing.area.theater, activity: briefing.activity })}
            className="text-[color:var(--cream)]/60 underline"
          >
            Calendar
          </a>
        </div>
      </article>
      <MorningMail defaultDesk={briefing.area.id} source="Morning" />
      {yolo ? (
        <YoloBanner
          day={yolo}
          areaId={briefing.area.id}
          theater={briefing.area.theater}
          activity={briefing.activity}
          timezone={briefing.area.timezone}
        />
      ) : null}
      <section>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">Seven desks</p>
        <h2 className="mt-1 font-heading text-2xl text-[color:var(--cream)]">Same morning, other water</h2>
        <ul className="mt-4 space-y-3">
          {others.map(({ meta, briefing: other }) => (
            <li key={meta.areaId}>
              <a
                href={`/morning?area=${meta.areaId}&theater=${meta.theater}`}
                className="block rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)] px-4 py-3"
              >
                <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--cream)]/45">{meta.desk}</p>
                <p className="mt-1 text-sm text-[color:var(--cream)]/80">
                  {other
                    ? morningLine(other, meta.areaId === briefing.area.id ? yolo : null)
                    : `${meta.kicker}. Gauge quiet.`}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
