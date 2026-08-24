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
  if (airtableConfigured()) {
    await upsertAirtableSubscriber({
      email: sub.email,
      desks: sub.desks,
      source,
      cadence: cadenceLabels(sub.cadence),
    });
    return { subscriber: sub, persisted: true, via: "airtable" as const };
  }
  return {
    subscriber: sub,
    persisted: Boolean(process.env.SUBSCRIBER_EMAILS),
    via: "local" as const,
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
  for (const sub of [...envSubscribers(), ...airtable, ...(await readLocal())]) {
    byEmail.set(sub.email, mergeSubscriber(byEmail.get(sub.email), sub));
  }
  return [...byEmail.values()];
}

export function subscribersForDesk(list: Subscriber[], areaId: string, cadence?: Cadence) {
  return list
    .filter((s) => s.desks.includes(areaId) && (!cadence || s.cadence.includes(cadence)))
    .map((s) => s.email);
}
