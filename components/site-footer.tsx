import { DOCK_POSTED } from "@/lib/dock-posted";

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--line)] px-4 py-8 pb-[max(1.75rem,env(safe-area-inset-bottom))] text-center">
      <p className="text-sm text-[color:var(--cream)]/70">
        Want the 5am line in the inbox?{" "}
        <a
          href="/join"
          className="font-medium text-[color:var(--copper)] underline decoration-[color:var(--copper)]/40 underline-offset-2"
        >
          Join the list
        </a>
        .
      </p>
      <p className="mt-3 text-xs text-[color:var(--cream)]/40">
        Posted fuel on the same coast —{" "}
        <a
          href={DOCK_POSTED}
          className="font-medium text-[color:var(--copper)] underline decoration-[color:var(--copper)]/40 underline-offset-2"
        >
          Dock Posted
        </a>
        . Tide and wind live here.
      </p>
      <p className="mt-3 text-xs text-[color:var(--cream)]/40">
        On This Water is a conditions instrument, not a guarantee and not a chart for navigation.
        Verify TPWD, FWC, Bahamas, FKNMS, and NPS rules before you fish. The book is yours, on this
        phone. Tight lines.
      </p>
    </footer>
  );
}
