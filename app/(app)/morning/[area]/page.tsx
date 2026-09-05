import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MorningDesk } from "@/components/morning-desk";
import { getBriefing } from "@/lib/briefing";
import { AREA_BY_ID } from "@/lib/data/areas";
import { morningLine } from "@/lib/morning";
import { ogImageForArea, pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ area: string }>;
}): Promise<Metadata> {
  const { area: areaId } = await params;
  const area = AREA_BY_ID[areaId];
  if (!area) return pageMeta({ title: "This morning", description: "Gauge quiet.", path: "/morning" });
  const path = `/morning/${area.id}`;
  const title = `${area.shortName} this morning — tide, wind, go or wait`;
  try {
    const briefing = await getBriefing(area.id);
    return pageMeta({
      title,
      description: morningLine(briefing).slice(0, 160),
      path,
      image: ogImageForArea(area.id),
      imageAlt: `${area.shortName} tide`,
    });
  } catch {
    return pageMeta({
      title,
      description: `This morning on ${area.shortName}. Live NOAA tides and wind. Scores are 1–10, not a bite.`,
      path,
      image: ogImageForArea(area.id),
      imageAlt: `${area.shortName} tide`,
    });
  }
}

export default async function MorningAreaPage({
  params,
  searchParams,
}: {
  params: Promise<{ area: string }>;
  searchParams: Promise<{ activity?: string }>;
}) {
  const [{ area }, q] = await Promise.all([params, searchParams]);
  if (!AREA_BY_ID[area]) notFound();
  return <MorningDesk areaId={area} activity={q.activity} />;
}
