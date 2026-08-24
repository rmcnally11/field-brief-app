import Link from "next/link";

const LINKS = [
  { href: "/", label: "Brief" },
  { href: "/calendar", label: "Calendar" },
  { href: "/map", label: "Map" },
  { href: "/species", label: "Species" },
  { href: "/method", label: "Method" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-[color:var(--line)] bg-[color:var(--ink)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-heading text-lg tracking-tight text-[color:var(--cream)]">
            Field Brief
          </span>
          <span className="hidden text-[10px] uppercase tracking-[0.22em] text-[color:var(--copper)] sm:inline">
            Three theaters
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-2.5 py-1.5 text-[color:var(--cream)]/75 transition hover:bg-white/5 hover:text-[color:var(--cream)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
