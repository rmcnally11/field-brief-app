import type { HiLo, HourlyTide } from "@/lib/types";
import { siteOrigin } from "@/lib/brand";
import { formatInZone } from "@/lib/time";
import { linePath, parseTideStamp, tidePath } from "@/lib/viz";

export type TideWindow = { start: string; end: string };

export type TideChartLayout = {
  ok: boolean;
  width: number;
  height: number;
  padL: number;
  padR: number;
  padT: number;
  padB: number;
  innerH: number;
  mapped: { x: number; y: number }[];
  marks: Array<HiLo & { x: number; y: number }>;
  bands: { x: number; w: number }[];
  yTicks: { v: number; y: number }[];
  dayMarks: { x: number; label: string }[];
  nowX: number;
  nowOn: boolean;
  samples: { x: number; y: number; t: number; h: number }[];
  fillPath: string;
  strokePath: string;
  fontSize: number;
  markR: number;
  strokeWidth: number;
  nowWidth: number;
};

export function tideChartUrl(areaId: string, origin = siteOrigin(), dateYmd?: string) {
  const base = `${origin.replace(/\/$/, "")}/api/og/tide?area=${encodeURIComponent(areaId)}`;
  return dateYmd ? `${base}&d=${encodeURIComponent(dateYmd)}` : base;
}

export function layoutTideChart(opts: {
  hourly: HourlyTide[];
  nextHiLo?: HiLo[];
  timezone: string;
  windows?: TideWindow[];
  width?: number;
  height?: number;
  now?: number;
}): TideChartLayout {
  const width = opts.width ?? 720;
  const height = opts.height ?? 168;
  const scale = width / 720;
  const padL = 36 * scale;
  const padR = 12 * scale;
  const padT = 16 * scale;
  const padB = 22 * scale;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const empty: TideChartLayout = {
    ok: false,
    width,
    height,
    padL,
    padR,
    padT,
    padB,
    innerH,
    mapped: [],
    marks: [],
    bands: [],
    yTicks: [],
    dayMarks: [],
    nowX: 0,
    nowOn: false,
    samples: [],
    fillPath: "",
    strokePath: "",
    fontSize: 8 * scale,
    markR: 3.2 * scale,
    strokeWidth: 1.6 * scale,
    nowWidth: 1.2 * scale,
  };

  const pts = opts.hourly
    .map((h) => ({ t: parseTideStamp(h.time).getTime(), h: h.height }))
    .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.h))
    .sort((a, b) => a.t - b.t);

  if (pts.length < 4) return empty;

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

  const samples = pts.map((p) => ({
    x: padL + ((p.t - t0) / span) * innerW,
    y: padT + (1 - (p.h - minH) / range) * innerH,
    t: p.t,
    h: p.h,
  }));
  const mapped = samples.map((p) => ({ x: p.x, y: p.y }));

  const now = opts.now ?? Date.now();
  const nowX = padL + ((now - t0) / span) * innerW;
  const nowOn = now >= t0 && now <= t1;

  const marks = (opts.nextHiLo ?? []).map((m) => {
    const t = parseTideStamp(m.time).getTime();
    return {
      ...m,
      x: padL + ((t - t0) / span) * innerW,
      y: padT + (1 - (m.height - minH) / range) * innerH,
    };
  });

  const bands = (opts.windows ?? []).map((w) => {
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
    dayMarks.push({
      x: padL + ((t - t0) / span) * innerW,
      label: formatInZone(new Date(t), opts.timezone, { weekday: "short", hour: "numeric" }),
    });
  }

  return {
    ok: true,
    width,
    height,
    padL,
    padR,
    padT,
    padB,
    innerH,
    mapped,
    marks,
    bands,
    yTicks,
    dayMarks,
    nowX,
    nowOn,
    samples,
    fillPath: tidePath(mapped, width - padR, height - padB),
    strokePath: linePath(mapped),
    fontSize: 8 * scale,
    markR: 3.2 * scale,
    strokeWidth: 1.6 * scale,
    nowWidth: 1.2 * scale,
  };
}

export function sampleAtX(layout: TideChartLayout, x: number) {
  const samples = layout.samples;
  if (!samples.length) return null;
  const lo = layout.padL;
  const hi = layout.width - layout.padR;
  const clamped = Math.max(lo, Math.min(hi, x));
  if (samples.length === 1 || clamped <= samples[0].x) return samples[0];
  const last = samples[samples.length - 1];
  if (clamped >= last.x) return last;
  let i = 1;
  while (i < samples.length && samples[i].x < clamped) i += 1;
  const a = samples[i - 1];
  const b = samples[i];
  const span = b.x - a.x || 1;
  const u = (clamped - a.x) / span;
  return {
    x: clamped,
    y: a.y + (b.y - a.y) * u,
    t: a.t + (b.t - a.t) * u,
    h: a.h + (b.h - a.h) * u,
  };
}
