"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function samePage(href: string) {
  try {
    const url = new URL(href, window.location.href);
    return (
      url.origin === window.location.origin &&
      url.pathname === window.location.pathname &&
      url.search === window.location.search
    );
  } catch {
    return true;
  }
}

export function NavBusy() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setBusy(false);
  }, [pathname, search]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const link = (event.target as HTMLElement | null)?.closest("a");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
      } catch {
        return;
      }
      if (samePage(href)) return;
      setBusy(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (!busy) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-[3px] overflow-hidden bg-[color:var(--copper)]/15"
      role="progressbar"
      aria-label="Loading the next page"
      aria-busy="true"
    >
      <div className="nav-busy-bar h-full w-1/3 rounded-full bg-[color:var(--copper)]" />
    </div>
  );
}
