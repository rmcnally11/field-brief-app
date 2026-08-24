import type { Area, HiLo, HourlyTide, TideAnalysis, TideStage } from "@/lib/types";
import { modeledHourlyTide } from "@/lib/moon";
import { fetchHiLo, fetchHourly, fetchHourlyObserved, fetchLatest } from "@/lib/noaa";
import type { AnomalyPoint } from "@/lib/types";

function stageFromSlope(slope: number, nearExtrema: boolean, rising: boolean): TideStage {
  if (nearExtrema && Math.abs(slope) < 0.04) {
    return rising ? "low-slack" : "high-slack";
  }
  if (Math.abs(slope) < 0.025) {
    return rising ? "low-slack" : "high-slack";
  }
  return rising ? "incoming" : "outgoing";
}

function analyzeHourly(hourly: { time: string; height: number; at?: Date }[], now: Date): Omit<TideAnalysis, "source" | "observedNow" | "anomalyFt" | "anomalySeries" | "nextHiLo" | "rangeTodayFt"> {
  const withAt = hourly.map((h) => ({
    ...h,
    at: h.at ?? new Date(h.time.includes("T") ? h.time : h.time.replace(" ", "T") + "Z"),
  }));
  let i = 0;
  while (i < withAt.length - 1 && withAt[i + 1].at < now) i++;
  const a = withAt[Math.max(0, i)];
  const b = withAt[Math.min(withAt.length - 1, i + 1)];
  const dt = Math.max(1, (b.at.getTime() - a.at.getTime()) / 3600000);
  const slope = (b.height - a.height) / dt;
  const rising = slope >= 0;
  const predictedNow = a.height + slope * ((now.getTime() - a.at.getTime()) / 3600000);
  return {
    stage: stageFromSlope(slope, false, rising),
    rising,
    predictedNow,
    hourly: withAt.map((h) => ({ time: h.time, height: h.height })),
  };
}

function hiloFromHourly(hourly: HourlyTide[]): HiLo[] {
  const out: HiLo[] = [];
  for (let i = 1; i < hourly.length - 1; i++) {
    const prev = hourly[i - 1].height;
    const cur = hourly[i].height;
    const next = hourly[i + 1].height;
    if (cur >= prev && cur > next) out.push({ time: hourly[i].time, height: cur, type: "H" });
    if (cur <= prev && cur < next) out.push({ time: hourly[i].time, height: cur, type: "L" });
  }
  return out;
}

function anomalySeries(
  predicted: { time: string; height: number; at?: Date }[],
  observed: { height: number; at: Date }[],
): AnomalyPoint[] {
  if (!observed.length || !predicted.length) return [];
  const out: AnomalyPoint[] = [];
  for (const o of observed) {
    let best = predicted[0];
    let bestDelta = Infinity;
    for (const p of predicted) {
      const at = p.at ?? new Date(p.time.includes("T") ? p.time : `${p.time.replace(" ", "T")}Z`);
      const delta = Math.abs(at.getTime() - o.at.getTime());
      if (delta < bestDelta) {
        best = p;
        bestDelta = delta;
      }
    }
    if (bestDelta > 40 * 60000) continue;
    out.push({
      time: o.at.toISOString(),
      predicted: best.height,
      observed: o.height,
      anomaly: o.height - best.height,
    });
  }
  return out.slice(-18);
}

export async function loadTides(
  area: Area,
  now = new Date(),
  opts: { observe?: boolean } = {},
): Promise<TideAnalysis> {
  const observe = opts.observe ?? true;
  if (area.noaaStation) {
    try {
      const [hilo, hourly, observed, series] = await Promise.all([
        fetchHiLo(area.noaaStation, now, 4),
        fetchHourly(area.noaaStation, now, 4),
        observe ? fetchLatest(area.noaaStation, "water_level") : Promise.resolve(null),
        observe
          ? fetchHourlyObserved(area.noaaStation, new Date(now.getTime() - 18 * 3600000), 1).catch(() => [])
          : Promise.resolve([]),
      ]);
      const core = analyzeHourly(hourly, now);
      const todayHilo = hilo.filter((h) => Math.abs(h.at.getTime() - now.getTime()) < 20 * 3600000);
      const highs = todayHilo.filter((h) => h.type === "H").map((h) => h.height);
      const lows = todayHilo.filter((h) => h.type === "L").map((h) => h.height);
      const range =
        highs.length && lows.length ? Math.max(...highs) - Math.min(...lows) : null;
      const predicted = core.predictedNow;
      const observedNow = observed?.value ?? null;
      return {
        ...core,
        observedNow,
        anomalyFt:
          predicted != null && observedNow != null ? observedNow - predicted : null,
        anomalySeries: anomalySeries(hourly, series),
        rangeTodayFt: range,
        nextHiLo: hilo
          .filter((h) => h.at.getTime() >= now.getTime() - 2 * 3600000)
          .slice(0, 8)
          .map((h) => ({ time: h.time, height: h.height, type: h.type })),
        source: "noaa",
      };
    } catch {
      // fall through to model
    }
  }

  const hourly = modeledHourlyTide(
    new Date(now.getTime() - 6 * 3600000),
    96,
    area.meanRangeFt,
    area.modeledTideOffsetHours ?? 0,
  );
  const core = analyzeHourly(
    hourly.map((h) => ({ ...h, at: new Date(h.time.replace(" ", "T") + "Z") })),
    now,
  );
  const hilo = hiloFromHourly(core.hourly);
  const heights = core.hourly.slice(6, 30).map((h) => h.height);
  return {
    ...core,
    observedNow: null,
    anomalyFt: null,
    anomalySeries: [],
    rangeTodayFt: heights.length ? Math.max(...heights) - Math.min(...heights) : area.meanRangeFt,
    nextHiLo: hilo.slice(0, 8),
    source: "modeled",
  };
}
