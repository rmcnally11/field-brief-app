"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { AREAS, getArea } from "@/lib/data/areas";
import { ACTIVITIES } from "@/lib/data/activities";
import type { TheaterId } from "@/lib/types";
import { THEATER_META } from "@/lib/data/theaters";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const THEATERS: { id: TheaterId | "all"; label: string }[] = [
  { id: "all", label: "All water" },
  ...THEATER_META.map((t) => ({ id: t.id, label: t.label })),
];

function useFilterHref() {
  const pathname = usePathname();
  const params = useSearchParams();
  return (next: Record<string, string | undefined>) => {
    const p = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (!v || v === "all") p.delete(k);
      else p.set(k, v);
    }
    const q = p.toString();
    return q ? `${pathname}?${q}` : pathname;
  };
}

export function FilterBar({
  areaId,
  activity,
  theater,
}: {
  areaId: string;
  activity: string;
  theater?: string;
}) {
  const href = useFilterHref();
  const params = useSearchParams();
  const visibleAreas = AREAS.filter((a) => !theater || theater === "all" || a.theater === theater);

  return (
    <>
      <div className="relative z-20 hidden space-y-3 md:block">
        <div className="flex flex-wrap gap-1.5">
          {THEATERS.map((t) => (
            <a
              key={t.id}
              href={href({
                theater: t.id === "all" ? undefined : t.id,
                area: t.id === "all" ? areaId : AREAS.find((a) => a.theater === t.id)?.id,
              })}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1 text-xs uppercase tracking-[0.14em]",
                (theater ?? "all") === t.id
                  ? "border-[color:var(--sea)] bg-[color:var(--sea)]/20 text-[color:var(--cream)]"
                  : "border-[color:var(--line)] text-[color:var(--cream)]/60 hover:text-[color:var(--cream)]",
              )}
            >
              {t.label}
            </a>
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {visibleAreas.map((a) => (
            <a
              key={a.id}
              href={href({ area: a.id, theater: a.theater })}
              className={cn(
                "shrink-0 cursor-pointer rounded-md px-2.5 py-1 text-sm",
                areaId === a.id
                  ? "bg-[color:var(--cream)] text-[color:var(--ink)]"
                  : "bg-[color:var(--cream)]/5 text-[color:var(--cream)]/70 hover:bg-[color:var(--cream)]/10",
              )}
            >
              {a.shortName}
            </a>
          ))}
        </div>
        {params.get("date") ? (
          <a
            href={href({ date: undefined })}
            className="inline-flex cursor-pointer rounded-md border border-[color:var(--copper)] bg-[color:var(--copper)]/10 px-2.5 py-1 text-xs text-[color:var(--cream)]"
          >
            Forecast {params.get("date")} · back to this morning
          </a>
        ) : null}
        <div className="flex flex-wrap gap-1.5">
          <a
            href={href({ activity: undefined })}
            className={cn(
              "cursor-pointer rounded-md border px-2.5 py-1 text-xs",
              activity === "all"
                ? "border-[color:var(--cream)] text-[color:var(--cream)]"
                : "border-[color:var(--line)] text-[color:var(--cream)]/55",
            )}
          >
            Any method
          </a>
          {ACTIVITIES.map((a) => (
            <a
              key={a.id}
              href={href({ activity: a.id })}
              className={cn(
                "cursor-pointer rounded-md border px-2.5 py-1 text-xs",
                activity === a.id
                  ? "border-[color:var(--cream)] text-[color:var(--cream)]"
                  : "border-[color:var(--line)] text-[color:var(--cream)]/55",
              )}
              title={a.blurb}
            >
              {a.label}
            </a>
          ))}
        </div>
      </div>
      <MobileFilterSheet areaId={areaId} activity={activity} theater={theater} />
    </>
  );
}

function MobileFilterSheet({
  areaId,
  activity,
  theater,
}: {
  areaId: string;
  activity: string;
  theater?: string;
}) {
  const href = useFilterHref();
  const params = useSearchParams();
  const area = getArea(areaId);
  const theaterId = theater ?? area.theater;
  const theaterLabel = THEATERS.find((t) => t.id === theaterId)?.label ?? "All water";
  const methodLabel = ACTIVITIES.find((a) => a.id === activity)?.label ?? "Any method";
  const visibleAreas = AREAS.filter((a) => !theater || theater === "all" || a.theater === theater);

  return (
    <Sheet>
      <div className="sticky top-[calc(3.25rem+env(safe-area-inset-top))] z-20 md:hidden">
        <SheetTrigger
          render={
            <button
              type="button"
              className="flex w-full touch-manipulation items-center justify-between gap-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)] px-3.5 py-3 text-left shadow-[0_8px_24px_rgba(11,31,51,0.06)]"
            />
          }
        >
          <span className="min-w-0">
            <span className="block text-[10px] uppercase tracking-[0.18em] text-[color:var(--copper)]">
              Water · method
            </span>
            <span className="mt-0.5 block truncate font-heading text-lg text-[color:var(--cream)]">
              {theaterLabel} · {area.shortName}
            </span>
            <span className="block text-xs text-[color:var(--cream)]/50">{methodLabel}</span>
          </span>
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--sea)] text-white">
            <SlidersHorizontal className="size-4" />
            <span className="sr-only">Open filters</span>
          </span>
        </SheetTrigger>
      </div>
      <SheetContent
        side="bottom"
        className="max-h-[min(88dvh,40rem)] gap-0 rounded-t-3xl border-[color:var(--line)] bg-[color:var(--ink)] text-[color:var(--cream)]"
      >
        <SheetHeader className="pb-1">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--copper)]">Pick the water</p>
          <SheetTitle className="font-heading text-2xl text-[color:var(--cream)]">Filters</SheetTitle>
          <SheetDescription className="text-[color:var(--cream)]/50">
            Theater, micro-area, then the method. Same brief. Bigger taps.
          </SheetDescription>
          {params.get("date") ? (
            <a
              href={href({ date: undefined })}
              className="mx-4 mb-2 touch-manipulation rounded-xl border border-[color:var(--copper)] bg-[color:var(--copper)]/10 px-3 py-3 text-sm"
            >
              Forecast {params.get("date")} · back to this morning
            </a>
          ) : null}
        </SheetHeader>
        <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <section>
            <h3 className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[color:var(--cream)]/40">Theater</h3>
            <div className="grid grid-cols-2 gap-2">
              {THEATERS.map((t) => (
                <a
                  key={t.id}
                  href={href({
                    theater: t.id === "all" ? undefined : t.id,
                    area: t.id === "all" ? areaId : AREAS.find((a) => a.theater === t.id)?.id,
                  })}
                  className={cn(
                    "touch-manipulation rounded-xl border px-3 py-3 text-sm",
                    (theater ?? "all") === t.id
                      ? "border-[color:var(--sea)] bg-[color:var(--sea)]/20 text-[color:var(--cream)]"
                      : "border-[color:var(--line)] text-[color:var(--cream)]/70",
                  )}
                >
                  {t.label}
                </a>
              ))}
            </div>
          </section>
          <section>
            <h3 className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[color:var(--cream)]/40">Micro-area</h3>
            <div className="grid grid-cols-2 gap-2">
              {visibleAreas.map((a) => (
                <a
                  key={a.id}
                  href={href({ area: a.id, theater: a.theater })}
                  className={cn(
                    "touch-manipulation rounded-xl px-3 py-3 text-sm",
                    areaId === a.id
                      ? "bg-[color:var(--cream)] text-[color:var(--ink)]"
                      : "bg-[color:var(--cream)]/5 text-[color:var(--cream)]/75",
                  )}
                >
                  {a.shortName}
                </a>
              ))}
            </div>
          </section>
          <section>
            <h3 className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[color:var(--cream)]/40">Method</h3>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={href({ activity: undefined })}
                className={cn(
                  "touch-manipulation rounded-xl border px-3 py-3 text-sm",
                  activity === "all"
                    ? "border-[color:var(--cream)] text-[color:var(--cream)]"
                    : "border-[color:var(--line)] text-[color:var(--cream)]/65",
                )}
              >
                Any method
              </a>
              {ACTIVITIES.map((a) => (
                <a
                  key={a.id}
                  href={href({ activity: a.id })}
                  className={cn(
                    "touch-manipulation rounded-xl border px-3 py-3 text-sm",
                    activity === a.id
                      ? "border-[color:var(--cream)] text-[color:var(--cream)]"
                      : "border-[color:var(--line)] text-[color:var(--cream)]/65",
                  )}
                >
                  {a.label}
                </a>
              ))}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
