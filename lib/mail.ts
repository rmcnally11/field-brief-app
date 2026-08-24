import type { Briefing, CalendarDay } from "@/lib/types";
import { DESKS } from "@/lib/desks";
import { morningLine } from "@/lib/morning";
import { theaterLabel } from "@/lib/data/theaters";
import { formatInZone, formatYmdLong, parseNoaaGmt } from "@/lib/time";
import { ORIGIN } from "@/lib/tweet";
import { skyCopy } from "@/lib/wx";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function deskMeta(areaId: string) {
  return DESKS.find((d) => d.areaId === areaId);
}

function tideStamp(stamp: string, tz: string) {
  const d = stamp.includes("T") ? new Date(stamp) : parseNoaaGmt(stamp);
  return formatInZone(d, tz, { weekday: "short", hour: "numeric", minute: "2-digit" });
}

function subjectLead(headline: string) {
  const lead = headline.split("—")[0]?.trim() || headline.trim();
  return lead.replace(/\.$/, "");
}

export function morningSubject(briefing: Briefing) {
  const score = briefing.overall.toFixed(1);
  const lead = subjectLead(briefing.headline);
  return `${briefing.area.shortName} ${score} · ${lead}`;
}

function instruments(briefing: Briefing) {
  const w = briefing.conditions.weather;
  const tides = briefing.conditions.tides;
  const rows: Array<{ label: string; value: string; note?: string }> = [];
  rows.push({
    label: "Wind",
    value:
      w.windMph != null
        ? `${Math.round(w.windMph)} mph${w.windCardinal ? ` ${w.windCardinal}` : ""}${
            w.windGustMph != null ? ` · gust ${Math.round(w.windGustMph)}` : ""
          }`
        : "Not in",
    note: w.source.toUpperCase(),
  });
  rows.push({
    label: "Sky",
    value: skyCopy(w.wx, w.precipChance, w.sky),
    note: w.wx === "storm" ? "Stay tied" : w.wx === "rain" ? "Sight goes blind first" : undefined,
  });
  rows.push({
    label: "Water",
    value: briefing.conditions.waterTempF != null ? `${briefing.conditions.waterTempF.toFixed(1)}°F` : "No gauge",
    note: briefing.conditions.waterTempSource ?? undefined,
  });
  rows.push({
    label: "Tide",
    value: tides.stage.replace("-", " "),
    note:
      tides.predictedNow != null
        ? `${tides.predictedNow.toFixed(2)} ft ${tides.source === "noaa" ? "MLLW" : "modeled"}`
        : tides.source,
  });
  if (tides.anomalyFt != null) {
    const a = tides.anomalyFt;
    rows.push({
      label: "Wind vs table",
      value: `${a > 0 ? "+" : ""}${a.toFixed(2)} ft`,
      note:
        Math.abs(a) >= 0.25
          ? "Wind is moving more water than the printout"
          : "Table is telling the truth",
    });
  }
  rows.push({
    label: "Moon",
    value: briefing.conditions.moon.name,
    note: `${Math.round(briefing.conditions.moon.illumination * 100)}% lit · ${briefing.conditions.moon.springNeap}`,
  });
  if (briefing.conditions.river) {
    const r = briefing.conditions.river;
    rows.push({
      label: "River",
      value: `${Math.round(r.cfs).toLocaleString()} cfs`,
      note: `${r.name} · USGS ${r.site}${r.high ? " — stain is the story" : ""}`,
    });
  }
  return rows;
}

function inPlay(briefing: Briefing) {
  return briefing.species
    .filter((s) => s.inPlay && !s.closed && s.species.role === "primary")
    .slice(0, 5);
}

function clocks(briefing: Briefing) {
  return briefing.conditions.tides.nextHiLo.slice(0, 4).map((t) => ({
    when: tideStamp(t.time, briefing.area.timezone),
    what: t.type === "H" ? "High" : "Low",
    height: `${t.height.toFixed(1)} ft`,
  }));
}

function hrefs(briefing: Briefing) {
  const q = `area=${briefing.area.id}&theater=${briefing.area.theater}`;
  return {
    brief: `${ORIGIN}/?${q}`,
    calendar: `${ORIGIN}/calendar?${q}`,
    map: `${ORIGIN}/map?${q}`,
    card: `${ORIGIN}/card?${q}`,
  };
}

