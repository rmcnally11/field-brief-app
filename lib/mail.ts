import type { Area, Briefing, CalendarDay, TheaterId } from "@/lib/types";
import { DESKS } from "@/lib/desks";
import { morningLine } from "@/lib/morning";
import { theaterLabel } from "@/lib/data/theaters";
import { formatInZone, formatYmdLong, parseNoaaGmt } from "@/lib/time";
import { ORIGIN, calendarCardUrl, calendarHref } from "@/lib/tweet";
import { skyCopy } from "@/lib/wx";
import type { NewsletterIssue } from "@/lib/newsletter";
import { coastEditionLabel } from "@/lib/coasts";
import { scoreHex, scoreInk } from "@/lib/viz";
import {
  MONTH_NAMES,
  MONTH_THEATER,
  closuresForCoasts,
  peaksThisMonth,
  theaterLabel as coastLabel,
} from "@/lib/data/fundamentals";

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

function sectionTitle(text: string) {
  return `<p style="margin:24px 0 10px;letter-spacing:.16em;text-transform:uppercase;font-size:11px;color:#b87333">${escapeHtml(text)}</p>`;
}

function btn(href: string, label: string) {
  return `<a href="${href}" class="fb-btn" style="display:inline-block;background:#1c6b6b;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:6px;font-size:15px;line-height:1.2">${escapeHtml(label)}</a>`;
}

