import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBriefing } from "@/lib/briefing";
import { coastHub, COAST_HUBS } from "@/lib/coast-hubs";
import { morningLine } from "@/lib/morning";
import { morningHref } from "@/lib/hrefs";
import { ogImageForArea, pageMeta, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { Waterline } from "@/components/viz/waterline";
import { ScoreRing } from "@/components/viz/score-ring";
import { DockPostedHandoff } from "@/components/dock-posted-handoff";
import { CavalierHandoff } from "@/components/cavalier-handoff";

export const dynamic = "force-dynamic";
export const dynamicParams = false;

export function generateStaticParams() {
  return COAST_HUBS.map((hub) => ({ coast: hub.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ coast: string }>;
}): Promise<Metadata> {
  const { coast } = await params;
  const hub = coastHub(coast);
  if (!hub) return pageMeta({ title: "This morning", description: "Unknown coast.", path: "/" });
  const lead = hub.waters[0];
  return pageMeta({
    title: hub.title,
    description: hub.intro,
    path: `/${hub.slug}`,
    image: ogImageForArea(lead?.id ?? "galveston"),
    imageAlt: `${hub.h1} tide`,
  });
}

export default async function CoastHubPage({
  params,
}: {
  params: Promise<{ coast: string }>;
}) {
  const { coast } = await params;
  const hub = coastHub(coast);
  if (!hub) notFound();

  const settled = await Promise.allSettled(hub.waters.map((area) => getBriefing(area.id)));
  const rows = hub.waters.map((area, i) => {
    const result = settled[i];
    return {
      area,
      briefing: result.status === "fulfilled" ? result.value : null,
    };
  });
  const lead = hub.waters[0];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "On This Water", path: "/" },
          { name: hub.h1, path: `/${hub.slug}` },
        ])}
      />
      <div>
        <p className="kicker text-[color:var(--copper)]">{hub.kicker}</p>
        <h1 className="page-title mt-3 text-[color:var(--cream)]">{hub.h1}</h1>
        <p className="mt-3 max-w-2xl text-sm text-[color:var(--cream)]/65">{hub.intro}</p>
        <Waterline className="mt-4" />
        <DockPostedHandoff theater={hub.theater} areaId={lead?.id} />
        <CavalierHandoff theater={hub.theater} />
      </div>

      <ul className="space-y-3">
        {rows.map(({ area, briefing }) => (
          <li key={area.id}>
            <a
              href={morningHref({ areaId: area.id, theater: area.theater })}
              className="flex items-start justify-between gap-4 rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)] px-4 py-4"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--copper)]">
                  {area.shortName}
                </p>
                <p className="mt-1 font-heading text-xl text-[color:var(--cream)]">{area.name}</p>
                <p className="mt-2 text-sm text-[color:var(--cream)]/75">
                  {briefing ? morningLine(briefing) : `${area.shortName} is quiet. The gauge did not answer.`}
                </p>
              </div>
              {briefing ? (
                <ScoreRing score={briefing.overall} size={72} label="Today" />
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
