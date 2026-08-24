const LINKS = [
  { href: "/", label: "Brief" },
  { href: "/calendar", label: "Calendar" },
  { href: "/map", label: "Map" },
  { href: "/species", label: "Species" },
  { href: "/method", label: "Method" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--line)] bg-[color:var(--ink)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <a href="/" className="flex items-baseline gap-2">
          <span className="font-heading text-lg tracking-tight text-[color:var(--cream)]">
            Field Brief
          </span>
          <span className="hidden text-[10px] uppercase tracking-[0.22em] text-[color:var(--copper)] sm:inline">
            Three theaters
          </span>
        </a>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="cursor-pointer rounded-md px-2.5 py-1.5 text-[color:var(--cream)]/75 transition hover:bg-white/5 hover:text-[color:var(--cream)]"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