function emailDoc(opts: { preheader?: string; body: string }) {
  const pre = opts.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(opts.preheader)}</div>`
    : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no,address=no,email=no,date=no">
<title>On This Water</title>
<style>
  html,body{margin:0!important;padding:0!important;width:100%!important}
  body{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background:#f4efe6;color:#1a2a3a}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}
  img{border:0;height:auto;line-height:100%;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic}
  a{text-decoration:none}
  @media only screen and (max-width:620px){
    .fb-wrap{width:100%!important;max-width:100%!important}
    .fb-pad{padding:18px 14px 28px!important}
    .fb-h1{font-size:24px!important;line-height:1.28!important}
    .fb-score{font-size:28px!important}
    .fb-btn{display:block!important;width:100%!important;box-sizing:border-box!important;text-align:center!important}
    .fb-tide{display:block!important;padding:3px 0!important}
    .fb-cal td{font-size:11px!important;padding:5px 1px!important;line-height:1.2!important}
    .fb-label{width:34%!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f4efe6;color:#1a2a3a;font-family:Georgia,'Times New Roman',serif">
${pre}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe6;width:100%">
  <tr>
    <td align="center" style="padding:0">
      <table role="presentation" class="fb-wrap" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px">
        <tr>
          <td class="fb-pad" style="padding:28px 18px 36px">
            ${opts.body}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
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
        <td class="fb-label" style="padding:10px 12px 10px 0;border-bottom:1px solid #e4dcc8;color:#6a7580;font-size:13px;width:30%;vertical-align:top">${escapeHtml(r.label)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e4dcc8;font-size:16px">${escapeHtml(r.value)}${
          r.note ? `<div style="font-size:13px;color:#6a7580;margin-top:3px">${escapeHtml(r.note)}</div>` : ""
        }</td>
      </tr>`,
    )
    .join("");

  const tideLine = tides.length
    ? `<p style="margin:12px 0 0;font-size:15px;color:#3d4d5c;line-height:1.45">${tides
        .map(
          (t) =>
            `<span class="fb-tide" style="display:inline-block;padding:0 12px 0 0"><strong>${escapeHtml(t.what)}</strong> ${escapeHtml(t.when)} · ${escapeHtml(t.height)}</span>`,
        )
        .join("")}</p>`
    : "";

  const warnings = briefing.warnings.length
    ? `${sectionTitle("Watch")}<ul style="margin:0;padding-left:20px;color:#8a5a12;font-size:15px;line-height:1.45">${briefing.warnings
        .map((w) => `<li style="margin:0 0 8px">${escapeHtml(w)}</li>`)
        .join("")}</ul>`
    : "";

  const where = briefing.where.length
    ? `${sectionTitle("Where")}<ol style="margin:0;padding-left:20px;font-size:16px;line-height:1.4">${briefing.where
        .slice(0, 4)
        .map(
          (p) =>
            `<li style="margin:0 0 12px"><strong>${escapeHtml(p.spot.name)}</strong> · ${p.score.toFixed(1)}<br/><span style="color:#3d4d5c;font-size:14px">${escapeHtml(p.why[0] ?? p.spot.note)}</span></li>`,
        )
        .join("")}</ol>`
    : "";

  const when = briefing.when.length
    ? `${sectionTitle("When")}<ul style="margin:0;padding-left:20px;font-size:16px;line-height:1.4">${briefing.when
        .map(
          (w) =>
            `<li style="margin:0 0 10px"><strong>${escapeHtml(w.label)}</strong> · ${w.score.toFixed(1)}<br/><span style="color:#3d4d5c;font-size:14px">${escapeHtml(w.why)}</span></li>`,
        )
        .join("")}</ul>`
    : "";

  const play = fish.length
    ? `${sectionTitle("In play")}<ul style="margin:0;padding-left:20px;font-size:16px;line-height:1.4">${fish
        .map(
          (s) =>
            `<li style="margin:0 0 10px"><strong>${escapeHtml(s.species.commonName)}</strong> · ${s.score.toFixed(1)}<br/><span style="color:#3d4d5c;font-size:14px">${escapeHtml(s.why)}</span></li>`,
        )
        .join("")}</ul>`
    : "";

  const why = briefing.why.length
    ? `${sectionTitle("Why")}<ul style="margin:0;padding-left:20px;color:#3d4d5c;font-size:15px;line-height:1.45">${briefing.why
        .slice(0, 6)
        .map((w) => `<li style="margin:0 0 8px">${escapeHtml(w)}</li>`)
        .join("")}</ul>`
    : "";

  const yoloBlock = yolo
    ? `${sectionTitle("YOLO")}<p style="margin:0;font-size:16px;line-height:1.45">Best remaining dry day with a real wind forecast is <strong>${escapeHtml(formatYmdLong(yolo.date, briefing.area.timezone))}</strong> · ${yolo.score.toFixed(1)}. Rain and thunderstorms cannot own that day.</p>`
    : "";

  return emailDoc({
    preheader: `${briefing.area.shortName} ${briefing.overall.toFixed(1)} · ${line}`,
    body: `
    <p style="margin:0;letter-spacing:.18em;text-transform:uppercase;font-size:11px;color:#b87333">
      On This Water · ${escapeHtml(theaterLabel(briefing.area.theater))}
      ${meta ? ` · ${escapeHtml(meta.desk)}` : ""}
    </p>
    <p style="margin:8px 0 0;font-size:14px;color:#6a7580;line-height:1.4">${escapeHtml(briefing.area.name)}${meta ? ` — ${escapeHtml(meta.kicker)}` : ""}</p>
    <h1 class="fb-h1" style="margin:14px 0 0;font-size:28px;line-height:1.25">${escapeHtml(briefing.headline)}</h1>
    <p style="margin:14px 0 0;font-size:16px;line-height:1.5;color:#3d4d5c">${escapeHtml(line)}</p>
    <p style="margin:16px 0 0;font-size:15px">
      <strong class="fb-score" style="font-size:26px">${briefing.overall.toFixed(1)}</strong>
      <span style="color:#6a7580"> / 10 · ${escapeHtml(briefing.confidence)} confidence · ${escapeHtml(formatYmdLong(briefing.forDate, briefing.area.timezone))}</span>
    </p>
    ${sectionTitle("The water")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">${instRows}</table>
    ${tideLine}
    ${warnings}
    ${where}
    ${when}
    ${play}
    ${why}
    ${yoloBlock}
    <p style="margin:28px 0 0">${btn(links.brief, "Open the live brief")}</p>
    <p style="margin:14px 0 0;font-size:14px;line-height:1.6">
      <a href="${links.calendar}" style="color:#1c6b6b">Calendar</a>
      &nbsp;·&nbsp;
      <a href="${links.map}" style="color:#1c6b6b">Map</a>
      &nbsp;·&nbsp;
      <a href="${links.card}" style="color:#1c6b6b">Card</a>
    </p>
    <p style="margin:24px 0 0;font-size:13px;color:#6a7580;line-height:1.5">
      Scores are 1–10, not a bite. This is not a chart for navigation. The gauges stay live on the page — this mail is a snapshot of ${escapeHtml(briefing.forDate)}, not a nightly batch.
    </p>`,
  });
}

