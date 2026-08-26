import { LONG_RECORD, gillNetSeason, longRecordBay } from "@/lib/data/long-record";

export function LongRecord({
  areaId,
  month,
  compact = false,
}: {
  areaId?: string;
  month: number;
  compact?: boolean;
}) {
  const bay = areaId ? longRecordBay(areaId) : null;
  const season = gillNetSeason(month);

  return (
    <article className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">
        Long record · {LONG_RECORD.program}
      </p>
      <h2 className="mt-1 font-heading text-2xl text-[color:var(--cream)]">
        {bay ? bay.system : "Texas bays"}
      </h2>
      <p className="mt-2 text-sm text-[color:var(--cream)]/70">
        Fish in the water, and fish across the dock. Not this morning. Not a bite. The ring stays on
        the gauges.
      </p>
      {bay ? <p className="mt-2 text-sm text-[color:var(--cream)]/55">{bay.note}</p> : null}
      <p className="mt-3 text-sm text-[color:var(--cream)]/70">
        <span className="text-[color:var(--copper)]">This month. </span>
        {season.label}
      </p>
      {compact ? (
        <p className="mt-3 text-sm text-[color:var(--cream)]/60">{LONG_RECORD.publicExtract}</p>
      ) : (
        <div className="mt-4 space-y-3 text-sm text-[color:var(--cream)]/65">
          <p>
            <span className="text-[color:var(--cream)]">In the water. </span>
            {LONG_RECORD.independent}
          </p>
          <p>
            <span className="text-[color:var(--cream)]">Across the dock. </span>
            {LONG_RECORD.creel}
          </p>
          <p>{LONG_RECORD.gillNetSeasons}</p>
          <p>{LONG_RECORD.publicExtract}</p>
          <p>{LONG_RECORD.mrip}</p>
        </div>
      )}
      <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <a
          className="text-[color:var(--sea)] underline decoration-[color:var(--sea)]/40 underline-offset-4"
          href={LONG_RECORD.hrefs.bcoDmo}
          target="_blank"
          rel="noreferrer"
        >
          BCO-DMO gill nets 1986–2018
        </a>
        <a
          className="text-[color:var(--sea)] underline decoration-[color:var(--sea)]/40 underline-offset-4"
          href={LONG_RECORD.hrefs.scienceBase}
          target="_blank"
          rel="noreferrer"
        >
          HARC / ScienceBase extracts
        </a>
        <a
          className="text-[color:var(--sea)] underline decoration-[color:var(--sea)]/40 underline-offset-4"
          href={LONG_RECORD.hrefs.request}
        >
          Request the full series
        </a>
      </p>
    </article>
  );
}
