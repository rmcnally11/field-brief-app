import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MorningDesk } from "@/components/morning-desk";
import { getBriefing, parseBriefDate } from "@/lib/briefing";
import { AREA_BY_ID } from "@/lib/data/areas";
import { morningLine } from "@/lib/morning";
import { formatYmdLong } from "@/lib/time";
import { ogImageForArea, pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ area: string; date: string }>;
}): Promise<Metadata> {
  const { area: areaId, date: dateRaw } = await params;
  const area = AREA_BY_ID[areaId];
  const date = parseBriefDate(dateRaw);
  if (!area || !date) {
    return pageMeta({ title: "This morning", description: "Gauge quiet.", path: "/morning" });
  }
  const path = `/morning/${area.id}/${date}`;
  const when = formatYmdLong(date, area.timezone);
  const title = `${area.shortName}, ${when} — tide and wind`;
  try {
    const briefing = await getBriefing(area.id, "all", date);
    return pageMeta({
      title,
      description: morningLine(briefing).slice(0, 160),
      path,
      image: ogImageForArea(area.id),
      imageAlt: `${area.shortName} tide ${date}`,
    });
  } catch {
    return pageMeta({
      title,
      description: `This morning on ${area.shortName}, ${when}. Live NOAA tides and wind. Scores are 1–10, not a bite.`,
      path,
      image: ogImageForArea(area.id),
      imageAlt: `${area.shortName} tide ${date}`,
    });
  }
}

export default async function MorningDatedPage({
  params,
  searchParams,
}: {
  params: Promise<{ area: string; date: string }>;
  searchParams: Promise<{ activity?: string }>;
}) {
  const [{ area, date: dateRaw }, q] = await Promise.all([params, searchParams]);
  const date = parseBriefDate(dateRaw);
  if (!AREA_BY_ID[area] || !date) notFound();
  return <MorningDesk areaId={area} activity={q.activity} date={date} />;
}
