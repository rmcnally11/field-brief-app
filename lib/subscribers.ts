import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DESKS } from "@/lib/desks";
import {
  cadenceLabels,
  parseCadence,
  type Cadence,
  CADENCES,
} from "@/lib/coasts";
import {
  airtableConfigured,
  listAirtableSubscribers,
  upsertAirtableSubscriber,
  type ListSource,
} from "@/lib/airtable-list";
import { resendAudienceId } from "@/lib/resend-list";

export const DESK_IDS: string[] = DESKS.map((d) => d.areaId);

export type Subscriber = {
  email: string;
  desks: string[];
  cadence: Cadence[];
  createdAt: string;
};

const FILE = path.join(process.cwd(), "data", "subscribers.json");

function normalizeEmail(raw: string) {
  return raw.trim().toLowerCase();
}

export function validEmail(raw: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim());
}

export function parseDesks(raw: unknown): string[] {
  const wanted = new Set(DESK_IDS);
  const list = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : [];
  return [...new Set(list.map((d) => String(d).trim()).filter((d) => wanted.has(d)))];
}

async function readLocal(): Promise<Subscriber[]> {
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as Array<Subscriber & { cadence?: Cadence[] }>;
    return Array.isArray(parsed)
      ? parsed.map((s) => ({ ...s, cadence: parseCadence(s.cadence) }))
      : [];
  } catch {
    return [];
  }
}

async function writeLocal(list: Subscriber[]) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, `${JSON.stringify(list, null, 2)}\n`);
}

function envSubscribers(): Subscriber[] {
  const raw = process.env.SUBSCRIBER_EMAILS?.trim();
  if (!raw) return [];
  return raw
    .split(/[,;\s]+/)
    .map((email) => email.trim())
    .filter(validEmail)
    .map((email) => ({
      email: normalizeEmail(email),
      desks: [...DESK_IDS],
      cadence: [...CADENCES],
      createdAt: "env",
    }));
}

function encodeResendMeta(sub: Subscriber) {
  return `fb:${sub.desks.join(",")}|${sub.cadence.join(",")}`;
}

function parseResendMeta(lastName?: string): Pick<Subscriber, "desks" | "cadence"> {
  if (!lastName?.startsWith("fb:")) return { desks: [], cadence: [...CADENCES] };
  const [deskPart, cadencePart] = lastName.slice(3).split("|");
  return {
    desks: parseDesks(deskPart),
    cadence: parseCadence(cadencePart),
  };
}

async function addResendContact(sub: Subscriber) {
  const key = process.env.RESEND_API_KEY?.trim();
  const audience = await resendAudienceId();
  if (!key || !audience) return false;
  const res = await fetch(`https://api.resend.com/audiences/${audience}/contacts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: sub.email,
      first_name: "Field Brief",
      last_name: encodeResendMeta(sub),
      unsubscribed: false,
    }),
  });
  if (!res.ok && res.status !== 409) {
    const text = await res.text();
    throw new Error(`Resend contact ${res.status}: ${text.slice(0, 200)}`);
  }
  return true;
}

async function listResendContacts(): Promise<Subscriber[]> {
  const key = process.env.RESEND_API_KEY?.trim();
  const audience = key ? await resendAudienceId() : "";
  if (!key || !audience) return [];
  const res = await fetch(`https://api.resend.com/audiences/${audience}/contacts`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as {
    data?: Array<{ email?: string; last_name?: string; unsubscribed?: boolean }>;
  };
  return (json.data ?? [])
    .filter((c) => c.email && !c.unsubscribed)
    .map((c) => {
      const meta = parseResendMeta(c.last_name);
      return {
        email: normalizeEmail(c.email!),
        desks: meta.desks,
        cadence: meta.cadence,
        createdAt: "resend",
      };
    });
}

export async function addSubscriber(
  email: string,
  desks: string[],
  source: ListSource = "Brief",
  cadence: Cadence[] = [...CADENCES],
) {
  const sub: Subscriber = {
    email: normalizeEmail(email),
    desks: parseDesks(desks),
    cadence: parseCadence(cadence),
    createdAt: new Date().toISOString(),
  };
  if (!validEmail(sub.email)) throw new Error("That is not an email.");
  if (!sub.desks.length) throw new Error("Pick at least one coast.");
  const local = await readLocal();
  const next = [...local.filter((s) => s.email !== sub.email), sub];
  try {
    await writeLocal(next);
  } catch {
    // Vercel filesystem is ephemeral — Airtable is the list that survives.
  }
  let via: "airtable" | "resend" | "local" = "local";
  if (airtableConfigured()) {
    try {
      await upsertAirtableSubscriber({
        email: sub.email,
        desks: sub.desks,
        source,
        cadence: cadenceLabels(sub.cadence),
      });
      via = "airtable";
    } catch {
      via = "local";
    }
  }
  try {
    if (await addResendContact(sub) && via !== "airtable") via = "resend";
  } catch {
    // keep via
  }
  return {
    subscriber: sub,
    persisted: via !== "local" || Boolean(process.env.SUBSCRIBER_EMAILS),
    via,
  };
}

function mergeSubscriber(prev: Subscriber | undefined, next: Subscriber): Subscriber {
  return {
    email: next.email,
    desks: [...new Set([...(prev?.desks ?? []), ...next.desks])],
    cadence: [...new Set([...(prev?.cadence ?? []), ...next.cadence])],
    createdAt: prev?.createdAt ?? next.createdAt,
  };
}

export async function listSubscribers(): Promise<Subscriber[]> {
  const byEmail = new Map<string, Subscriber>();
  let airtable: Subscriber[] = [];
  if (airtableConfigured()) {
    try {
      airtable = (await listAirtableSubscribers()).map((s) => ({
        email: s.email,
        desks: parseDesks(s.desks),
        cadence: parseCadence(s.cadence),
        createdAt: s.joined || "airtable",
      }));
    } catch {
      airtable = [];
    }
  }
  for (const sub of [...envSubscribers(), ...airtable, ...(await listResendContacts()), ...(await readLocal())]) {
    byEmail.set(sub.email, mergeSubscriber(byEmail.get(sub.email), sub));
  }
  return [...byEmail.values()];
}

export function subscribersForDesk(list: Subscriber[], areaId: string, cadence?: Cadence) {
  return list
    .filter((s) => s.desks.includes(areaId) && (!cadence || s.cadence.includes(cadence)))
    .map((s) => s.email);
}
