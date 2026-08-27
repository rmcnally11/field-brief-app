"use client";

import type { CalendarDay } from "@/lib/types";
import { bestRhyme, wroteOn } from "@/lib/book";
import { useBook } from "@/lib/book-store";
import { briefHref, bookHref } from "@/lib/hrefs";
import { formatYmdLong } from "@/lib/time";

export function RhymeStrip({
  areaId,
  theater,
  activity,
  days,
  timezone,
}: {
  areaId: string;
  theater: string;
  activity: string;
  days: CalendarDay[];
  timezone: string;
}) {
  const { book, ready, unlocked } = useBook();
  if (!ready || !unlocked || book.catches.length === 0) return null;

  const today = new Date().toLocaleDateString("en-CA", { timeZone: timezone });
  const upcoming = days
    .filter((d) => d.date >= today)
    .map((d) => ({ day: d, hit: bestRhyme(d, book.catches, areaId) }))
    .filter((x): x is { day: CalendarDay; hit: NonNullable<ReturnType<typeof bestRhyme>> } => x.hit != null)
    .slice(0, 6);
  const wrote = days.flatMap((d) => wroteOn(d, book.catches, areaId).map((entry) => ({ day: d, entry })));

  if (upcoming.length === 0 && wrote.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-[color:var(--line)] bg-[color:var(--panel)] p-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--copper)]">Your book</p>
        <p className="mt-2 text-sm text-[color:var(--cream)]/60">
          No day in this pair rhymes hard enough with a page you wrote on this water. That is
          honest.{" "}
          <a className="underline decoration-[color:var(--sea)]/40" href={bookHref({ areaId, theater, activity })}>
            Open the book
          </a>
          .
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-[color:var(--sea)]/35 bg-[color:var(--panel)] p-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--sea)]">Days that rhyme</p>
      <p className="mt-1 text-sm text-[color:var(--cream)]/50">
        Same glass as a catch you already wrote. Not a bite. Not a guarantee you will do it again.
      </p>
      {upcoming.length > 0 ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {upcoming.map(({ day, hit }) => (
            <li key={day.date}>
              <a
                href={briefHref({ areaId, theater, activity, date: day.date })}
                className="flex flex-col rounded-2xl border border-[color:var(--sea)]/40 bg-[color:var(--ink)] p-3"
              >
                <p className="font-heading text-lg text-[color:var(--cream)]">{formatYmdLong(day.date, timezone)}</p>
                <p className="text-xs text-[color:var(--cream)]/55">
                  Rhyme · {hit.speciesName} · {hit.reasons.join(" · ")}
                </p>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      {wrote.length > 0 ? (
        <p className="mt-4 text-xs text-[color:var(--cream)]/45">
          Already in the book: {wrote.map((w) => `${w.entry.speciesName} ${w.day.date.slice(5)}`).join(" · ")}
        </p>
      ) : null}
    </section>
  );
}
