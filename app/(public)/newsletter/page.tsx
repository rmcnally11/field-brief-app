import { filterNewsletter, getNewsletter } from "@/lib/newsletter";
import { LetterIssue } from "@/components/letter-issue";
import { MorningMail } from "@/components/morning-mail";
import { desksForCoasts, isAllCoasts, letterDeskForArea, resolveElectedCoasts } from "@/lib/coasts";
import { readCoastsPref, readWaterPref } from "@/lib/prefs";

export const dynamic = "force-dynamic";

export default async function NewsletterPage({
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

  let issue;
  let error: string | null = null;
  try {
    issue = filterNewsletter(await getNewsletter(), coasts);
  } catch (e) {
    error = e instanceof Error ? e.message : "The letter did not set.";
  }

  if (error || !issue) {
    return (
      <div className="rounded-2xl border border-rose-400/40 bg-rose-50 p-6 text-rose-900">
        <p className="font-heading text-xl">The letter did not set.</p>
        <p className="mt-2 text-sm opacity-80">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <LetterIssue issue={issue} coasts={coasts} />
      <MorningMail source="Letter" defaultDesks={signupDesks} defaultDesk={signupDesks[0]} />
    </div>
  );
}
