import { cream, copper, water } from "@/lib/viz";
import type { TideChartLayout } from "@/lib/tide-chart";

export function TideChartGraphic({
  layout,
  fillId = "tideFill",
  fit = "fixed",
}: {
  layout: TideChartLayout;
  fillId?: string;
  fit?: "fixed" | "fluid";
}) {
  if (!layout.ok) return null;
  const {
    width,
    height,
    padL,
    padR,
    padT,
    padB,
    innerH,
    marks,
    bands,
    yTicks,
    dayMarks,
    nowX,
    nowOn,
    fillPath,
    strokePath,
    fontSize,
    markR,
    strokeWidth,
    nowWidth,
  } = layout;

  return (
    <svg
      width={fit === "fixed" ? width : undefined}
      height={fit === "fixed" ? height : undefined}
      viewBox={`0 0 ${width} ${height}`}
      className={fit === "fluid" ? "h-auto w-full" : undefined}
      role="img"
      aria-label="Tide curve"
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={copper} stopOpacity={0.45} />
          <stop offset="55%" stopColor={water} stopOpacity={0.55} />
          <stop offset="100%" stopColor={water} stopOpacity={0.05} />
        </linearGradient>
      </defs>
      {bands.map((b, i) =>
        b.w > 0 ? (
          <rect
            key={`band-${i}`}
            x={b.x}
            y={padT}
            width={b.w}
            height={innerH}
            fill={copper}
            opacity={0.12}
          />
        ) : null,
      )}
      {yTicks.map((t) => (
        <g key={`tick-${t.v}`}>
          <line
            x1={padL}
            x2={width - padR}
            y1={t.y}
            y2={t.y}
            stroke={cream}
            strokeOpacity={0.12}
          />
          <text
            x={padL - 6}
            y={t.y + fontSize * 0.35}
            textAnchor="end"
            fill={cream}
            fillOpacity={0.4}
            fontSize={fontSize}
            fontFamily="ui-monospace, monospace"
          >
            {t.v.toFixed(1)}
          </text>
        </g>
      ))}
      <path d={fillPath} fill={`url(#${fillId})`} />
      <path d={strokePath} fill="none" stroke={cream} strokeOpacity={0.85} strokeWidth={strokeWidth} />
      {marks.map((m) => (
        <g key={`${m.time}-${m.type}`}>
          <circle cx={m.x} cy={m.y} r={markR} fill={m.type === "H" ? cream : copper} />
          <text
            x={m.x}
            y={m.type === "H" ? m.y - fontSize * 0.85 : m.y + fontSize * 1.5}
            textAnchor="middle"
            fill={cream}
            fillOpacity={0.7}
            fontSize={fontSize}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {m.type}
          </text>
        </g>
      ))}
      {nowOn ? (
        <g>
          <line
            x1={nowX}
            x2={nowX}
            y1={padT}
            y2={height - padB}
            stroke={copper}
            strokeDasharray={`${3 * (fontSize / 8)} ${3 * (fontSize / 8)}`}
            strokeWidth={nowWidth}
          />
          <text
            x={nowX + fontSize * 0.5}
            y={padT + fontSize * 1.25}
            fill={copper}
            fontSize={fontSize}
            letterSpacing={0.8}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            NOW
          </text>
        </g>
      ) : null}
      {dayMarks
        .filter((_, i) => i % 2 === 0)
        .map((m) => (
          <text
            key={`day-${m.x}`}
            x={m.x}
            y={height - 6}
            fill={cream}
            fillOpacity={0.35}
            fontSize={fontSize}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {m.label}
          </text>
        ))}
    </svg>
  );
}
