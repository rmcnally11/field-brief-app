import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DESKS } from "@/lib/desks";
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
  const list = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : DESK_IDS;
  const desks = [...new Set(list.map((d) => String(d).trim()).filter((d) => wanted.has(d)))];
  return desks.length ? desks : [...DESK_IDS];
}

async function readLocal(): Promise<Subscriber[]> {
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as Subscriber[];
    return Array.isArray(parsed) ? parsed : [];
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
      createdAt: "env",
    }));
}

async function addResendContact(sub: Subscriber) {
  const key = process.env.RESEND_API_KEY?.trim();
  const audience = process.env.RESEND_AUDIENCE_ID?.trim();
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
      last_name: `fb:${sub.desks.join(",")}`,
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
  const audience = process.env.RESEND_AUDIENCE_ID?.trim();
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
    .map((c) => ({
      email: normalizeEmail(c.email!),
      desks: c.last_name?.startsWith("fb:") ? parseDesks(c.last_name.slice(3)) : [...DESK_IDS],
      createdAt: "resend",
    }));
}

export async function addSubscriber(email: string, desks: string[], source: ListSource = "Brief") {
  const sub: Subscriber = {
    email: normalizeEmail(email),
    desks: parseDesks(desks),
    createdAt: new Date().toISOString(),
  };
  if (!validEmail(sub.email)) throw new Error("That is not an email.");
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
      await upsertAirtableSubscriber({ email: sub.email, desks: sub.desks, source });
      via = "airtable";
    } catch {
      via = "local";
    }
  }
  if (via !== "airtable") {
    try {
      if (await addResendContact(sub)) via = "resend";
    } catch {
      // keep via
    }
  }
  return {
    subscriber: sub,
    persisted: via !== "local" || Boolean(process.env.SUBSCRIBER_EMAILS),
    via,
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
        createdAt: s.joined || "airtable",
      }));
    } catch {
      airtable = [];
    }
  }
  for (const sub of [...envSubscribers(), ...airtable, ...(await listResendContacts()), ...(await readLocal())]) {
    const prev = byEmail.get(sub.email);
    byEmail.set(sub.email, {
      email: sub.email,
      desks: [...new Set([...(prev?.desks ?? []), ...sub.desks])],
      createdAt: prev?.createdAt ?? sub.createdAt,
    });
  }
  return [...byEmail.values()];
}

export function subscribersForDesk(list: Subscriber[], areaId: string) {
  return list.filter((s) => s.desks.includes(areaId)).map((s) => s.email);
}
