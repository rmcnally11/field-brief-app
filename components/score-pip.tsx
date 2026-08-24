import { cn } from "@/lib/utils";

export function scoreColor(score: number) {
  if (score >= 8) return "bg-emerald-400 text-emerald-950";
  if (score >= 6.5) return "bg-teal-400 text-teal-950";
  if (score >= 5) return "bg-amber-300 text-amber-950";
  if (score >= 3.5) return "bg-orange-400 text-orange-950";
  return "bg-rose-400/90 text-rose-950";
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
