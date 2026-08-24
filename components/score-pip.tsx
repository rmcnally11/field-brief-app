import { cn } from "@/lib/utils";

export function scoreColor(score: number) {
  if (score >= 8) return "bg-teal-300 text-teal-950";
  if (score >= 6.5) return "bg-[color:var(--sea)] text-white";
  if (score >= 5) return "bg-[color:var(--gold)] text-slate-950";
  if (score >= 3.5) return "bg-[color:var(--coral)] text-white";
  return "bg-[color:var(--copper)] text-white";
}

export function ScorePip({ score, className }: { score: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-10 items-center justify-center rounded-md px-2 py-0.5 font-mono text-sm font-semibold",
        scoreColor(score),
        className,
      )}
    >
      {score.toFixed(1)}
    </span>
  );
}
