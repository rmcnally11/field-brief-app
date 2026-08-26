import { GILL_NET, gillNetCoast, gillNetFor, longRecordBay } from "@/lib/data/long-record";

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
  const picked = areaId ? gillNetFor(areaId, month) : null;
  const coast = !picked ? gillNetCoast(month) : null;
  const bayMeta = areaId ? longRecordBay(areaId) : null;

  if (picked) {
    const { bay, all, late, season, note } = picked;
    const rows = compact ? all.species.slice(0, 3) : all.species;
    return (
      <article className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">
          Long record · {bay.system} · gill nets
        </p>
        <h2 className="mt-1 font-heading text-2xl text-[color:var(--cream)] md:text-3xl">
          {fmt(all.fish)} fish in {fmt(all.sets)} overnight sets
        </h2>
        <p className="mt-2 text-sm text-[color:var(--cream)]/60">
          {season.label} {all.yearStart}–{all.yearEnd}. Random shoreline grids in this bay system — not a
          mark on your map. {note}
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
            {rows.map((s) => (
              <tr key={s.id} className="border-t border-[color:var(--line)]">
                <td className="py-2 font-heading text-lg text-[color:var(--cream)]">{s.name}</td>
                <td className="py-2 text-right font-mono text-[color:var(--cream)]">{s.perSet.toFixed(1)}</td>
                <td className="hidden py-2 text-right font-mono text-[color:var(--cream)]/70 sm:table-cell">
                  {fmt(s.catch)}
                </td>
                <td className="py-2 text-right text-[color:var(--cream)]/70">{s.pctSets.toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        {late && !compact ? (
          <p className="mt-3 text-sm text-[color:var(--cream)]/55">
            Late file ({late.yearStart}–{late.yearEnd}):{" "}
            {late.species
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
    );
  }

  if (!coast) return null;
  return (
    <article className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">
        Long record · Texas gill nets
      </p>
      <h2 className="mt-1 font-heading text-2xl text-[color:var(--cream)]">
        Redfish per overnight set · {coast.season.id}
      </h2>
      <p className="mt-2 text-sm text-[color:var(--cream)]/60">
        {coast.season.label} Public file {GILL_NET.yearStart}–{GILL_NET.yearEnd}. Where is the bay
        system, not a GPS mark.
      </p>
      <ul className="mt-4 divide-y divide-[color:var(--line)]">
        {coast.rows.map((row) => (
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
  );
}
