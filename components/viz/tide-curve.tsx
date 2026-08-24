import type { HiLo, HourlyTide } from "@/lib/types";
import { cream, copper, linePath, parseTideStamp, tidePath, water } from "@/lib/viz";
import { formatInZone } from "@/lib/time";
import { cn } from "@/lib/utils";

export function TideCurve({
  hourly,
  nextHiLo,
  timezone,
  nowHeight,
  stage,
  source,
  windows,
  className,
  height = 168,
}: {
  hourly: HourlyTide[];
  nextHiLo?: HiLo[];
  timezone: string;
  nowHeight?: number | null;
  stage?: string;
  source?: string;
  windows?: { start: string; end: string }[];
  className?: string;
  height?: number;
}) {
  const padL = 36;
  const padR = 12;
  const padT = 16;
  const padB = 22;
  const width = 720;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const pts = hourly
    .map((h) => ({ t: parseTideStamp(h.time).getTime(), h: h.height }))
    .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.h))
    .sort((a, b) => a.t - b.t);

  if (pts.length < 4) {
    return (
      <div className={cn("flex h-40 items-center justify-center text-sm text-[color:var(--cream)]/45", className)}>
        Tide curve needs more hourly points from the gauge.
      </div>
    );
  }

  const t0 = pts[0].t;
  const t1 = pts[pts.length - 1].t;
  const span = Math.max(1, t1 - t0);
  const hs = pts.map((p) => p.h);
  const lo = Math.min(...hs);
  const hi = Math.max(...hs);
  const padH = Math.max(0.15, (hi - lo) * 0.18);
  const minH = lo - padH;
  const maxH = hi + padH;
  const range = maxH - minH || 1;

  const mapped = pts.map((p) => ({
    x: padL + ((p.t - t0) / span) * innerW,
    y: padT + (1 - (p.h - minH) / range) * innerH,
  }));

  const now = Date.now();
  const nowX = padL + ((now - t0) / span) * innerW;
  const nowOn = now >= t0 && now <= t1;

  const marks = (nextHiLo ?? []).map((m) => {
    const t = parseTideStamp(m.time).getTime();
    return {
      ...m,
      x: padL + ((t - t0) / span) * innerW,
      y: padT + (1 - (m.height - minH) / range) * innerH,
    };
  });

  const bands = (windows ?? []).map((w) => {
    const a = parseTideStamp(w.start).getTime();
    const b = parseTideStamp(w.end).getTime();
    return {
      x: padL + ((a - t0) / span) * innerW,
      w: ((b - a) / span) * innerW,
    };
  });

  const ticks = 5;
  const yTicks = Array.from({ length: ticks }, (_, i) => {
    const v = minH + (range * i) / (ticks - 1);
    return { v, y: padT + (1 - i / (ticks - 1)) * innerH };
  });

  const dayMarks: { x: number; label: string }[] = [];
  const start = new Date(t0);
  start.setUTCHours(0, 0, 0, 0);
  for (let t = start.getTime(); t <= t1; t += 12 * 3600000) {
    if (t < t0) continue;
    const d = new Date(t);
    dayMarks.push({
      x: padL + ((t - t0) / span) * innerW,
      label: formatInZone(d, timezone, { weekday: "short", hour: "numeric" }),
    });
  }

  return (
    <div className={cn("w-full", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Tide curve">
        <defs>
          <linearGradient id="tideFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={copper} stopOpacity="0.45" />
            <stop offset="55%" stopColor={water} stopOpacity="0.55" />
            <stop offset="100%" stopColor={water} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {bands.map((b, i) =>
          b.w > 0 ? (
            <rect
              key={i}
              x={b.x}
              y={padT}
              width={b.w}
              height={innerH}
              fill={copper}
              opacity="0.12"
            />
          ) : null,
        )}
        {yTicks.map((t) => (
          <g key={t.v}>
            <line x1={padL} x2={width - padR} y1={t.y} y2={t.y} stroke={cream} strokeOpacity="0.12" />
            <text x={padL - 6} y={t.y + 3} textAnchor="end" fill={cream} fillOpacity="0.4" fontSize="8" fontFamily="ui-monospace, monospace">
              {t.v.toFixed(1)}
            </text>
          </g>
        ))}
        <path d={tidePath(mapped, width - padR, height - padB)} fill="url(#tideFill)" />
        <path d={linePath(mapped)} fill="none" stroke={cream} strokeOpacity="0.85" strokeWidth="1.6" />
        {marks.map((m) => (
          <g key={`${m.time}-${m.type}`}>
            <circle cx={m.x} cy={m.y} r="3.2" fill={m.type === "H" ? cream : copper} />
            <text
              x={m.x}
              y={m.type === "H" ? m.y - 7 : m.y + 12}
              textAnchor="middle"
              fill={cream}
              fillOpacity="0.7"
              fontSize="8"
            >
              {m.type}
            </text>
          </g>
        ))}
        {nowOn ? (
          <g>
            <line x1={nowX} x2={nowX} y1={padT} y2={height - padB} stroke={copper} strokeDasharray="3 3" strokeWidth="1.2" />
            <text x={nowX + 4} y={padT + 10} fill={copper} fontSize="8" letterSpacing="0.8">
              NOW
            </text>
          </g>
        ) : null}
        {dayMarks.filter((_, i) => i % 2 === 0).map((m) => (
          <text key={m.x} x={m.x} y={height - 6} fill={cream} fillOpacity="0.35" fontSize="8">
            {m.label}
          </text>
        ))}
      </svg>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[color:var(--cream)]/45">
        <span className="capitalize">{stage?.replace("-", " ") ?? "tide"}{nowHeight != null ? ` · ${nowHeight.toFixed(2)} ft` : ""}</span>
        <span>{source === "noaa" ? "NOAA hourly · ft MLLW" : source === "modeled" ? "Modeled M2 · not a gauge" : "ft"}</span>
      </div>
    </div>
  );
}
