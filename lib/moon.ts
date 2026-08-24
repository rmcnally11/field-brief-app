/** Astronomical helpers. Phase is 0 = new, 0.5 = full. */

const SYNODIC = 29.530588853;
const KNOWN_NEW = Date.UTC(2000, 0, 6, 18, 14);

export function moonPhase(date: Date) {
  const days = (date.getTime() - KNOWN_NEW) / 86400000;
  const phase = ((days % SYNODIC) + SYNODIC) % SYNODIC / SYNODIC;
  const illumination = 0.5 * (1 - Math.cos(2 * Math.PI * phase));
  const name =
    phase < 0.03 || phase > 0.97
      ? "New"
      : phase < 0.22
        ? "Waxing crescent"
        : phase < 0.28
          ? "First quarter"
          : phase < 0.47
            ? "Waxing gibbous"
            : phase < 0.53
              ? "Full"
              : phase < 0.72
                ? "Waning gibbous"
                : phase < 0.78
                  ? "Last quarter"
                  : "Waning crescent";
  const distToSpring = Math.min(phase, 1 - phase, Math.abs(phase - 0.5));
  const springNeap =
    distToSpring < 0.07 ? "spring" : distToSpring > 0.18 && distToSpring < 0.32 ? "neap" : "mid";
  return { phase, name, illumination, springNeap: springNeap as "spring" | "neap" | "mid" };
}

/** Crude M2-style modeled tide for Bahamas (no NOAA gauge). Height in feet around MSL. */
export function modeledHourlyTide(
  start: Date,
  hours: number,
  meanRangeFt: number,
  offsetHours: number,
) {
  const points: { time: string; height: number }[] = [];
  const amp = meanRangeFt / 2;
  for (let i = 0; i < hours; i++) {
    const t = new Date(start.getTime() + i * 3600000);
    const hoursSinceEpoch = t.getTime() / 3600000;
    const m2 = Math.sin((2 * Math.PI * (hoursSinceEpoch - offsetHours)) / 12.420601);
    const s2 = 0.3 * Math.sin((2 * Math.PI * (hoursSinceEpoch - offsetHours)) / 12.0);
    const height = amp * (0.82 * m2 + s2);
    points.push({
      time: t.toISOString().slice(0, 16).replace("T", " "),
      height: Number(height.toFixed(3)),
    });
  }
  return points;
}
