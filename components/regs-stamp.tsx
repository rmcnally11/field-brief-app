import { daysUntilRollover, regsStamp } from "@/lib/regs";
import type { TheaterId } from "@/lib/types";

export function RegsStamp({ theater }: { theater: TheaterId }) {
  const stamp = regsStamp(theater);
  const days = daysUntilRollover(theater);
  return (
    <p className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)] px-4 py-3 text-xs leading-relaxed text-[color:var(--cream)]/60">
      <span className="uppercase tracking-[0.16em] text-[color:var(--copper)]">Regs cited</span>
      <span className="mt-1 block">
        <a className="underline decoration-[color:var(--copper)]/40" href={stamp.url}>
          {stamp.book}
        </a>
        {" · "}
        {stamp.span}
        {days >= 0 && days <= 45 ? ` · rolls in ${days} days` : null}
        {days < 0 ? " · book date has rolled — verify before you keep a fish" : null}
        . {stamp.note}
      </span>
    </p>
  );
}
