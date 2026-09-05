import { redirect } from "next/navigation";
import { parseBriefDate } from "@/lib/briefing";
import { readWaterPref, resolveDeskForTheater } from "@/lib/prefs";
import { morningHref } from "@/lib/hrefs";
import { pageMeta } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "This morning — tide, wind, go or wait",
  description:
    "One sentence for the water. Live NOAA tides and wind. Scores are 1–10, not a bite. Not On The Water magazine.",
  path: "/morning",
});

export default async function MorningIndex({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; activity?: string; theater?: string; date?: string }>;
}) {
  const q = await searchParams;
  const pref = await readWaterPref();
  const desk = resolveDeskForTheater(q, pref);
  const date = parseBriefDate(q.date);
  redirect(
    morningHref({
      areaId: desk.area.id,
      theater: desk.area.theater,
      activity: q.activity,
      date,
    }),
  );
}
