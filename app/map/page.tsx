import { Suspense } from "react";
import { getArea } from "@/lib/data/areas";
import { MapPageClient } from "@/components/map-page";

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; activity?: string; theater?: string }>;
}) {
  const q = await searchParams;
  const area = getArea(q.area);
  return (
    <Suspense>
      <MapPageClient
        areaId={area.id}
        activity={q.activity ?? "all"}
        theater={q.theater ?? area.theater}
      />
    </Suspense>
  );
}