export function letterSubject(issue: NewsletterIssue, coasts: TheaterId[] | null) {
  const edition = coastEditionLabel(coasts);
  const names = issue.desks
    .map((d) => d.briefing?.area.shortName ?? d.desk.replace(" desk", ""))
    .join(" · ");
  return `Saturday Letter · ${issue.monthName} · ${names || edition}`;
}

export function letterEmailText(issue: NewsletterIssue, coasts: TheaterId[] | null) {
  const edition = coastEditionLabel(coasts);
  const parts = [`Saturday Letter · ${edition}`, issue.rangeLabel, "", issue.letter, ""];
  for (const desk of issue.desks) {
    const name = desk.briefing?.area.shortName ?? desk.desk;
    const score = desk.briefing ? desk.briefing.overall.toFixed(1) : "quiet";
    parts.push(
      `${desk.desk.toUpperCase()} · ${name} · ${score}`,
      desk.briefing?.headline ?? desk.error ?? desk.kicker,
      desk.seasonal,
      "",
    );
  }
  if (issue.peaks.length) {
    parts.push("IN PEAK", ...issue.peaks.map((p) => `• ${p.name} (${p.theaters}) — ${p.why}`), "");
  }
  if (issue.closures.length) {
    parts.push("CLOSED OR CLOSING", ...issue.closures.map((c) => `• ${c.title} — ${c.body}`), "");
  }
  const qs = coasts?.length && coasts.length < 7 ? `?coasts=${coasts.join(",")}` : "";
  parts.push(
    `Read the letter: ${ORIGIN}/newsletter${qs}`,
    `Season: ${ORIGIN}/fundamentals${qs ? `?theater=${coasts![0]}` : ""}`,
    "",
    "This edition is the water you elected. Coasts you did not pick stay off this letter. Scores are 1–10, not a bite.",
  );
  return parts.join("\n");
}

