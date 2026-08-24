import { getNewsletter, incidentalNoise } from "@/lib/newsletter";
import { theaterLabel } from "@/lib/data/fundamentals";
import { ScorePip } from "@/components/score-pip";
import { ScoreRing } from "@/components/viz/score-ring";
import { Waterline } from "@/components/viz/waterline";
import { Badge } from "@/components/ui/badge";
import type { DeskIssue } from "@/lib/newsletter";

export const dynamic = "force-dynamic";

function tideLabel(desk: DeskIssue) {
  const tides = desk.briefing?.conditions.tides;
  if (!tides) return desk.seasonal;
  const stage = tides.stage.replace("-", " ");
  const anomaly =
    tides.anomalyFt != null
      ? `${tides.anomalyFt >= 0 ? "+" : ""}${tides.anomalyFt.toFixed(1)} ft vs the table`
      : null;
  return [stage, anomaly].filter(Boolean).join(" · ");
}

function weatherLine(desk: DeskIssue) {
  const w = desk.briefing?.conditions.weather;
  const water = desk.briefing?.conditions.waterTempF;
  if (!w && water == null) return null;
  const wind =
    w?.windMph != null
      ? `${Math.round(w.windMph)} mph${w.windCardinal ? ` ${w.windCardinal}` : ""}`
      : "wind quiet";
  const temp = water != null ? `${Math.round(water)}°F water` : null;
  return [wind, temp].filter(Boolean).join(" · ");
}

function DeskCard({ desk }: { desk: DeskIssue }) {
  const briefing = desk.briefing;
  const inPlay =
    briefing?.species.filter((s) => s.inPlay && s.species.role === "primary").slice(0, 4) ?? [];
  const window = briefing?.when[0];
  const href = `/?area=${desk.areaId}&theater=${desk.theater}`;

  return (
    <article className="flex flex-col rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">
            {desk.desk}
          </p>
          <h2 className="mt-1 font-heading text-2xl text-[color:var(--cream)]">
            {briefing?.area.shortName ?? theaterLabel(desk.theater)}
          </h2>
          <p className="text-xs text-[color:var(--cream)]/45">{desk.kicker}</p>
        </div>
        {briefing ? (
          <ScoreRing score={briefing.overall} size={88} label="Today" sub={briefing.confidence} />
        ) : (
          <Badge variant="secondary" className="bg-rose-50 text-rose-900">
            Gauge quiet
          </Badge>
        )}
      </div>

      {briefing ? (
        <p className="mt-4 font-heading text-lg leading-snug text-[color:var(--cream)]">
          {briefing.headline}
        </p>
      ) : (
        <p className="mt-4 text-sm text-rose-900">{desk.error}</p>
      )}

      <p className="mt-3 text-sm text-[color:var(--cream)]/70">{desk.seasonal}</p>

      {briefing && (
        <dl className="mt-4 space-y-1.5 text-sm text-[color:var(--cream)]/65">
          <div>
            <dt className="inline text-[color:var(--copper)]">Water. </dt>
            <dd className="inline">{weatherLine(desk) ?? "Waiting on the station."}</dd>
          </div>
          <div>
            <dt className="inline text-[color:var(--copper)]">Tide. </dt>
            <dd className="inline">{tideLabel(desk)}</dd>
          </div>
          <div>
            <dt className="inline text-[color:var(--copper)]">Moon. </dt>
            <dd className="inline">
              {briefing.conditions.moon.name} · {briefing.conditions.moon.springNeap}
            </dd>
          </div>
          {window && (
            <div>
              <dt className="inline text-[color:var(--copper)]">Window. </dt>
              <dd className="inline">
                {window.label}
                {window.why ? ` — ${window.why}` : ""}
              </dd>
            </div>
          )}
        </dl>
      )}

      {inPlay.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {inPlay.map((s) => (
            <span key={s.species.id} className="inline-flex items-center gap-1.5">
              <ScorePip score={s.score} />
              <span className="text-xs text-[color:var(--cream)]/70">{s.species.commonName}</span>
            </span>
          ))}
        </div>
      )}

      {briefing?.why.slice(0, 2).map((line) => (
        <p key={line} className="mt-3 text-sm text-[color:var(--cream)]/60">
          — {line}
        </p>
      ))}

      <a
        href={href}
        className="mt-5 text-sm text-[color:var(--sea)] underline decoration-[color:var(--sea)]/40 underline-offset-4"
      >
        Open the {briefing?.area.shortName ?? "desk"} brief
      </a>
    </article>
  );
}

