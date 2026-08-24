import { MorningMail } from "@/components/morning-mail";
import { desksForCoasts, isAllCoasts, letterDeskForArea, resolveElectedCoasts } from "@/lib/coasts";
import { readCoastsPref, readWaterPref } from "@/lib/prefs";
import { Waterline } from "@/components/viz/waterline";

export const dynamic = "force-dynamic";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ coasts?: string; desks?: string }>;
}) {
  const q = await searchParams;
  const [cookie, water] = await Promise.all([readCoastsPref(), readWaterPref()]);
  const coasts = resolveElectedCoasts({
    coastsQuery: q.coasts,
    desksQuery: q.desks,
    cookie: cookie?.join(",") ?? null,
  });
  const signupDesks =
    coasts && !isAllCoasts(coasts)
      ? desksForCoasts(coasts)
      : [letterDeskForArea(water?.areaId) ?? "galveston"];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">The list</p>
        <h1 className="mt-1 font-heading text-4xl text-[color:var(--cream)] md:text-5xl">
          Get tonight’s water
        </h1>
        <p className="mt-3 text-sm text-[color:var(--cream)]/65">
          Pick the coast you fish and leave an email. You get today’s brief, this month’s calendar,
          and the letter for that water now — then the 5am line after that. A Texas signup does not
          get Andros or Seychelles.
        </p>
        <Waterline className="mt-4" />
      </header>
      <MorningMail
        source="Letter"
        defaultDesks={signupDesks}
        defaultDesk={signupDesks[0]}
        join
      />
    </div>
  );
}
