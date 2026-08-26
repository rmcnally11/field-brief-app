import {
  CREEL,
  GILL_NET,
  creelCoast,
  creelFor,
  gillNetCoast,
  gillNetFor,
  longRecordBay,
} from "@/lib/data/long-record";

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

export function LongRecord({
  areaId,
  month,
  compact = false,
}: {
  areaId?: string;
  month: number;
  compact?: boolean;
}) {
  const nets = areaId ? gillNetFor(areaId, month) : null;
  const dock = areaId ? creelFor(areaId, month) : null;
  const netCoast = !nets ? gillNetCoast(month) : null;
  const dockCoast = !dock ? creelCoast(month) : null;
  const bayMeta = areaId ? longRecordBay(areaId) : null;

  if (nets && dock) {
    const netRows = compact ? nets.all.species.slice(0, 3) : nets.all.species;
    const dockRows = compact ? dock.all.species.slice(0, 3) : dock.all.species;
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">
            Long record · {nets.bay.system} · gill nets
          </p>
          <h2 className="mt-1 font-heading text-2xl text-[color:var(--cream)] md:text-3xl">
            {fmt(nets.all.fish)} fish in {fmt(nets.all.sets)} overnight sets
          </h2>
          <p className="mt-2 text-sm text-[color:var(--cream)]/60">
            {nets.season.label} {nets.all.yearStart}–{nets.all.yearEnd}. Random shoreline grids in
            this bay system — not a mark on your map. {nets.note}
          </p>
          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--cream)]/40">
                <th className="pb-2 font-normal">In the nets</th>
                <th className="pb-2 text-right font-normal">Per set</th>
                <th className="hidden pb-2 text-right font-normal sm:table-cell">Counted</th>
                <th className="pb-2 text-right font-normal">Sets</th>
              </tr>
            </thead>
            <tbody>
              {netRows.map((s) => (
                <tr key={s.id} className="border-t border-[color:var(--line)]">
                  <td className="py-2 font-heading text-lg text-[color:var(--cream)]">{s.name}</td>
                  <td className="py-2 text-right font-mono text-[color:var(--cream)]">
                    {s.perSet.toFixed(1)}
                  </td>
                  <td className="hidden py-2 text-right font-mono text-[color:var(--cream)]/70 sm:table-cell">
                    {fmt(s.catch)}
                  </td>
                  <td className="py-2 text-right text-[color:var(--cream)]/70">
                    {s.pctSets.toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {nets.late && !compact ? (
            <p className="mt-3 text-sm text-[color:var(--cream)]/55">
              Late file ({nets.late.yearStart}–{nets.late.yearEnd}):{" "}
              {nets.late.species
                .slice(0, 3)
                .map((s) => `${s.name} ${s.perSet.toFixed(1)}/set`)
                .join(" · ")}
              . Same gear, last years in the public compilation.
            </p>
          ) : null}
          <p className="mt-3 text-xs text-[color:var(--cream)]/45">{GILL_NET.cadence}</p>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <a
              className="text-[color:var(--sea)] underline decoration-[color:var(--sea)]/40 underline-offset-4"
              href={GILL_NET.href}
              target="_blank"
              rel="noreferrer"
            >
              BCO-DMO {GILL_NET.yearStart}–{GILL_NET.yearEnd}
            </a>
            <a
              className="text-[color:var(--sea)] underline decoration-[color:var(--sea)]/40 underline-offset-4"
              href="mailto:cfish@tpwd.texas.gov"
            >
              Ask TPWD for years after {GILL_NET.yearEnd}
            </a>
          </p>
        </article>

        <article className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">
            Long record · {dock.bay.system} · dock counts
          </p>
          <h2 className="mt-1 font-heading text-2xl text-[color:var(--cream)] md:text-3xl">
            {fmt(dock.all.fish)} fish on {fmt(dock.all.interviews)} interviews
          </h2>
          <p className="mt-2 text-sm text-[color:var(--cream)]/60">
            {dock.season.label} {dock.all.yearStart}–{dock.all.yearEnd}. Public ramps and wet slips
            in this bay system — the bay they launched from, not a honey hole. {dock.note}
          </p>
          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--cream)]/40">
                <th className="pb-2 font-normal">Across the dock</th>
                <th className="pb-2 text-right font-normal">Per trip</th>
                <th className="hidden pb-2 text-right font-normal sm:table-cell">Counted</th>
                <th className="pb-2 text-right font-normal">With fish</th>
              </tr>
            </thead>
            <tbody>
              {dockRows.map((s) => (
                <tr key={s.id} className="border-t border-[color:var(--line)]">
                  <td className="py-2 font-heading text-lg text-[color:var(--cream)]">
                    {s.name}
                    {s.water === "gulf" ? (
                      <span className="ml-2 text-xs font-sans uppercase tracking-[0.12em] text-[color:var(--cream)]/40">
                        gulf
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2 text-right font-mono text-[color:var(--cream)]">
                    {s.perInterview.toFixed(1)}
                  </td>
                  <td className="hidden py-2 text-right font-mono text-[color:var(--cream)]/70 sm:table-cell">
                    {fmt(s.catch)}
                  </td>
                  <td className="py-2 text-right text-[color:var(--cream)]/70">
                    {s.pctInterviews.toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {dock.late && !compact ? (
            <p className="mt-3 text-sm text-[color:var(--cream)]/55">
              Late file ({dock.late.yearStart}–{dock.late.yearEnd}):{" "}
              {dock.late.species
                .slice(0, 3)
                .map((s) => `${s.name} ${s.perInterview.toFixed(1)}/trip`)
                .join(" · ")}
              . Same ramps, last years in the public extract.
            </p>
          ) : null}
          <p className="mt-3 text-xs text-[color:var(--cream)]/45">{CREEL.cadence}</p>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <a
              className="text-[color:var(--sea)] underline decoration-[color:var(--sea)]/40 underline-offset-4"
              href={CREEL.href}
              target="_blank"
              rel="noreferrer"
            >
              PLOS One {CREEL.yearStart}–{CREEL.yearEnd}
            </a>
            <a
              className="text-[color:var(--sea)] underline decoration-[color:var(--sea)]/40 underline-offset-4"
              href={CREEL.program}
              target="_blank"
              rel="noreferrer"
            >
              How the creel works
            </a>
            <a
              className="text-[color:var(--sea)] underline decoration-[color:var(--sea)]/40 underline-offset-4"
              href="mailto:cfish@tpwd.texas.gov"
            >
              Ask TPWD for expanded landings
            </a>
          </p>
        </article>
      </div>
    );
  }

  if (!netCoast || !dockCoast) return null;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">
          Long record · Texas gill nets
        </p>
        <h2 className="mt-1 font-heading text-2xl text-[color:var(--cream)]">
          Redfish per overnight set · {netCoast.season.id}
        </h2>
        <p className="mt-2 text-sm text-[color:var(--cream)]/60">
          {netCoast.season.label} Public file {GILL_NET.yearStart}–{GILL_NET.yearEnd}. Where is the
          bay system, not a GPS mark.
        </p>
        <ul className="mt-4 divide-y divide-[color:var(--line)]">
          {netCoast.rows.map((row) => (
            <li key={row.id} className="flex items-baseline justify-between gap-3 py-2">
              <p className="font-heading text-lg text-[color:var(--cream)]">{row.system}</p>
              <p className="font-mono text-sm text-[color:var(--cream)]">
                {row.redsPerSet.toFixed(1)}{" "}
                <span className="text-[color:var(--cream)]/40">/ set · {fmt(row.fish)} fish</span>
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[color:var(--cream)]/45">{GILL_NET.cadence}</p>
        {bayMeta ? <p className="mt-2 text-xs text-[color:var(--cream)]/45">{bayMeta.note}</p> : null}
      </article>

      <article className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">
          Long record · Texas dock counts
        </p>
        <h2 className="mt-1 font-heading text-2xl text-[color:var(--cream)]">
          Trout per interview · {dockCoast.season.id === "high" ? "high-use" : "low-use"}
        </h2>
        <p className="mt-2 text-sm text-[color:var(--cream)]/60">
          {dockCoast.season.label} Parties that said they were fishing for trout. Observed harvest
          on the clipboard — not expanded landings. Public file {CREEL.yearStart}–{CREEL.yearEnd}.
        </p>
        <ul className="mt-4 divide-y divide-[color:var(--line)]">
          {dockCoast.rows.map((row) => (
            <li key={row.id} className="flex items-baseline justify-between gap-3 py-2">
              <p className="font-heading text-lg text-[color:var(--cream)]">{row.system}</p>
              <p className="font-mono text-sm text-[color:var(--cream)]">
                {row.troutPerInterview.toFixed(1)}{" "}
                <span className="text-[color:var(--cream)]/40">
                  / trip · {fmt(row.fish)} fish
                </span>
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[color:var(--cream)]/45">{CREEL.cadence}</p>
      </article>
    </div>
  );
}
