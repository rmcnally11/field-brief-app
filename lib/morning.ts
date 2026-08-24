import type { Briefing, CalendarDay } from "@/lib/types";
import { formatYmdLong } from "@/lib/time";

export function morningLine(briefing: Briefing, yolo?: CalendarDay | null) {
  const name = briefing.area.shortName;
  const score = briefing.overall.toFixed(1);
  const wind =
    briefing.conditions.weather.windMph != null
      ? `${Math.round(briefing.conditions.weather.windMph)} mph${
          briefing.conditions.weather.windCardinal ? ` ${briefing.conditions.weather.windCardinal}` : ""
        }`
      : "wind not in yet";
  const anomaly = briefing.conditions.tides.anomalyFt;
  const vs =
    anomaly != null && Math.abs(anomaly) >= 0.25
      ? ` Wind versus the table: ${anomaly > 0 ? "+" : ""}${anomaly.toFixed(1)} ft.`
      : "";
  const yoloBit =
    yolo && !yolo.date.startsWith("x")
      ? ` YOLO day is ${formatYmdLong(yolo.date, briefing.area.timezone)}.`
      : "";
  if (briefing.kind === "forecast") {
    return `${name} ${score} on ${formatYmdLong(briefing.forDate, briefing.area.timezone)}. ${wind}.${vs}${yoloBit} Scores are 1–10, not a bite.`;
  }
  if (briefing.kind === "astronomical") {
    return `${name} ${score} on ${formatYmdLong(briefing.forDate, briefing.area.timezone)} — tide, moon, and season only. No wind forecast that far out.${yoloBit} Scores are 1–10, not a bite.`;
  }
  return `${name} ${score} this morning. ${wind}.${vs}${yoloBit} Scores are 1–10, not a bite.`;
}