export function morningEmailText(briefing: Briefing, yolo?: CalendarDay | null) {
  const meta = deskMeta(briefing.area.id);
  const links = hrefs(briefing);
  const line = morningLine(briefing, yolo);
  const parts = [
    `${theaterLabel(briefing.area.theater)} · ${briefing.area.name}`,
    meta ? `${meta.desk}. ${meta.kicker}.` : null,
    briefing.headline,
    `${briefing.overall.toFixed(1)} / 10 · ${briefing.confidence} confidence · ${formatYmdLong(briefing.forDate, briefing.area.timezone)}`,
    line,
    "",
    "THE WATER",
    ...instruments(briefing).map((r) => `${r.label}: ${r.value}${r.note ? ` (${r.note})` : ""}`),
    clocks(briefing).length
      ? `Next tides: ${clocks(briefing)
          .map((c) => `${c.what} ${c.when} ${c.height}`)
          .join("; ")}`
      : null,
    "",
  ];
  if (briefing.warnings.length) {
    parts.push("WATCH", ...briefing.warnings.map((w) => `• ${w}`), "");
  }
  if (briefing.where.length) {
    parts.push(
      "WHERE",
      ...briefing.where.slice(0, 4).map((p) => `• ${p.spot.name} (${p.score.toFixed(1)}) — ${p.why[0] ?? p.spot.note}`),
      "",
    );
  }
  if (briefing.when.length) {
    parts.push(
      "WHEN",
      ...briefing.when.map((w) => `• ${w.label} (${w.score.toFixed(1)}) — ${w.why}`),
      "",
    );
  }
  const fish = inPlay(briefing);
  if (fish.length) {
    parts.push(
      "IN PLAY",
      ...fish.map((s) => `• ${s.species.commonName} (${s.score.toFixed(1)}) — ${s.why}`),
      "",
    );
  }
  if (briefing.why.length) {
    parts.push("WHY", ...briefing.why.slice(0, 6).map((w) => `• ${w}`), "");
  }
  if (yolo) {
    parts.push(
      `YOLO day is ${formatYmdLong(yolo.date, briefing.area.timezone)} (${yolo.score.toFixed(1)}). Best remaining dry day with a real wind forecast.`,
      "",
    );
  }
  parts.push(
    `Live brief: ${links.brief}`,
    `Calendar: ${links.calendar}`,
    `Map: ${links.map}`,
    "",
    "Scores are 1–10, not a bite. This is not a chart for navigation. The gauges stay live on the page — this mail is a snapshot.",
  );
  return parts.filter((p) => p != null).join("\n");
}

function sectionTitle(text: string) {
  return `<p style="margin:28px 0 10px;letter-spacing:.18em;text-transform:uppercase;font-size:11px;color:#b87333">${escapeHtml(text)}</p>`;
}

