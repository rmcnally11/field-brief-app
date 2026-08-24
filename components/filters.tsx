"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AREAS } from "@/lib/data/areas";
import { ACTIVITIES } from "@/lib/data/activities";
import type { TheaterId } from "@/lib/types";
import { cn } from "@/lib/utils";

const THEATERS: { id: TheaterId | "all"; label: string }[] = [
  { id: "all", label: "All water" },
  { id: "texas", label: "Texas" },
  { id: "florida", label: "Miami & Keys" },
  { id: "bahamas", label: "Bahamas" },
];

export function FilterBar({
  areaId,
  activity,
  theater,
}: {
  areaId: string;
  activity: string;
  theater?: string;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const href = (next: Record<string, string | undefined>) => {
    const p = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (!v || v === "all") p.delete(k);
      else p.set(k, v);
    }
    const q = p.toString();
    return q ? `${pathname}?${q}` : pathname;
  };

  const visibleAreas = AREAS.filter((a) => !theater || theater === "all" || a.theater === theater);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {THEATERS.map((t) => (
          <Link
            key={t.id}
            href={href({
              theater: t.id === "all" ? undefined : t.id,
              area: t.id === "all" ? areaId : AREAS.find((a) => a.theater === t.id)?.id,
            })}
            className={cn(
              "rounded-full border px-3 py-1 text-xs uppercase tracking-[0.14em]",
              (theater ?? "all") === t.id
                ? "border-[color:var(--copper)] bg-[color:var(--copper)]/15 text-[color:var(--cream)]"
                : "border-[color:var(--line)] text-[color:var(--cream)]/60 hover:text-[color:var(--cream)]",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {visibleAreas.map((a) => (
          <Link
            key={a.id}
            href={href({ area: a.id, theater: a.theater })}
            className={cn(
              "shrink-0 rounded-md px-2.5 py-1 text-sm",
              areaId === a.id
                ? "bg-[color:var(--cream)] text-[color:var(--ink)]"
                : "bg-white/5 text-[color:var(--cream)]/70 hover:bg-white/10",
            )}
          >
            {a.shortName}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Link
          href={href({ activity: undefined })}
          className={cn(
            "rounded-md border px-2.5 py-1 text-xs",
            activity === "all"
              ? "border-[color:var(--cream)] text-[color:var(--cream)]"
              : "border-[color:var(--line)] text-[color:var(--cream)]/55",
          )}
        >
          Any method
        </Link>
        {ACTIVITIES.map((a) => (
          <Link
            key={a.id}
            href={href({ activity: a.id })}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs",
              activity === a.id
                ? "border-[color:var(--cream)] text-[color:var(--cream)]"
                : "border-[color:var(--line)] text-[color:var(--cream)]/55",
            )}
            title={a.blurb}
          >
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
