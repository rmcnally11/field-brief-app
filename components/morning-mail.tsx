"use client";

import { useState } from "react";
import { DESKS } from "@/lib/desks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MorningMail({
  defaultDesk,
  compact = false,
}: {
  defaultDesk?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [desks, setDesks] = useState<string[]>(defaultDesk ? [defaultDesk] : DESKS.map((d) => d.areaId));
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [note, setNote] = useState<string | null>(null);

  function toggle(id: string) {
    setDesks((cur) => (cur.includes(id) ? cur.filter((d) => d !== id) : [...cur, id]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setNote(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, desks }),
      });
      const json = (await res.json()) as { error?: string; note?: string };
      if (!res.ok) {
        setStatus("err");
        setNote(json.error ?? "Could not subscribe.");
        return;
      }
      setStatus("ok");
      setNote(json.note ?? "You are on the 5am list.");
      setEmail("");
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
      <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--copper)]">5am mail</p>
      <h2 className={`mt-1 font-heading text-[color:var(--cream)] ${compact ? "text-xl" : "text-2xl"}`}>
        One line when the coast wakes up
      </h2>
      <p className="mt-2 text-sm text-[color:var(--cream)]/65">
        Same morning line as the brief. Generated live from the gauges at send time — not a 2am batch.
        No SMS on Hobby.
      </p>
      <div className="mt-4 space-y-2">
        <Label htmlFor="morning-email" className="text-[color:var(--cream)]/70">
          Email
        </Label>
        <Input
          id="morning-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@boat.com"
          className="h-10 border-[color:var(--line)] bg-[color:var(--ink)] text-[color:var(--cream)]"
        />
      </div>
      <fieldset className="mt-4">
        <legend className="text-xs uppercase tracking-[0.14em] text-[color:var(--cream)]/45">Desks</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {DESKS.map((d) => {
            const on = desks.includes(d.areaId);
            return (
              <label
                key={d.areaId}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${
                  on
                    ? "border-[color:var(--copper)] bg-[color:var(--copper)]/15 text-[color:var(--cream)]"
                    : "border-[color:var(--line)] text-[color:var(--cream)]/55"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={on}
                  onChange={() => toggle(d.areaId)}
                />
                {d.desk.replace(" desk", "")}
              </label>
            );
          })}
        </div>
      </fieldset>
      <Button
        type="submit"
        disabled={status === "loading" || desks.length === 0}
        className="mt-4 bg-[color:var(--sea)] text-white hover:bg-[color:var(--sea)]/90"
      >
        {status === "loading" ? "Saving…" : "Send it at 5am"}
      </Button>
      {note ? (
        <p className={`mt-3 text-sm ${status === "err" ? "text-[color:var(--copper)]" : "text-[color:var(--cream)]/70"}`} role="status">
          {note}
        </p>
      ) : null}
    </form>
  );
}