export default async function NewsletterPage() {
  let issue;
  let error: string | null = null;
  try {
    issue = await getNewsletter();
  } catch (e) {
    error = e instanceof Error ? e.message : "The letter did not set.";
  }

  if (error || !issue) {
    return (
      <div className="rounded-2xl border border-rose-400/40 bg-rose-50 p-6 text-rose-900">
        <p className="font-heading text-xl">The letter did not set.</p>
        <p className="mt-2 text-sm opacity-80">{error}</p>
      </div>
    );
  }

  const noise = incidentalNoise(issue.month);
  const liveDesks = issue.desks.filter((d) => d.briefing).length;

  return (
    <div className="space-y-10">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--copper)]">
          The Field Letter · Vol. 1 · No. {issue.weekNumber}
        </p>
        <h1 className="mt-2 font-heading text-4xl text-[color:var(--cream)] md:text-6xl">
          Week of the water
        </h1>
        <p className="mt-3 text-sm text-[color:var(--cream)]/55">
          {issue.rangeLabel} · {issue.monthName} fundamentals · {liveDesks} of 3 desks live
        </p>
        <Waterline className="mx-auto mt-4 max-w-xl" />
      </header>

      <article className="mx-auto max-w-3xl">
        <p className="font-heading text-2xl leading-snug text-[color:var(--cream)] md:text-3xl">
          {issue.letter}
        </p>
        <p className="mt-4 text-sm text-[color:var(--cream)]/50">
          Drawn from Galveston, Venice, Islamorada, Andros, and Ascension — one desk per theater, not
          every micro-area. Scores are 1–10. They are not bite guarantees.{" "}
          <a href="/fundamentals" className="text-[color:var(--sea)] underline underline-offset-4">
            Read this month’s seasonal fundamentals
          </a>
          .
        </p>
      </article>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">
              Five desks
            </p>
            <h2 className="font-heading text-3xl text-[color:var(--cream)]">This week, live</h2>
          </div>
          <p className="text-xs text-[color:var(--cream)]/45">
            Texas · Louisiana · Florida · Bahamas · Mexico · not every micro-area
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {issue.desks.map((desk) => (
            <DeskCard key={desk.areaId} desk={desk} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">
            Box score · {issue.monthName}
          </p>
          <h2 className="mt-1 font-heading text-2xl text-[color:var(--cream)]">In peak this month</h2>
          {issue.peaks.length === 0 ? (
            <p className="mt-3 text-sm text-[color:var(--cream)]/60">
              No primary species is marked peak this month. Check present fish on the{" "}
              <a href="/fundamentals" className="underline">
                season page
              </a>
              .
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {issue.peaks.map((p) => (
                <li key={p.name}>
                  <p className="font-heading text-lg text-[color:var(--cream)]">{p.name}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--cream)]/40">
                    {p.theaters}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--cream)]/65">{p.why}</p>
                </li>
              ))}
            </ul>
          )}
          {noise.length > 0 && (
            <p className="mt-4 text-xs text-[color:var(--cream)]/45">
              Noise, not the headline: {noise.join(", ")}.
            </p>
          )}
        </article>

        <article className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">Rules</p>
          <h2 className="mt-1 font-heading text-2xl text-[color:var(--cream)]">Closed or closing</h2>
          {issue.closures.length === 0 ? (
            <p className="mt-3 text-sm text-[color:var(--cream)]/65">
              No coast-wide harvest closure is on the board this week. Still verify TPWD, FWC, and
              Bahamas flats rules before you keep a fish.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {issue.closures.map((c) => (
                <li key={c.title}>
                  <p className="font-heading text-lg text-[color:var(--copper)]">{c.title}</p>
                  <p className="mt-1 text-sm text-[color:var(--cream)]/70">{c.body}</p>
                </li>
              ))}
            </ul>
          )}
          <a
            href={`/fundamentals?month=${issue.month}`}
            className="mt-5 inline-block text-sm text-[color:var(--sea)] underline underline-offset-4"
          >
            {issue.monthName} by region, type, and species
          </a>
        </article>
      </section>
    </div>
  );
}
