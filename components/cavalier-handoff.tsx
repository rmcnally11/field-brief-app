import { cavalierHref } from "@/lib/cavaliers";

export function CavalierHandoff({
  theater,
  compact = false,
}: {
  theater?: string | null;
  compact?: boolean;
}) {
  if (theater !== "texas") return null;
  return (
    <p
      data-testid="cavalier-handoff"
      className={
        compact
          ? "mt-2 text-xs text-[color:var(--cream)]/45"
          : "mt-4 text-sm text-[color:var(--cream)]/55"
      }
    >
      Bread at the slip before you leave —{" "}
      <a
        href={cavalierHref()}
        data-testid="cavalier-handoff-link"
        className="text-[color:var(--copper)] underline decoration-[color:var(--copper)]/40 underline-offset-2"
      >
        provisions on this water
      </a>
      .
    </p>
  );
}
