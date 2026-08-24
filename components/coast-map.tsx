"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { SPOTS } from "@/lib/data/spots";
import { AREA_BY_ID } from "@/lib/data/areas";
import type { OfficialPoint } from "@/lib/layers";
import type { ActivityId, TheaterId } from "@/lib/types";
import "leaflet/dist/leaflet.css";

function Fit({ spots, extras }: { spots: typeof SPOTS; extras: OfficialPoint[] }) {
  const map = useMap();
  useMemo(() => {
    const pts = [...spots, ...extras];
    if (!pts.length) return;
    const lats = pts.map((s) => s.lat);
    const lons = pts.map((s) => s.lon);
    map.fitBounds(
      [
        [Math.min(...lats) - 0.15, Math.min(...lons) - 0.15],
        [Math.max(...lats) + 0.15, Math.max(...lons) + 0.15],
      ],
      { padding: [24, 24] },
    );
  }, [map, spots, extras]);
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
}: {
  theater?: TheaterId | "all";
  activity?: ActivityId | "all";
  areaId?: string;
  extras?: OfficialPoint[];
}) {
  const spots = SPOTS.filter((s) => {
    const area = AREA_BY_ID[s.areaId];
    if (!area) return false;
    if (areaId && s.areaId !== areaId) return false;
    if (theater && theater !== "all" && area.theater !== theater) return false;
    if (activity && activity !== "all" && !s.activities.includes(activity)) return false;
    return true;
  });

  const center = spots[0] ? ([spots[0].lat, spots[0].lon] as [number, number]) : ([26.5, -82] as [number, number]);

  return (
    <MapContainer
      center={center}
      zoom={6}
      className="h-[min(80vh,860px)] w-full rounded-2xl ring-1 ring-[color:var(--line)]"
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
      <Fit spots={spots} extras={extras} />
      {spots.map((s) => (
        <CircleMarker
          key={s.id}
          center={[s.lat, s.lon]}
          radius={8}
          pathOptions={{
            color: SOURCE_COLOR[s.source],
            fillColor: SOURCE_COLOR[s.source],
            fillOpacity: 0.85,
            weight: 1,
          }}
        >
          <Popup>
            <div className="min-w-48 text-sm">
              <p className="font-semibold">{s.name}</p>
              <p className="text-xs uppercase tracking-wide opacity-60">
                {AREA_BY_ID[s.areaId]?.name} · {s.source.replace("-", " ")}
              </p>
              <p className="mt-1">{s.note}</p>
              {s.gnisId ? <p className="mt-1 text-xs opacity-60">USGS GNIS {s.gnisId}</p> : null}
              <p className="mt-1 text-xs opacity-70">{s.activities.join(" · ")}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
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
