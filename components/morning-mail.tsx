"use client";

import { useState } from "react";
import { DESKS, deskChoiceLabel } from "@/lib/desks";
import { CADENCE_META, letterDeskForArea, type Cadence } from "@/lib/coasts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MorningMail({
  defaultDesk,
  defaultDesks,
  compact = false,
  join = false,
  source = "Brief",
}: {
  defaultDesk?: string;
  defaultDesks?: string[];
  compact?: boolean;
  join?: boolean;
  source?: "Brief" | "Letter" | "Morning";
}) {
  const homeDesk = letterDeskForArea(defaultDesk) ?? "galveston";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [zip, setZip] = useState("");
  const [desks, setDesks] = useState<string[]>(defaultDesks?.length ? defaultDesks : [homeDesk]);
  const [cadence, setCadence] = useState<Cadence[]>(["daily", "weekly", "calendar", "seasonal"]);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [note, setNote] = useState<string | null>(null);

  function toggleDesk(id: string) {
    setDesks((cur) => (cur.includes(id) ? cur.filter((d) => d !== id) : [...cur, id]));
  }

  function toggleCadence(id: Cadence) {
    setCadence((cur) => (cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setNote(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, zip, desks, cadence, source }),
      });
      const json = (await res.json()) as { error?: string; note?: string };
      if (!res.ok) {
        setStatus("err");
        setNote(json.error ?? "Could not subscribe.");
        return;
      }
      setStatus("ok");
      setNote(json.note ?? "You are on the list for the water you picked.");
      setName("");
      setEmail("");
      setZip("");
    } catch {
      setStatus("err");
      setNote("The list did not answer.");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className={
        compact
          ? "rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)] p-4"
          : "rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)] p-5"
      }
    >
      <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--copper)]">The list</p>
      <h2 className={`mt-1 font-heading text-[color:var(--cream)] ${compact ? "text-xl" : "text-2xl"}`}>
        {join ? "Who you are, and which water" : "Get the water you fish"}
      </h2>
      <p className="mt-2 text-sm text-[color:var(--cream)]/65">
        {join
          ? "Texas is selected. Change it if you fish somewhere else. Leave every mail on unless you do not want it. Name and home ZIP stay on the list with the address."
          : "Name and home ZIP first, then the coasts you actually fish. A Texas-only list does not get Andros or Seychelles — not in the 5am line, not in Saturday’s letter, not in Sunday’s calendar."}
      </p>
      <div className={`mt-4 grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
        <div className="space-y-2">
          <Label htmlFor="join-name" className="text-[color:var(--cream)]/70">
            Name you go by
          </Label>
          <Input
            id="join-name"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Robert McNally"
            className="h-10 border-[color:var(--line)] bg-[color:var(--ink)] text-[color:var(--cream)]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="join-zip" className="text-[color:var(--cream)]/70">
            Home ZIP or postal code
          </Label>
          <Input
            id="join-zip"
            name="postal-code"
            autoComplete="postal-code"
            required
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="77550"
            className="h-10 border-[color:var(--line)] bg-[color:var(--ink)] text-[color:var(--cream)]"
          />
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <Label htmlFor="join-email" className="text-[color:var(--cream)]/70">
          Email the brief should reach
        </Label>
        <Input
          id="join-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@boat.com"
          className="h-10 border-[color:var(--line)] bg-[color:var(--ink)] text-[color:var(--cream)]"
        />
      </div>
      <fieldset className="mt-5">
        <legend className="text-xs uppercase tracking-[0.14em] text-[color:var(--cream)]/45">
          Water you want mail for
        </legend>
        <p className="mt-1 text-xs text-[color:var(--cream)]/50">
          One desk per coast. Pick every coast you fish. Leave the rest off.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {DESKS.map((d) => {
            const on = desks.includes(d.areaId);
            return (
              <label
                key={d.areaId}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs ${
                  on
                    ? "border-[color:var(--copper)] bg-[color:var(--copper)]/15 text-[color:var(--cream)]"
                    : "border-[color:var(--line)] text-[color:var(--cream)]/55"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={on}
                  onChange={() => toggleDesk(d.areaId)}
                />
                {deskChoiceLabel(d)}
              </label>
            );
          })}
        </div>
      </fieldset>
      <fieldset className="mt-5">
        <legend className="text-xs uppercase tracking-[0.14em] text-[color:var(--cream)]/45">
          What you want in the inbox
        </legend>
        <p className="mt-1 text-xs text-[color:var(--cream)]/50">
          All four stay on unless you turn one off. Each is a different letter, not a louder copy of the same one.
        </p>
        <div className="mt-3 space-y-2">
          {CADENCE_META.map((c) => {
            const on = cadence.includes(c.id);
            return (
              <label
                key={c.id}
                className={`flex cursor-pointer gap-3 rounded-2xl border px-3 py-3 ${
                  on
                    ? "border-[color:var(--sea)] bg-[color:var(--sea)]/10"
                    : "border-[color:var(--line)]"
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-1 size-4 shrink-0 accent-[color:var(--sea)]"
                  checked={on}
                  onChange={() => toggleCadence(c.id)}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-[color:var(--cream)]">{c.title}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-[color:var(--cream)]/55">
                    {c.blurb}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <Button
        type="submit"
        disabled={status === "loading" || desks.length === 0 || cadence.length === 0}
        className="mt-5 bg-[color:var(--sea)] text-white hover:bg-[color:var(--sea)]/90"
      >
        {status === "loading" ? "Saving…" : join ? "Send tonight’s brief" : "Join the list"}
      </Button>
      {note ? (
        <p className={`mt-3 text-sm ${status === "err" ? "text-[color:var(--copper)]" : "text-[color:var(--cream)]/70"}`} role="status">
          {note}
        </p>
      ) : null}
    </form>
  );
}
