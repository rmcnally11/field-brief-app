import type { ActivityId } from "@/lib/types";

export function briefHref(opts: {
  areaId: string;
  theater: string;
  activity?: ActivityId | "all" | string;
  date?: string | null;
}) {
  const p = new URLSearchParams();
  p.set("area", opts.areaId);
  p.set("theater", opts.theater);
  if (opts.activity && opts.activity !== "all") p.set("activity", opts.activity);
  if (opts.date) p.set("date", opts.date);
  return `/?${p}`;
}

export function compareHref(opts: {
  a: string;
  b: string;
  activity?: ActivityId | "all" | string;
  date?: string | null;
}) {
  const p = new URLSearchParams();
  p.set("a", opts.a);
  p.set("b", opts.b);
  if (opts.activity && opts.activity !== "all") p.set("activity", opts.activity);
  if (opts.date) p.set("date", opts.date);
  return `/compare?${p}`;
}

export function calendarHref(opts: { areaId: string; theater: string; activity?: string; month?: string }) {
  const p = new URLSearchParams();
  p.set("area", opts.areaId);
  p.set("theater", opts.theater);
  if (opts.activity && opts.activity !== "all") p.set("activity", opts.activity);
  if (opts.month) p.set("month", opts.month);
  return `/calendar?${p}`;
}
