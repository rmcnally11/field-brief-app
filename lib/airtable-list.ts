/** Field Brief list — Costal Cavaliers workspace. IDs are public; the token is not. */
export const AIRTABLE_BASE = "app3GRvkkpJdnVIKy";
export const AIRTABLE_TABLE = "tblqoCAVvAvEFYMe6";
export const AIRTABLE_TABLE_URL = `https://airtable.com/${AIRTABLE_BASE}/${AIRTABLE_TABLE}`;

export const AIRTABLE_FIELDS = {
  email: "fldxbuLSA1abol1QD",
  desks: "fldfp7bhxDuVsvLDs",
  status: "fldNvuox5pwxbDc9i",
  source: "fldCrpEUBV2t9a5oh",
  joined: "fldTQcD4XDpVsdy6f",
  notes: "fldYDuwwxmogAbDvl",
  cadence: "fldedcanNXcoKuOnM",
} as const;

export type ListSource = "Brief" | "Letter" | "Morning" | "Operator";

function token() {
  return process.env.AIRTABLE_API_KEY?.trim() || process.env.AIRTABLE_TOKEN?.trim() || "";
}

export function airtableConfigured() {
  return Boolean(token());
}

async function airtable<T>(path: string, init?: RequestInit): Promise<T> {
  const key = token();
  if (!key) throw new Error("Airtable token is not set.");
  const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable ${res.status}: ${text.slice(0, 240)}`);
  }
  return res.json() as Promise<T>;
}

type AirtableRecord = {
  id: string;
  fields: {
    Email?: string;
    Desks?: string[];
    Status?: string;
    Source?: string;
    Joined?: string;
    Cadence?: string[];
  };
};

export async function upsertAirtableSubscriber(input: {
  email: string;
  desks: string[];
  source: ListSource;
  cadence?: string[];
}) {
  const found = await airtable<{ records: AirtableRecord[] }>(
    `?${new URLSearchParams({
      filterByFormula: `LOWER({Email})="${input.email.replaceAll('"', "")}"`,
      maxRecords: "1",
    })}`,
  );
  const existing = found.records[0];
  const fields = {
    Email: input.email,
    Desks: input.desks,
    Status: existing?.fields.Status === "Unsubscribed" ? "Active" : (existing?.fields.Status ?? "Active"),
    Source: existing?.fields.Source ?? input.source,
    Joined: existing?.fields.Joined ?? new Date().toISOString().slice(0, 10),
    Cadence: input.cadence?.length ? input.cadence : (existing?.fields.Cadence ?? ["Daily", "Weekly", "Seasonal"]),
  };
  if (existing) {
    await airtable(`/${existing.id}`, { method: "PATCH", body: JSON.stringify({ fields }) });
    return { id: existing.id, created: false };
  }
  const created = await airtable<{ id: string }>("", {
    method: "POST",
    body: JSON.stringify({ fields }),
  });
  return { id: created.id, created: true };
}

export async function listAirtableSubscribers() {
  const out: Array<{
    email: string;
    desks: string[];
    cadence: string[];
    status: string;
    source: string;
    joined: string;
  }> = [];
  let offset: string | undefined;
  do {
    const qs = new URLSearchParams({
      filterByFormula: `OR({Status}="Active",{Status}="Paid")`,
      pageSize: "100",
    });
    if (offset) qs.set("offset", offset);
    const page = await airtable<{ records: AirtableRecord[]; offset?: string }>(`?${qs}`);
    for (const rec of page.records) {
      const email = rec.fields.Email?.trim().toLowerCase();
      if (!email) continue;
      out.push({
        email,
        desks: rec.fields.Desks ?? [],
        cadence: rec.fields.Cadence ?? ["Daily", "Weekly", "Seasonal"],
        status: rec.fields.Status ?? "Active",
        source: rec.fields.Source ?? "",
        joined: rec.fields.Joined ?? "",
      });
    }
    offset = page.offset;
  } while (offset);
  return out;
}
