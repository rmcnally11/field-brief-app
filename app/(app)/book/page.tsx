import type { Metadata } from "next";
import { Suspense } from "react";
import { BookPortal } from "@/components/book-portal";
import { FilterBar } from "@/components/filters";
import { parseActivity } from "@/lib/briefing";
import { readWaterPref, resolveDeskForTheater } from "@/lib/prefs";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Your book",
  description: "Write the fish. The wind and the tide stay with it.",
  path: "/book",
  index: false,
});

export const dynamic = "force-dynamic";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; activity?: string; theater?: string }>;
}) {
  const q = await searchParams;
  const pref = await readWaterPref();
  const desk = resolveDeskForTheater(q, pref);
  const activity = parseActivity(q.activity ?? desk.activity);

  return (
    <div className="space-y-6">
      <Suspense>
        <FilterBar areaId={desk.area.id} activity={activity} theater={q.theater ?? desk.theater} />
      </Suspense>
      <BookPortal areaId={desk.area.id} theater={desk.theater} activity={activity} />
    </div>
  );
}
