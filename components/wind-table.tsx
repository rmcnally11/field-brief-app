import type { AnomalyPoint } from "@/lib/types";

export function WindTable({
  anomalyFt,
  series,
  theater,
}: {
  anomalyFt: number | null;
  series: AnomalyPoint[];
  theater: string;
}) {
  const gulf = theater === "texas" || theater === "louisiana";
  const values = series.map((p) => p.anomaly);
  const min = values.length ? Math.min(-0.6, ...values) : -0.6;
  const max = values.length ? Math.max(0.6, ...values) : 0.6;
  const w = 220;
  const h = 64;
  const pts = values.map((v, i) => {
    const x = values.length === 1 ? w / 2 : (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * (h - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const zeroY = h - ((0 - min) / (max - min)) * (h - 8) - 4;
  const signed =
    anomalyFt == null ? "—" : `${anomalyFt > 0 ? "+" : ""}${anomalyFt.toFixed(2)} ft`;

  return (
    <div>
      <p className="font-heading text-3xl text-[color:var(--cream)]">{signed}</p>
      <p className="mt-1 text-xs text-[color:var(--cream)]/55">
        {anomalyFt == null
          ? "No live gauge this hour — the printed tide is the forecast."
          : gulf
            ? "Observed minus predicted. On this coast the wind often is the tide."
            : "Observed minus predicted. Read the water, not just the printout."}
      </p>
      {pts.length > 1 ? (
        <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-16 w-full" aria-hidden>
          <line x1="0" y1={zeroY} x2={w} y2={zeroY} stroke="rgba(11,31,51,0.18)" strokeWidth="1" />
          <polyline
            fill="none"
            stroke="var(--copper)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={pts.join(" ")}
          />
        </svg>
      ) : null}
    </div>
  );
}
