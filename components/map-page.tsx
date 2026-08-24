"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { OfficialPoint } from "@/lib/layers";
import { FilterBar } from "@/components/filters";
import { SAVED_MAPS, savedMarksNear } from "@/lib/data/saved-maps";
import { getArea } from "@/lib/data/areas";

const CoastMap = dynamic(() => import("@/components/coast-map").then((m) => m.CoastMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[min(72vh,720px)] items-center justify-center rounded-2xl border border-[color:var(--line)] text-[color:var(--cream)]/50">
      Loading chart…
    </div>
  ),
});

export function MapPageClient({
  areaId,
  activity,
  theater,
}: {
  areaId: string;
  activity: string;
  theater?: string;
}) {
  const [layers, setLayers] = useState<{
    gnis: OfficialPoint[];
    wrecks: OfficialPoint[];
    zones: OfficialPoint[];
    access: OfficialPoint[];
  } | null>(null);

  useEffect(() => {
    let dead = false;
    fetch(`/api/layers?area=${areaId}`)
      .then((r) => r.json())
      .then((j) => {
        if (!dead) setLayers(j);
      })
      .catch(() => {
        if (!dead) setLayers({ gnis: [], wrecks: [], zones: [], access: [] });
      });
    return () => {
      dead = true;
    };
  }, [areaId]);

  const atlas = savedMarksNear(getArea(areaId));
  const extras = layers
    ? [...layers.zones, ...layers.wrecks, ...layers.access, ...layers.gnis, ...atlas]
    : atlas;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">Chart</p>
        <h1 className="mt-1 font-heading text-4xl text-[color:var(--cream)]">Marks and legal water</h1>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--cream)]/65">
          Copper pins are Field Manual / public structure — named passes are snapped to USGS GNIS
          where the gazetteer has them. Red rings are FKNMS no-take zones (legal NOAA polygons).
          Green are NOAA ENC wrecks. Sand are TPWD / GLO / NPS access, including GLO drive-on
          corridors and PINS 4WD rules. Teal are live GNIS hydro features. TPWD coastal REST and
          the GLO Hub query still need agency tokens; TxGIO is the clearinghouse those inventories
          flow through. Cream pins are your My Maps:{" "}
          {SAVED_MAPS.map((m, i) => (
            <span key={m.id}>
              {i > 0 ? " · " : ""}
              <a className="underline decoration-[color:var(--copper)]/50" href={m.url}>
                {m.title}
              </a>
            </span>
          ))}
          . Red rings from your Keys map are no-take / caution.
        </p>
      </div>
      <FilterBar areaId={areaId} activity={activity} theater={theater} />
      <CoastMap
        theater={theater === "all" ? "all" : (theater as "texas" | "florida" | "bahamas" | undefined)}
        activity={activity === "all" ? "all" : (activity as "fly")}
        areaId={areaId}
        extras={extras}
      />
      <ul className="grid gap-2 text-xs text-[color:var(--cream)]/55 md:grid-cols-2">
        <li>USGS GNIS — {layers?.gnis.length ?? "…"} named features in the box</li>
        <li>NOAA ENC wrecks — {layers?.wrecks.length ?? "…"} charted</li>
        <li>FKNMS zones — {layers?.zones.length ?? "…"} (Florida only)</li>
        <li>Public access — {layers?.access.length ?? "…"} TPWD / GLO / NPS</li>
        <li>Your My Maps — {atlas.length} marks in this box</li>
      </ul>
    </div>
  );
}
