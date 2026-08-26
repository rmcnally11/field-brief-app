import type { WeatherNow } from "@/lib/types";

const INHG = 0.029529983071445;

export function mbToInHg(mb: number) {
  return mb * INHG;
}

export function pressureInHg(mb: number | null) {
  if (mb == null) return null;
  return Number(mbToInHg(mb).toFixed(2));
}

export function pressureTrendWord(deltaMb: number | null) {
  if (deltaMb == null) return "no 3-hour change yet";
  if (Math.abs(deltaMb) < 0.5) return "steady";
  return deltaMb > 0 ? "rising" : "falling";
}

export function pressureLine(weather: Pick<WeatherNow, "pressureMb" | "pressureTrendMb">) {
  if (weather.pressureMb == null) return null;
  const inHg = pressureInHg(weather.pressureMb);
  const word = pressureTrendWord(weather.pressureTrendMb);
  const delta =
    weather.pressureTrendMb != null && Math.abs(weather.pressureTrendMb) >= 0.5
      ? ` ${Math.abs(weather.pressureTrendMb).toFixed(1)}`
      : "";
  return `${inHg?.toFixed(2)} inHg · ${Math.round(weather.pressureMb)} mb · ${word}${delta}`;
}
