import type { Briefing } from "@/lib/types";
import { formatYmdLong } from "@/lib/time";
import { briefHref } from "@/lib/hrefs";

export type GoWhen = {
  verdict: "today" | "tomorrow" | "either" | "stay";
  title: string;
  line: string;
  driver: string;
  todayScore: number;
  tomorrowScore: number;
  tomorrowHref: string;
  tomorrowLabel: string;
};

export function goWhen(today: Briefing, tomorrow: Briefing): GoWhen {
  const delta = tomorrow.overall - today.overall;
  const stormToday = today.conditions.weather.wx === "storm";
  const stormTomorrow = tomorrow.conditions.weather.wx === "storm";
  const windToday = today.conditions.weather.windMph;
  const windTomorrow = tomorrow.conditions.weather.windMph;

  let verdict: GoWhen["verdict"] = "either";
  if (today.overall < 4.2 && tomorrow.overall < 4.2) verdict = "stay";
  else if (stormToday && !stormTomorrow && tomorrow.overall >= today.overall - 0.4) verdict = "tomorrow";
  else if (stormTomorrow && !stormToday && today.overall >= tomorrow.overall - 0.4) verdict = "today";
  else if (delta >= 0.8) verdict = "tomorrow";
  else if (delta <= -0.8) verdict = "today";

  let driver = "The two mornings are close. Pick the tide window you can actually stand on.";
  if (stormToday && !stormTomorrow) {
    driver = "Thunderstorms today. Tomorrow is the cleaner clock — still a forecast.";
  } else if (stormTomorrow && !stormToday) {
    driver = "Thunderstorms tomorrow. Today is the cleaner clock.";
  } else if (windToday != null && windTomorrow != null && Math.abs(windTomorrow - windToday) >= 5) {
    driver =
      windTomorrow < windToday
        ? `Wind eases to about ${Math.round(windTomorrow)} mph tomorrow. Forecast, not a gauge.`
        : `Wind builds to about ${Math.round(windTomorrow)} mph tomorrow. Forecast, not a gauge.`;
  } else if (Math.abs(delta) >= 0.8) {
    driver =
      delta > 0
        ? "Tomorrow’s tide, moon, and forecast score higher. Wind is a forecast."
        : "Today’s tide and clock score higher.";
  }

  const title =
    verdict === "stay"
      ? "Stay tied"
      : verdict === "today"
        ? "Go today"
        : verdict === "tomorrow"
          ? "Wait for tomorrow"
          : "Either morning";

  const tomorrowLabel = formatYmdLong(tomorrow.forDate, today.area.timezone);
  const line = `${today.area.shortName} is ${today.overall.toFixed(1)} this morning, ${tomorrow.overall.toFixed(1)} tomorrow. Scores are 1–10, not a bite.`;
  const todayHref = briefHref({
    areaId: today.area.id,
    theater: today.area.theater,
    activity: today.activity,
  });
  const tomorrowHref = briefHref({
    areaId: today.area.id,
    theater: today.area.theater,
    activity: today.activity,
    date: tomorrow.forDate,
  });

  return {
    verdict,
    title,
    line,
    driver,
    todayScore: today.overall,
    tomorrowScore: tomorrow.overall,
    tomorrowHref: verdict === "today" || verdict === "stay" ? todayHref : tomorrowHref,
    tomorrowLabel: verdict === "today" || verdict === "stay" ? "this morning" : tomorrowLabel,
  };
}
