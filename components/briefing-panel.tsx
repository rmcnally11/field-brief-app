import type { Briefing } from "@/lib/types";
import { ScorePip } from "@/components/score-pip";
import { formatInZone, parseNoaaGmt } from "@/lib/time";
import { Badge } from "@/components/ui/badge";

function tideClock(stamp: string, tz: string) {
  const d = stamp.includes("T") ? new Date(stamp) : parseNoaaGmt(stamp);
  return formatInZone(d, tz, { weekday: "short", hour: "numeric", minute: "2-digit" });
}

export function BriefingPanel({ briefing }: { briefing: Briefing }) {
  const { area, conditions } = briefing;
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">
                {area.theater === "texas" ? "Texas coast" : area.theater === "florida" ? "Miami & the Keys" : "Bahamas"} · {area.name}
              </p>
              <h1 className="mt-2 font-heading text-3xl leading-tight text-[color:var(--cream)] md:text-4xl">
                {briefing.headline}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--cream)]/45">Today</p>
              <ScorePip score={briefing.overall} className="mt-1 min-w-14 text-lg" />
              <p className="mt-1 text-xs text-[color:var(--cream)]/45">{briefing.confidence} confidence</p>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-[color:var(--cream)]/70">{area.summary}</p>
          {briefing.warnings.length > 0 && (
            <ul className="mt-4 space-y-1.5 text-sm text-amber-200/90">
              {briefing.warnings.map((w) => (
                <li key={w}>⚠ {w}</li>
              ))}
            </ul>
          )}
        </div>
        <aside className="grid grid-cols-2 gap-3 md:grid-cols-1">
          <Stat
            label="Tide now"
            value={conditions.tides.stage.replace("-", " ")}
            detail={
              conditions.tides.predictedNow != null
                ? `${conditions.tides.predictedNow.toFixed(2)} ft ${conditions.tides.source === "noaa" ? "MLLW" : "modeled"}`
                : conditions.tides.source
            }
          />
          <Stat
            label="Water"
            value={conditions.waterTempF != null ? `${conditions.waterTempF.toFixed(1)}°F` : "—"}
            detail={conditions.waterTempSource ?? "No gauge on this station"}
          />
          <Stat
            label="Wind"
            value={
              conditions.weather.windMph != null
                ? `${Math.round(conditions.weather.windMph)} mph ${conditions.weather.windCardinal ?? ""}`
                : "—"
            }
            detail={conditions.weather.source.toUpperCase()}
          />
          <Stat
            label="Moon"
            value={conditions.moon.name}
            detail={`${Math.round(conditions.moon.illumination * 100)}% · ${conditions.moon.springNeap} range`}
          />
        </aside>
      </section>

      {conditions.tides.anomalyFt != null && Math.abs(conditions.tides.anomalyFt) >= 0.25 && (
        <p className="rounded-xl border border-[color:var(--copper)]/40 bg-[color:var(--copper)]/10 px-4 py-3 text-sm text-[color:var(--cream)]/85">
          Wind versus the table: observed water is{" "}
          <strong>
            {conditions.tides.anomalyFt > 0 ? "+" : ""}
            {conditions.tides.anomalyFt.toFixed(2)} ft
          </strong>{" "}
          from the NOAA prediction. On the Texas coast this is often the real tide.
        </p>
      )}

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-heading text-2xl text-[color:var(--cream)]">Where</h2>
          {briefing.where.length === 0 ? (
            <p className="text-[color:var(--cream)]/55">No marks match this method on this water.</p>
          ) : (
            <ul className="space-y-3">
              {briefing.where.map((pick) => (
                <li key={pick.spot.id} className="rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-[color:var(--cream)]">{pick.spot.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[color:var(--cream)]/40">
                        {pick.spot.habitat.replace("-", " ")} · {pick.spot.source.replace("-", " ")} · {pick.spot.depth}
                      </p>
                    </div>
                    <ScorePip score={pick.score} />
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--cream)]/70">{pick.spot.note}</p>
                  {pick.spot.gnisId ? (
                    <p className="mt-1 text-xs text-[color:var(--cream)]/40">
                      USGS GNIS{" "}
                      <a
                        className="underline decoration-[color:var(--copper)]/40"
                        href={`https://edits.nationalmap.gov/apps/gaz-domestic/public/search/names/${pick.spot.gnisId}`}
                      >
                        {pick.spot.gnisId}
                      </a>
                    </p>
                  ) : null}
                  <ul className="mt-2 space-y-1 text-sm text-[color:var(--cream)]/55">
                    {pick.why.map((w) => (
                      <li key={w}>— {w}</li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {pick.spot.activities.map((a) => (
                      <Badge key={a} variant="secondary" className="bg-white/5 text-[color:var(--cream)]/70">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-4">
          <h2 className="font-heading text-2xl text-[color:var(--cream)]">When</h2>
          <div className="rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--cream)]/40">Next highs / lows</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {conditions.tides.nextHiLo.slice(0, 6).map((t) => (
                <li key={t.time} className="flex justify-between text-[color:var(--cream)]/80">
                  <span>
                    {t.type === "H" ? "High" : "Low"} · {tideClock(t.time, area.timezone)}
                  </span>
                  <span className="font-mono">{t.height.toFixed(2)} ft</span>
                </li>
              ))}
            </ul>
            {conditions.tides.source === "modeled" && (
              <p className="mt-3 text-xs text-amber-200/80">
                Bahamas tides are modeled from lunar M2, not a NOAA gauge. Use them for windows, not for a bar crossing.
              </p>
            )}
          </div>
          <ul className="space-y-2">
            {briefing.when.length === 0 ? (
              <li className="text-sm text-[color:var(--cream)]/55">No strong moving-water window in the next couple of days — slack-heavy or the clock is wrong.</li>
            ) : (
              briefing.when.map((w) => (
                <li key={w.start} className="rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)] p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[color:var(--cream)]">{w.label}</p>
                    <ScorePip score={w.score} />
                  </div>
                  <p className="mt-1 text-xs text-[color:var(--cream)]/50">
                    {tideClock(w.start, area.timezone)} → {tideClock(w.end, area.timezone)}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--cream)]/65">{w.why}</p>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      {(briefing.access.length > 0 || briefing.legal.length > 0) && (
        <section className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-2xl text-[color:var(--cream)]">Launch and beach access</h2>
            <p className="mt-1 text-xs text-[color:var(--cream)]/45">
              Cited to TPWD, Texas GLO beach-access plans, and NPS. 2WD/4WD is the county plan, not a guess.
            </p>
            {briefing.access.length === 0 ? (
              <p className="mt-3 text-sm text-[color:var(--cream)]/55">No public access pin in this box.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {briefing.access.map((p) => (
                  <li key={p.id} className="rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)] p-3">
                    <p className="font-medium text-[color:var(--cream)]">{p.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[color:var(--cream)]/40">{p.source}</p>
                    <p className="mt-1 text-sm text-[color:var(--cream)]/65">{p.detail}</p>
                    <a
                      className="mt-2 inline-block text-xs text-[color:var(--copper)] underline"
                      href={p.sourceUrl}
                    >
                      Official source
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="font-heading text-2xl text-[color:var(--cream)]">Legal water</h2>
            <p className="mt-1 text-xs text-[color:var(--cream)]/45">
              NOAA FKNMS management zones — Sanctuary Preservation Areas, Ecological Reserves, Research-Only.
            </p>
            {briefing.legal.length === 0 ? (
              <p className="mt-3 text-sm text-[color:var(--cream)]/55">
                No FKNMS polygon in this box. Texas and Bahamas marks are not sanctuary closures.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {briefing.legal.map((p) => (
                  <li key={p.id} className="rounded-xl border border-rose-400/30 bg-rose-950/20 p-3">
                    <p className="font-medium text-[color:var(--cream)]">{p.name}</p>
                    <p className="mt-1 text-sm text-rose-100/80">{p.detail}</p>
                    <a className="mt-2 inline-block text-xs text-[color:var(--copper)] underline" href={p.sourceUrl}>
                      FKNMS GIS
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-heading text-2xl text-[color:var(--cream)]">Why — and who</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-[color:var(--cream)]/70">
          {briefing.why.map((w) => (
            <li key={w}>— {w}</li>
          ))}
        </ul>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {briefing.species.map((s) => (
            <article key={s.species.id} className="rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-[color:var(--cream)]">{s.species.commonName}</p>
                  <p className="text-xs italic text-[color:var(--cream)]/40">{s.species.latin}</p>
                </div>
                <ScorePip score={s.score} />
              </div>
              <p className="mt-2 text-sm text-[color:var(--cream)]/70">{s.why}</p>
              <p className="mt-2 text-xs text-[color:var(--cream)]/45">{s.species.regulation}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)] p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--cream)]/40">{label}</p>
      <p className="mt-1 font-heading text-xl capitalize text-[color:var(--cream)]">{value}</p>
      <p className="text-xs text-[color:var(--cream)]/45">{detail}</p>
    </div>
  );
}