export function morningEmailHtml(briefing: Briefing, yolo?: CalendarDay | null) {
  const meta = deskMeta(briefing.area.id);
  const links = hrefs(briefing);
  const line = morningLine(briefing, yolo);
  const inst = instruments(briefing);
  const fish = inPlay(briefing);
  const tides = clocks(briefing);

  const instRows = inst
    .map(
      (r) => `<tr>
        <td style="padding:8px 10px 8px 0;border-bottom:1px solid #e4dcc8;color:#6a7580;font-size:12px;width:28%">${escapeHtml(r.label)}</td>
        <td style="padding:8px 0;border-bottom:1px solid #e4dcc8;font-size:15px">${escapeHtml(r.value)}${
          r.note ? `<div style="font-size:12px;color:#6a7580;margin-top:2px">${escapeHtml(r.note)}</div>` : ""
        }</td>
      </tr>`,
    )
    .join("");

  const tideLine = tides.length
    ? `<p style="margin:10px 0 0;font-size:14px;color:#3d4d5c">${tides
        .map((t) => `<strong>${escapeHtml(t.what)}</strong> ${escapeHtml(t.when)} · ${escapeHtml(t.height)}`)
        .join("&nbsp;&nbsp;·&nbsp;&nbsp;")}</p>`
    : "";

  const warnings = briefing.warnings.length
    ? `${sectionTitle("Watch")}<ul style="margin:0;padding-left:18px;color:#8a5a12;font-size:14px;line-height:1.45">${briefing.warnings
        .map((w) => `<li style="margin:0 0 8px">${escapeHtml(w)}</li>`)
        .join("")}</ul>`
    : "";

  const where = briefing.where.length
    ? `${sectionTitle("Where")}<ol style="margin:0;padding-left:18px;font-size:15px;line-height:1.4">${briefing.where
        .slice(0, 4)
        .map(
          (p) =>
            `<li style="margin:0 0 12px"><strong>${escapeHtml(p.spot.name)}</strong> · ${p.score.toFixed(1)}<br/><span style="color:#3d4d5c;font-size:14px">${escapeHtml(p.why[0] ?? p.spot.note)}</span></li>`,
        )
        .join("")}</ol>`
    : "";

  const when = briefing.when.length
    ? `${sectionTitle("When")}<ul style="margin:0;padding-left:18px;font-size:15px;line-height:1.4">${briefing.when
        .map(
          (w) =>
            `<li style="margin:0 0 10px"><strong>${escapeHtml(w.label)}</strong> · ${w.score.toFixed(1)}<br/><span style="color:#3d4d5c;font-size:14px">${escapeHtml(w.why)}</span></li>`,
        )
        .join("")}</ul>`
    : "";

  const play = fish.length
    ? `${sectionTitle("In play")}<ul style="margin:0;padding-left:18px;font-size:15px;line-height:1.4">${fish
        .map(
          (s) =>
            `<li style="margin:0 0 10px"><strong>${escapeHtml(s.species.commonName)}</strong> · ${s.score.toFixed(1)}<br/><span style="color:#3d4d5c;font-size:14px">${escapeHtml(s.why)}</span></li>`,
        )
        .join("")}</ul>`
    : "";

  const why = briefing.why.length
    ? `${sectionTitle("Why")}<ul style="margin:0;padding-left:18px;color:#3d4d5c;font-size:14px;line-height:1.45">${briefing.why
        .slice(0, 6)
        .map((w) => `<li style="margin:0 0 8px">${escapeHtml(w)}</li>`)
        .join("")}</ul>`
    : "";

  const yoloBlock = yolo
    ? `${sectionTitle("YOLO")}<p style="margin:0;font-size:15px">Best remaining dry day with a real wind forecast is <strong>${escapeHtml(formatYmdLong(yolo.date, briefing.area.timezone))}</strong> · ${yolo.score.toFixed(1)}. Rain and thunderstorms cannot own that day.</p>`
    : "";

  return `<!doctype html>
<html><body style="margin:0;background:#f4efe6;color:#1a2a3a;font-family:Georgia,'Times New Roman',serif">
  <div style="max-width:600px;margin:0 auto;padding:32px 22px 40px">
    <p style="margin:0;letter-spacing:.2em;text-transform:uppercase;font-size:11px;color:#b87333">
      Field Brief · ${escapeHtml(theaterLabel(briefing.area.theater))}
      ${meta ? ` · ${escapeHtml(meta.desk)}` : ""}
    </p>
    <p style="margin:6px 0 0;font-size:13px;color:#6a7580">${escapeHtml(briefing.area.name)}${meta ? ` — ${escapeHtml(meta.kicker)}` : ""}</p>
    <h1 style="margin:14px 0 0;font-size:30px;line-height:1.22">${escapeHtml(briefing.headline)}</h1>
    <p style="margin:14px 0 0;font-size:16px;line-height:1.45;color:#3d4d5c">${escapeHtml(line)}</p>
    <p style="margin:16px 0 0;font-size:14px">
      <strong style="font-size:22px">${briefing.overall.toFixed(1)}</strong>
      <span style="color:#6a7580"> / 10 · ${escapeHtml(briefing.confidence)} confidence · ${escapeHtml(formatYmdLong(briefing.forDate, briefing.area.timezone))}</span>
    </p>
    ${sectionTitle("The water")}
    <table style="width:100%;border-collapse:collapse">${instRows}</table>
    ${tideLine}
    ${warnings}
    ${where}
    ${when}
    ${play}
    ${why}
    ${yoloBlock}
    <p style="margin:32px 0 0">
      <a href="${links.brief}" style="display:inline-block;background:#1c6b6b;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:6px;font-size:14px">Open the live brief</a>
    </p>
    <p style="margin:12px 0 0;font-size:13px">
      <a href="${links.calendar}" style="color:#1c6b6b">Calendar</a>
      &nbsp;·&nbsp;
      <a href="${links.map}" style="color:#1c6b6b">Map</a>
      &nbsp;·&nbsp;
      <a href="${links.card}" style="color:#1c6b6b">Card</a>
    </p>
    <p style="margin:28px 0 0;font-size:12px;color:#6a7580;line-height:1.45">
      Scores are 1–10, not a bite. This is not a chart for navigation. The gauges stay live on the page — this mail is a snapshot of ${escapeHtml(briefing.forDate)}, not a nightly batch.
    </p>
  </div>
</body></html>`;
}
