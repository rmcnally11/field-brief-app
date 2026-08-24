/** Shared paints for SVG instruments. Keep hex — SVG cannot see CSS variables. */

export const ink = "#12202c";
export const cream = "#f4efe4";
export const copper = "#c2542a";
export const teal = "#2a7a7a";
export const water = "#1c4d5c";

export function scoreHex(score: number) {
  if (score >= 8) return "#2dd4bf";
  if (score >= 6.5) return "#5eead4";
  if (score >= 5) return "#fcd34d";
  if (score >= 3.5) return "#fb923c";
  return "#fb7185";
}

export function scoreInk(score: number) {
  if (score >= 6.5) return "#042f2e";
  if (score >= 5) return "#422006";
  return "#4c0519";
}

export function parseTideStamp(stamp: string) {
  if (stamp.includes("T")) return new Date(stamp.endsWith("Z") ? stamp : `${stamp}Z`);
  return new Date(`${stamp.replace(" ", "T")}:00Z`);
}

export function tidePath(
  points: { x: number; y: number }[],
  width: number,
  height: number,
) {
  if (points.length < 2) return "";
  const d: string[] = [];
  points.forEach((p, i) => {
    const cmd = i === 0 ? "M" : "L";
    d.push(`${cmd}${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  });
  const last = points[points.length - 1];
  const first = points[0];
  d.push(`L${last.x.toFixed(1)},${height}`);
  d.push(`L${first.x.toFixed(1)},${height}`);
  d.push("Z");
  return d.join(" ");
}

export function linePath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
}
