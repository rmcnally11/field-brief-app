import { fuelHref } from "@/lib/dock-posted";

export function DockPostedHandoff({
  theater,
  areaId,
  compact = false,
}: {
  theater?: string | null;
  areaId?: string | null;
  compact?: boolean;
}) {
  const next = fuelHref({ theater, areaId });
  return (
    <p
      data-testid="dock-posted-handoff"
      className={
        compact
          ? "mt-2 text-xs text-[color:var(--cream)]/45"
          : "mt-4 text-sm text-[color:var(--cream)]/55"
      }
    >
      Posted fuel on this coast —{" "}
      <a
        href={next.href}
        data-testid="dock-posted-handoff-link"
        className="text-[color:var(--copper)] underline decoration-[color:var(--copper)]/40 underline-offset-2"
      >
        {next.label}
      </a>
      . Tide and wind live here.
    </p>
  );
}
