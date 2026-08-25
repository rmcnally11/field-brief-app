import type { HiLo, HourlyTide } from "@/lib/types";
import { layoutTideChart } from "@/lib/tide-chart";
import { TideChartGraphic } from "@/components/viz/tide-chart-graphic";
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
  const fillId = `tideFill-${timezone}-${hourly[0]?.time ?? "x"}`.replace(/[^a-zA-Z0-9_-]/g, "");
  const layout = layoutTideChart({
    hourly,
    nextHiLo,
    timezone,
    windows,
    width: 720,
    height,
  });

  if (!layout.ok) {
    return (
      <div className={cn("flex h-40 items-center justify-center text-sm text-[color:var(--cream)]/45", className)}>
        Tide curve needs more hourly points from the gauge.
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <TideChartGraphic layout={layout} fillId={fillId} fit="fluid" />
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[color:var(--cream)]/45">
        <span className="capitalize">{stage?.replace("-", " ") ?? "tide"}{nowHeight != null ? ` · ${nowHeight.toFixed(2)} ft` : ""}</span>
        <span>{source === "noaa" ? "NOAA hourly · ft MLLW" : source === "modeled" ? "Modeled M2 · not a gauge" : "ft"}</span>
      </div>
    </div>
  );
}
