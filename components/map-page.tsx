"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { OfficialPoint } from "@/lib/layers";
import { FilterBar } from "@/components/filters";
import { SAVED_MAPS, savedMarksNear } from "@/lib/data/saved-maps";
import { getArea } from "@/lib/data/areas";
import { Waterline } from "@/components/viz/waterline";

const CoastMap = dynamic(() => import("@/components/coast-map").then((m) => m.CoastMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[min(62dvh,560px)] items-center justify-center rounded-2xl border border-[color:var(--line)] bg-[#f4f8fc] text-[color:var(--cream)]/50 md:h-[min(80vh,860px)]">
      Loading satellite chart…
    </div>
  ),
});

const LEGEND = [
  { color: "#e23b3b", label: "Field Manual / public structure" },
  { color: "#f0c14b", label: "Your My Maps" },
  { color: "#2f8fd6", label: "USGS GNIS hydro" },
  { color: "#1ea7a0", label: "NOAA ENC wreck" },
  { color: "#e23b3b", label: "FKNMS / closed / caution" },
  { color: "#ff6b4a", label: "Public access" },
];

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

  const counts = [
    { n: layers?.gnis.length ?? null, label: "GNIS names" },
    { n: layers?.wrecks.length ?? null, label: "ENC wrecks" },
    { n: layers?.zones.length ?? null, label: "FKNMS zones" },
    { n: layers?.access.length ?? null, label: "Public access" },
    { n: atlas.length, label: "My Maps" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">Chart</p>
        <h1 className="mt-1 font-heading text-4xl text-[color:var(--cream)] md:text-5xl">Marks and legal water</h1>
        <p className="mt-2 max-w-3xl text-sm text-[color:var(--cream)]/65">
          Satellite first. Copper pins are Field Manual / public structure — named passes snapped to
          USGS GNIS where the gazetteer has them. Red rings are FKNMS no-take zones. Green are NOAA
          ENC wrecks. Sand are public ramps and beach access. Teal are live GNIS hydro features. Cream pins
          are your My Maps:{" "}
          {SAVED_MAPS.map((m, i) => (
            <span key={m.id}>
              {i > 0 ? " · " : ""}
              <a className="underline decoration-[color:var(--copper)]/50" href={m.url}>
                {m.title}
              </a>
            </span>
          ))}
          . Not for navigation.
        </p>
        <Waterline className="mt-3" />
      </div>
      <FilterBar areaId={areaId} activity={activity} theater={theater} />
      <div className="relative">
        <CoastMap
          theater={theater === "all" ? "all" : (theater as import("@/lib/types").TheaterId | undefined)}
          activity={activity === "all" ? "all" : (activity as "fly")}
          areaId={areaId}
          extras={extras}
        />
        <ul className="mt-3 flex flex-wrap gap-2">
          {LEGEND.map((l) => (
            <li
              key={l.label}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--panel)] px-2.5 py-1 text-[11px] text-[color:var(--cream)]/70"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
              {l.label}
            </li>
          ))}
        </ul>
      </div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {counts.map((c) => (
          <li key={c.label} className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)] px-3 py-3 text-center">
            <p className="font-heading text-2xl text-[color:var(--cream)]">{c.n ?? "…"}</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--cream)]/45">{c.label}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
