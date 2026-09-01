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
        <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">The list · this morning · Saturday</p>
        <h1 className="mt-1 font-heading text-4xl text-[color:var(--cream)] md:text-5xl">
          Get the morning
        </h1>
        <p className="mt-3 text-sm text-[color:var(--cream)]/65">
          Tell us the water. We’ll send the morning. Take a whole coast or only the subsections —
          Florida is Key Largo, Islamorada, Flamingo, Marathon, Key West, Boca Grande, Jupiter,
          and Biscayne, not Islamorada alone. A Texas-only list does not get Andros or Seychelles.
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
