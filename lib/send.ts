export async function sendResend(to: string[], subject: string, html: string, text: string) {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return { sent: false as const, id: null as string | null, why: "missing RESEND_API_KEY" };
  const from = process.env.RESEND_FROM?.trim() || "Field Brief <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });
  const json = (await res.json()) as { id?: string; message?: string };
  if (!res.ok) throw new Error(json.message ?? `Resend ${res.status}`);
  return { sent: true as const, id: json.id ?? null, why: null as string | null };
}
