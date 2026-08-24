"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { SPOTS } from "@/lib/data/spots";
import { AREA_BY_ID } from "@/lib/data/areas";
import type { OfficialPoint } from "@/lib/layers";
import type { ActivityId, Spot, SpotPick, TheaterId } from "@/lib/types";
import { scoreHex } from "@/lib/viz";
import "leaflet/dist/leaflet.css";

function isOffshoreMark(spot: { name: string; note: string; habitat: string; activities: string[] }) {
  const n = `${spot.name} ${spot.note}`.toLowerCase();
  return (
    n.includes("troll") ||
    n.includes("color change") ||
    n.includes("blue water") ||
    n.includes("hump") ||
    spot.habitat === "blue-water"
  );
}

function Fit({
  spots,
  extras,
  lat,
  lon,
}: {
  spots: Spot[];
  extras: OfficialPoint[];
  lat: number;
  lon: number;
}) {
  const map = useMap();
  useEffect(() => {
    const camera = [...spots, ...extras.filter((e) => e.kind === "access")];
    if (!camera.length) {
      map.setView([lat, lon], 11);
      return;
    }
    const lats = camera.map((s) => s.lat);
    const lons = camera.map((s) => s.lon);
    const pad = 0.03;
    map.fitBounds(
      [
        [Math.min(...lats) - pad, Math.min(...lons) - pad],
        [Math.max(...lats) + pad, Math.max(...lons) + pad],
      ],
      { padding: [40, 40], maxZoom: 13, animate: false },
    );
  }, [map, spots, extras, lat, lon]);
  return null;
}

const SOURCE_COLOR: Record<string, string> = {
  "field-manual": "#e23b3b",
  "public-structure": "#2f8fd6",
  "saved-map": "#f0c14b",
};

const KIND_COLOR: Record<string, string> = {
  gnis: "#2f8fd6",
  "enc-wreck": "#1ea7a0",
  "fknms-zone": "#e23b3b",
  access: "#ff6b4a",
  pins: "#f0c14b",
  "saved-map": "#f0c14b",
};

export function CoastMap({
  theater,
  activity,
  areaId,
  extras = [],
  briefed = [],
}: {
  theater?: TheaterId | "all";
  activity?: ActivityId | "all";
  areaId?: string;
  extras?: OfficialPoint[];
  briefed?: SpotPick[];
}) {
  const catalog = SPOTS.filter((s) => {
    const area = AREA_BY_ID[s.areaId];
    if (!area) return false;
    if (areaId && s.areaId !== areaId) return false;
    if (theater && theater !== "all" && area.theater !== theater) return false;
    if (activity && activity !== "all" && !s.activities.includes(activity)) return false;
    const offshore = isOffshoreMark(s);
    if (activity === "offshore") return offshore || s.activities.includes("offshore");
    if (offshore) return false;
    return true;
  });
  const spots = briefed.length ? briefed.map((p) => p.spot) : catalog;
  const scoreById = new Map(briefed.map((p) => [p.spot.id, p]));

  const desk = areaId ? AREA_BY_ID[areaId] : undefined;
  const center = (desk
    ? [desk.lat, desk.lon]
    : spots[0]
      ? [spots[0].lat, spots[0].lon]
      : [26.5, -82]) as [number, number];

  return (
    <MapContainer
      center={center}
      zoom={11}
      className="h-[min(62dvh,560px)] w-full rounded-2xl ring-1 ring-[color:var(--line)] md:h-[min(80vh,860px)]"
      scrollWheelZoom
    >
      <TileLayer
        attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />
      <TileLayer
        attribution="&copy; OpenStreetMap &copy; CARTO"
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
        opacity={0.85}
      />
      <Fit spots={spots} extras={extras} lat={center[0]} lon={center[1]} />
      {spots.map((s) => {
        const pick = scoreById.get(s.id);
        const color = pick ? scoreHex(pick.score) : SOURCE_COLOR[s.source];
        return (
        <CircleMarker
          key={s.id}
          center={[s.lat, s.lon]}
          radius={pick ? 11 : 8}
          pathOptions={{
            color,
            fillColor: color,
            fillOpacity: 0.88,
            weight: pick ? 2 : 1,
          }}
        >
          <Popup>
            <div className="min-w-48 text-sm">
              <p className="font-semibold">{s.name}</p>
              <p className="text-xs uppercase tracking-wide opacity-60">
                {AREA_BY_ID[s.areaId]?.name} · {s.source.replace("-", " ")}
                {pick ? ` · ${pick.score.toFixed(1)}` : ""}
              </p>
              <p className="mt-1">{s.note}</p>
              {pick?.why[0] ? <p className="mt-1 text-xs opacity-70">{pick.why[0]}</p> : null}
              {s.gnisId ? <p className="mt-1 text-xs opacity-60">USGS GNIS {s.gnisId}</p> : null}
              <p className="mt-1 text-xs opacity-70">{s.activities.join(" · ")}</p>
            </div>
          </Popup>
        </CircleMarker>
        );
      })}
      {extras
        .filter((p, i, all) => all.findIndex((x) => x.id === p.id) === i)
        .map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.lat, p.lon]}
          radius={p.kind === "fknms-zone" ? 11 : 6}
          pathOptions={{
            color: KIND_COLOR[p.kind] ?? "#fff",
            fillColor: KIND_COLOR[p.kind] ?? "#fff",
            fillOpacity: p.kind === "fknms-zone" ? 0.25 : 0.7,
            weight: p.kind === "fknms-zone" ? 2 : 1,
          }}
        >
          <Popup>
            <div className="min-w-48 text-sm">
              <p className="font-semibold">{p.name}</p>
              <p className="text-xs uppercase tracking-wide opacity-60">{p.source}</p>
              <p className="mt-1">{p.detail}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
