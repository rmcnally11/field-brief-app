import { redirect } from "next/navigation";
import { hasGateCookie, safeNextPath } from "@/lib/gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Waterline } from "@/components/viz/waterline";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "On This Water — the list",
  description: "A shared word opens the operator list. The rest of the instrument is public.",
};

export default async function EnterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const q = await searchParams;
  const next = safeNextPath(q.next);
  if (await hasGateCookie()) redirect(next);

  const failed = q.error === "1";

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--copper)]">Operator list</p>
      <h1 className="mt-2 font-heading text-4xl text-[color:var(--cream)] md:text-5xl">The list</h1>
      <p className="mt-3 text-sm text-[color:var(--cream)]/65">
        Today, calendar, map, compare, morning, species, method, season, and the letter are open.
        This word only opens the subscriber table. Family emails stay off the public site.
      </p>
      <Waterline className="mt-5" />

      <form action="/api/unlock" method="post" className="mt-8 space-y-4">
        <input type="hidden" name="next" value={next} />
        <div className="space-y-2">
          <Label htmlFor="password" className="text-[color:var(--cream)]/70">
            The word
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            required
            aria-invalid={failed || undefined}
            className="h-11 border-[color:var(--line)] bg-[color:var(--panel)] text-[color:var(--cream)]"
          />
        </div>
        {failed ? (
          <p className="text-sm text-[color:var(--copper)]" role="alert">
            That is not the word.
          </p>
        ) : null}
        <Button
          type="submit"
          size="lg"
          className="w-full bg-[color:var(--sea)] text-white hover:bg-[color:var(--sea)]/90"
        >
          Open the list
        </Button>
      </form>
    </div>
  );
}