export function letterEmailHtml(issue: NewsletterIssue, coasts: TheaterId[] | null) {
  const edition = coastEditionLabel(coasts);
  const qs = coasts?.length && coasts.length < 7 ? `?coasts=${coasts.join(",")}` : "";
  const desks = issue.desks
    .map((desk) => {
      const name = desk.briefing?.area.shortName ?? desk.desk.replace(" desk", "");
      const score = desk.briefing ? desk.briefing.overall.toFixed(1) : "—";
      const head = desk.briefing?.headline ?? desk.error ?? desk.kicker;
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 18px">
        <tr><td style="padding:0 0 16px;border-bottom:1px solid #e4dcc8">
          <p style="margin:0;letter-spacing:.16em;text-transform:uppercase;font-size:11px;color:#b87333">${escapeHtml(desk.desk)}</p>
          <p class="fb-h2" style="margin:8px 0 0;font-size:20px;line-height:1.3"><strong>${escapeHtml(name)}</strong> · ${escapeHtml(score)}</p>
          <p style="margin:8px 0 0;font-size:16px;line-height:1.45">${escapeHtml(head)}</p>
          <p style="margin:8px 0 0;font-size:14px;color:#3d4d5c;line-height:1.45">${escapeHtml(desk.seasonal)}</p>
        </td></tr>
      </table>`;
    })
    .join("");
  const peaks = issue.peaks.length
    ? `${sectionTitle("In peak")}<ul style="margin:0;padding-left:20px;font-size:15px;line-height:1.45">${issue.peaks
        .map((p) => `<li style="margin:0 0 10px"><strong>${escapeHtml(p.name)}</strong> · ${escapeHtml(p.theaters)}<br/><span style="color:#3d4d5c">${escapeHtml(p.why)}</span></li>`)
        .join("")}</ul>`
    : "";
  const closures = issue.closures.length
    ? `${sectionTitle("Closed or closing")}<ul style="margin:0;padding-left:20px;font-size:15px;line-height:1.45">${issue.closures
        .map((c) => `<li style="margin:0 0 10px"><strong>${escapeHtml(c.title)}</strong><br/><span style="color:#3d4d5c">${escapeHtml(c.body)}</span></li>`)
        .join("")}</ul>`
    : "";
  return emailDoc({
    preheader: `${edition} · ${issue.rangeLabel}`,
    body: `
    <p style="margin:0;letter-spacing:.18em;text-transform:uppercase;font-size:11px;color:#b87333">Saturday Letter · ${escapeHtml(edition)}</p>
    <p style="margin:8px 0 0;font-size:14px;color:#6a7580">${escapeHtml(issue.rangeLabel)}</p>
    <h1 class="fb-h1" style="margin:14px 0 0;font-size:28px;line-height:1.25">${escapeHtml(issue.monthName)} on your water</h1>
    <p style="margin:16px 0 0;font-size:16px;line-height:1.5;color:#3d4d5c">${escapeHtml(issue.letter)}</p>
    ${sectionTitle("This week")}
    ${desks}
    ${peaks}
    ${closures}
    <p style="margin:24px 0 0">${btn(`${ORIGIN}/newsletter${qs}`, "Open the letter")}</p>
    <p style="margin:24px 0 0;font-size:13px;color:#6a7580;line-height:1.5">
      This edition is the water you elected. Coasts you did not pick stay off this letter. Scores are 1–10, not a bite.
    </p>`,
  });
}

export type CalendarMonth = { year: number; month: number; label: string; days: CalendarDay[] };

function calendarGridHtml(month: CalendarMonth, area: Area) {
  const first = new Date(`${month.year}-${String(month.month).padStart(2, "0")}-01T12:00:00`);
  const pad = first.getDay();
  const cells: string[] = [];
  for (let i = 0; i < pad; i++) {
    cells.push(`<td width="14%" style="width:14%;padding:4px 2px;background:#f4efe6">&nbsp;</td>`);
  }
  for (const day of month.days) {
    const n = Number(day.date.slice(-2));
    const bg = scoreHex(day.score);
    const fg = scoreInk(day.score);
    const ring = day.yolo ? "#b87333" : day.amazing ? "#c9a227" : "#e4dcc8";
    const ringW = day.yolo || day.amazing ? "2px" : "1px";
    const wet = day.wx === "storm" ? "T" : day.wx === "rain" ? "R" : "";
    cells.push(`<td width="14%" align="center" valign="top" style="width:14%;padding:3px 2px">
      <a href="${ORIGIN}/?area=${area.id}&theater=${area.theater}&date=${day.date}" style="display:block;text-decoration:none;color:${fg};background:${bg};border:${ringW} solid ${ring};border-radius:6px;padding:6px 2px 7px">
        <div style="font-size:11px;line-height:1">${n}</div>
        <div style="font-size:14px;font-weight:bold;line-height:1.2;padding-top:2px">${day.score.toFixed(1)}</div>
        <div style="font-size:10px;line-height:1.2;padding-top:2px">${escapeHtml(day.moon.glyph)}${wet ? ` ${wet}` : ""}</div>
      </a>
    </td>`);
  }
  while (cells.length % 7 !== 0) {
    cells.push(`<td width="14%" style="width:14%;padding:4px 2px;background:#f4efe6">&nbsp;</td>`);
  }
  const rows: string[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(`<tr>${cells.slice(i, i + 7).join("")}</tr>`);
  }
  const head = ["S", "M", "T", "W", "T", "F", "S"]
    .map((d) => `<th width="14%" style="width:14%;padding:0 0 6px;font-size:11px;letter-spacing:.08em;color:#6a7580;font-weight:normal">${d}</th>`)
    .join("");
  return `<table role="presentation" class="fb-cal" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:separate;border-spacing:0">
    <tr>${head}</tr>
    ${rows.join("")}
  </table>
  <p style="margin:10px 0 0;font-size:12px;color:#6a7580;line-height:1.45">Gold ring = amazing dry day. Copper = YOLO. T = thunderstorm, R = rain. Scores are 1–10, not a bite.</p>`;
}

function upcomingHtml(days: CalendarDay[], area: Area) {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: area.timezone });
  const next = days.filter((d) => d.date >= today).slice(0, 7);
  if (!next.length) return "";
  return `${sectionTitle("Next seven")}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%">${next
    .map((d) => {
      const label = formatYmdLong(d.date, area.timezone);
      const sky = skyCopy(d.wx, d.precipChance) || "sky later";
      const wind = d.windMph != null ? `${Math.round(d.windMph)} mph` : "no wind yet";
      const tag = d.yolo ? "YOLO" : d.amazing ? "Amazing" : d.confidence;
      return `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #e4dcc8">
          <p style="margin:0;font-size:16px"><strong>${escapeHtml(label)}</strong> · ${d.score.toFixed(1)}</p>
          <p style="margin:4px 0 0;font-size:14px;color:#3d4d5c;line-height:1.4">${escapeHtml(tag)} · ${escapeHtml(wind)} · ${escapeHtml(sky)}${d.bestWindow ? ` · ${escapeHtml(d.bestWindow)}` : ""}</p>
        </td>
      </tr>`;
    })
    .join("")}</table>`;
}

export function calendarSubject(area: Area, month: CalendarMonth) {
  const yolo = month.days.find((d) => d.yolo);
  return yolo
    ? `Calendar · ${area.shortName} · YOLO ${formatYmdLong(yolo.date, area.timezone)}`
    : `Calendar · ${area.shortName} · ${month.label}`;
}

export function calendarEmailText(area: Area, month: CalendarMonth) {
  const yolo = month.days.find((d) => d.yolo);
  const amazing = month.days.filter((d) => d.amazing).map((d) => d.date);
  const lines = [
    `On This Water calendar · ${theaterLabel(area.theater)} · ${area.name}`,
    month.label,
    yolo ? `YOLO: ${yolo.date} · ${yolo.score.toFixed(1)}` : null,
    amazing.length ? `Amazing dry days: ${amazing.join(", ")}` : null,
    "",
    ...month.days.map((d) => {
      const mark = d.yolo ? " YOLO" : d.amazing ? " amazing" : "";
      return `${d.date}  ${d.score.toFixed(1)}${mark}  ${d.drivers[0] ?? ""}`;
    }),
    "",
    `Live calendar: ${calendarHref(area.id, area.theater)}`,
    `Graphic card: ${calendarCardUrl(area.id, area.theater)}`,
    "",
    "Scores are 1–10, not a bite. Rain and thunderstorms cannot own a copper day.",
  ];
  return lines.filter((l) => l != null).join("\n");
}

export function calendarEmailHtml(area: Area, month: CalendarMonth) {
  const yolo = month.days.find((d) => d.yolo);
  const meta = deskMeta(area.id);
  return emailDoc({
    preheader: yolo
      ? `${area.shortName} calendar · YOLO ${formatYmdLong(yolo.date, area.timezone)}`
      : `${area.shortName} calendar · ${month.label}`,
    body: `
    <p style="margin:0;letter-spacing:.18em;text-transform:uppercase;font-size:11px;color:#b87333">
      On This Water calendar · ${escapeHtml(theaterLabel(area.theater))}${meta ? ` · ${escapeHtml(meta.desk)}` : ""}
    </p>
    <h1 class="fb-h1" style="margin:12px 0 0;font-size:28px;line-height:1.25">${escapeHtml(area.shortName)}</h1>
    <p style="margin:8px 0 0;font-size:16px;color:#3d4d5c">${escapeHtml(month.label)} · this month’s scores, live wind and rain where the forecast reaches</p>
    ${yolo ? `<p style="margin:14px 0 0;font-size:16px;line-height:1.45">YOLO is <strong>${escapeHtml(formatYmdLong(yolo.date, area.timezone))}</strong> · ${yolo.score.toFixed(1)}. Best remaining dry day with a real wind forecast.</p>` : ""}
    ${sectionTitle("The month")}
    ${calendarGridHtml(month, area)}
    ${upcomingHtml(month.days, area)}
    <p style="margin:28px 0 0">${btn(calendarHref(area.id, area.theater), "Open the live calendar")}</p>
    <p style="margin:14px 0 0;font-size:14px;line-height:1.6">
      <a href="${calendarCardUrl(area.id, area.theater)}" style="color:#1c6b6b">Graphic card</a>
      &nbsp;·&nbsp;
      <a href="${ORIGIN}/?area=${area.id}&theater=${area.theater}" style="color:#1c6b6b">Today’s brief</a>
    </p>
    <p style="margin:24px 0 0;font-size:13px;color:#6a7580;line-height:1.5">
      Scores are 1–10, not a bite. This is not a chart for navigation. Days past the wind forecast are tide and moon only.
    </p>`,
  });
}

export type SeasonIssue = {
  month: number;
  monthName: string;
  coasts: TheaterId[];
  letter: string;
  peaks: { name: string; theaters: string; why: string }[];
  closures: { title: string; body: string }[];
};

export function buildSeasonIssue(coasts: TheaterId[], at = new Date()): SeasonIssue {
  const month = Number(
    new Intl.DateTimeFormat("en-US", { month: "numeric", timeZone: "America/Chicago" }).format(at),
  );
  const chosen = coasts.length ? coasts : (["texas"] as TheaterId[]);
  return {
    month,
    monthName: MONTH_NAMES[month - 1],
    coasts: chosen,
    letter: chosen.map((t) => MONTH_THEATER[month][t]).filter(Boolean).join(" "),
    peaks: peaksThisMonth(month)
      .filter((s) => s.theaters.some((t) => chosen.includes(t)))
      .map((s) => ({
        name: s.commonName,
        theaters: s.theaters.filter((t) => chosen.includes(t)).map(coastLabel).join(" · "),
        why: s.why,
      })),
    closures: closuresForCoasts(month, chosen, at),
  };
}

export function seasonalSubject(issue: SeasonIssue) {
  return `Season · ${coastEditionLabel(issue.coasts)} · ${issue.monthName}`;
}

export function seasonalEmailText(issue: SeasonIssue) {
  const qs = issue.coasts.length === 1 ? `?theater=${issue.coasts[0]}` : "";
  return [
    `Seasonal fundamentals · ${coastEditionLabel(issue.coasts)} · ${issue.monthName}`,
    "",
    issue.letter,
    "",
    issue.peaks.length ? "IN PEAK" : null,
    ...issue.peaks.map((p) => `• ${p.name} (${p.theaters}) — ${p.why}`),
    "",
    issue.closures.length ? "CLOSED OR CLOSING" : null,
    ...issue.closures.map((c) => `• ${c.title} — ${c.body}`),
    "",
    `Season page: ${ORIGIN}/fundamentals${qs}`,
    "",
    "This is doctrine for the coasts you elected, not a honey-hole list. Verify before you keep a fish.",
  ]
    .filter((l) => l != null)
    .join("\n");
}

export function seasonalEmailHtml(issue: SeasonIssue) {
  const qs = issue.coasts.length === 1 ? `?theater=${issue.coasts[0]}` : "";
  const peaks = issue.peaks.length
    ? `${sectionTitle("In peak")}<ul style="margin:0;padding-left:20px;font-size:15px;line-height:1.45">${issue.peaks
        .map((p) => `<li style="margin:0 0 10px"><strong>${escapeHtml(p.name)}</strong> · ${escapeHtml(p.theaters)}<br/><span style="color:#3d4d5c">${escapeHtml(p.why)}</span></li>`)
        .join("")}</ul>`
    : `${sectionTitle("In peak")}<p style="margin:0;font-size:15px;color:#3d4d5c">No primary species is marked peak this month on your coasts. Present fish still show on the season page.</p>`;
  const closures = issue.closures.length
    ? `${sectionTitle("Closed or closing")}<ul style="margin:0;padding-left:20px;font-size:15px;line-height:1.45">${issue.closures
        .map((c) => `<li style="margin:0 0 10px"><strong>${escapeHtml(c.title)}</strong><br/><span style="color:#3d4d5c">${escapeHtml(c.body)}</span></li>`)
        .join("")}</ul>`
    : "";
  return emailDoc({
    preheader: `${coastEditionLabel(issue.coasts)} · ${issue.monthName} fundamentals`,
    body: `
    <p style="margin:0;letter-spacing:.18em;text-transform:uppercase;font-size:11px;color:#b87333">Seasonal fundamentals · ${escapeHtml(coastEditionLabel(issue.coasts))}</p>
    <h1 class="fb-h1" style="margin:12px 0 0;font-size:28px;line-height:1.25">${escapeHtml(issue.monthName)} on your water</h1>
    <p style="margin:16px 0 0;font-size:16px;line-height:1.5;color:#3d4d5c">${escapeHtml(issue.letter)}</p>
    ${peaks}
    ${closures}
    <p style="margin:28px 0 0">${btn(`${ORIGIN}/fundamentals${qs}`, "Open the season page")}</p>
    <p style="margin:24px 0 0;font-size:13px;color:#6a7580;line-height:1.5">
      Doctrine for the coasts you elected, not a honey-hole list. Verify TPWD, FWC, or the local book before you keep a fish.
    </p>`,
  });
}
