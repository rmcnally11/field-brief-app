const AUDIENCE_NAME = "Field Brief";

let cachedAudienceId: string | null = null;

function resendKey() {
  return process.env.RESEND_API_KEY?.trim() || "";
}

async function resend<T>(path: string, init?: RequestInit): Promise<T | null> {
  const key = resendKey();
  if (!key) return null;
  const res = await fetch(`https://api.resend.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export async function resendAudienceId() {
  const fromEnv = process.env.RESEND_AUDIENCE_ID?.trim();
  if (fromEnv) return fromEnv;
  if (cachedAudienceId) return cachedAudienceId;
  if (!resendKey()) return "";
  const listed = await resend<{ data?: Array<{ id?: string; name?: string }> }>("/audiences");
  const found = listed?.data?.find((a) => a.name === AUDIENCE_NAME && a.id);
  if (found?.id) {
    cachedAudienceId = found.id;
    return found.id;
  }
  const created = await resend<{ id?: string }>("/audiences", {
    method: "POST",
    body: JSON.stringify({ name: AUDIENCE_NAME }),
  });
  cachedAudienceId = created?.id ?? "";
  return cachedAudienceId;
}

export function resendConfigured() {
  return Boolean(resendKey());
}
