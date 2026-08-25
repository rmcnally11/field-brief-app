export function windLevel(mph: number) {
  if (mph < 8) return 1;
  if (mph < 16) return 2;
  return 3;
}

export function windWord(mph: number | null) {
  if (mph == null) return "no wind forecast";
  const n = Math.round(mph);
  if (mph < 8) return `light · ${n} mph`;
  if (mph < 16) return `breeze · ${n} mph`;
  if (mph < 22) return `windy · ${n} mph`;
  return `blow · ${n} mph`;
}
