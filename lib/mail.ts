import type { Briefing, CalendarDay } from "@/lib/types";
import { morningLine } from "@/lib/morning";
import { ORIGIN } from "@/lib/tweet";

export function morningSubject(briefing: Briefing) {
  return `${briefing.area.shortName} · ${briefing.overall.toFixed(1)} this morning`;
}

export function morningEmailText(briefing: Briefing, yolo?: CalendarDay | null) {
  const line = morningLine(briefing, yolo);
  const brief = `${ORIGIN}/?area=${briefing.area.id}&theater=${briefing.area.theater}`;
  const extras = [
    ...(briefing.conditions.alerts ?? []).map((a) => `NWS ${a.event}: ${a.headline}`),
    briefing.conditions.river
      ? `USGS ${briefing.conditions.river.site} · ${Math.round(briefing.conditions.river.cfs).toLocaleString()} cfs${briefing.conditions.river.high ? " — stain is the story" : ""}`
      : null,
  ].filter(Boolean);
  return [
    line,
    extras.length ? extras.join("\n") : null,
    `Live brief: ${brief}`,
    "Scores are 1–10, not a bite. This is not a chart for navigation.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function morningEmailHtml(briefing: Briefing, yolo?: CalendarDay | null) {
  const line = morningLine(briefing, yolo);
  const brief = `${ORIGIN}/?area=${briefing.area.id}&theater=${briefing.area.theater}`;
  const card = `${ORIGIN}/card?area=${briefing.area.id}&theater=${briefing.area.theater}`;
  const alerts = (briefing.conditions.alerts ?? [])
    .map((a) => `<p style="margin:0 0 8px;color:#8a5a12;font-size:14px">NWS ${escapeHtml(a.event)} — ${escapeHtml(a.headline)}</p>`)
    .join("");
  const river = briefing.conditions.river
    ? `<p style="margin:0 0 8px;color:#1a2a3a;font-size:14px">${escapeHtml(briefing.conditions.river.name)} · ${Math.round(briefing.conditions.river.cfs).toLocaleString()} cfs${briefing.conditions.river.high ? " — stain is the story" : ""} (USGS ${escapeHtml(briefing.conditions.river.site)})</p>`
    : "";
  return `<!doctype html>
<html><body style="margin:0;background:#f4efe6;color:#1a2a3a;font-family:Georgia,serif">
  <div style="max-width:560px;margin:0 auto;padding:28px 20px">
    <p style="margin:0;letter-spacing:.18em;text-transform:uppercase;font-size:11px;color:#b87333">Field Brief · ${escapeHtml(briefing.area.shortName)}</p>
    <h1 style="margin:10px 0 0;font-size:28px;line-height:1.25">${escapeHtml(line)}</h1>
    <p style="margin:16px 0 0;font-size:15px;color:#3d4d5c">${escapeHtml(briefing.headline)}</p>
    ${alerts}${river}
    <p style="margin:22px 0 0">
      <a href="${brief}" style="color:#1c6b6b">Open the live brief</a>
      &nbsp;·&nbsp;
      <a href="${card}" style="color:#1c6b6b">Picture card</a>
    </p>
    <p style="margin:28px 0 0;font-size:12px;color:#6a7580">Scores are 1–10, not a bite. The gauges are live when you open the page — this mail is a snapshot of ${escapeHtml(briefing.forDate)}, not a nightly batch. No SMS on Hobby.</p>
  </div>
</body></html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
