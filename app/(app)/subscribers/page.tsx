import { airtableConfigured, AIRTABLE_TABLE_URL, listAirtableSubscribers } from "@/lib/airtable-list";
import { listSubscribers } from "@/lib/subscribers";
import { DESKS } from "@/lib/desks";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  let rows: Array<{
    email: string;
    desks: string[];
    cadence?: string[];
    status?: string;
    source?: string;
    joined?: string;
  }> = [];
  let via = "local";
  let error: string | null = null;
  if (airtableConfigured()) {
    try {
      rows = await listAirtableSubscribers();
      via = "airtable";
    } catch (e) {
      error = e instanceof Error ? e.message : "Airtable did not answer.";
    }
  } else {
    rows = (await listSubscribers()).map((s) => ({
      email: s.email,
      desks: s.desks,
      cadence: s.cadence,
      status: "local",
      joined: s.createdAt,
    }));
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">Operator</p>
        <h1 className="mt-1 font-heading text-4xl text-[color:var(--cream)]">The list</h1>
        <p className="mt-2 text-sm text-[color:var(--cream)]/65">
          Public signup writes a row with elected coasts and cadence. Active gets the mail they
          asked for — Texas-only does not get Andros. Paid is the monetize column. Unsubscribed is
          off. Sending still needs Resend.
        </p>
        <p className="mt-2 text-sm">
          <a
            href={AIRTABLE_TABLE_URL}
            className="text-[color:var(--sea)] underline decoration-[color:var(--sea)]/40"
          >
            Open the Subscribers table
          </a>
          <span className="text-[color:var(--cream)]/40"> · source {via}</span>
        </p>
      </div>
      {error ? (
        <p className="rounded-2xl border border-rose-400/40 bg-rose-50 p-4 text-sm text-rose-900">{error}</p>
      ) : null}
      {!airtableConfigured() ? (
        <p className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)] p-4 text-sm text-[color:var(--cream)]/70">
          Add <code className="text-[color:var(--copper)]">AIRTABLE_API_KEY</code> on Vercel (token
          scoped to the Field Brief base) so production signups land in the table. Until then this
          page shows the local / env list only.
        </p>
      ) : null}
      {rows.length === 0 ? (
        <p className="text-sm text-[color:var(--cream)]/55">No addresses on the list yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[color:var(--line)]">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-[color:var(--panel)] text-[11px] uppercase tracking-[0.14em] text-[color:var(--cream)]/45">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Desks</th>
                <th className="px-4 py-3">Cadence</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.email} className="border-t border-[color:var(--line)]">
                  <td className="px-4 py-3 text-[color:var(--cream)]">{r.email}</td>
                  <td className="px-4 py-3 text-[color:var(--cream)]/70">
                    {r.desks
                      .map((id) => DESKS.find((d) => d.areaId === id)?.desk.replace(" desk", "") ?? id)
                      .join(", ")}
                  </td>
                  <td className="px-4 py-3 text-[color:var(--cream)]/70">
                    {(r.cadence ?? []).map((c) => c[0]?.toUpperCase() + c.slice(1)).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-[color:var(--cream)]/70">{r.status ?? "—"}</td>
                  <td className="px-4 py-3 text-[color:var(--cream)]/70">{r.source ?? "—"}</td>
                  <td className="px-4 py-3 text-[color:var(--cream)]/55">{r.joined ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
