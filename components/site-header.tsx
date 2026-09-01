"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Waterline } from "@/components/viz/waterline";
import { JoinLink } from "@/components/join-link";
import { getArea, neighborArea } from "@/lib/data/areas";
import { PRODUCT_LINE, PRODUCT_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "This morning", dek: "Pick a water" },
  { href: "/calendar", label: "Best dry day", dek: "What’s left this month" },
  { href: "/compare", label: "Stay or drive", dek: "Two waters, one morning" },
  { href: "/map", label: "Your marks", dek: "Cream on the chart" },
  { href: "/morning", label: "The line", dek: "One sentence you can text" },
  { href: "/species", label: "The fish", dek: "Who is in play" },
  { href: "/method", label: "The score", dek: "How the 1–10 is built" },
  { href: "/newsletter", label: "Saturday", dek: "Only the coasts you asked for" },
  { href: "/fundamentals", label: "The season", dek: "What this month is for" },
  { href: "/book", label: "Your book", dek: "Write the fish" },
];

function activePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navHref(base: string, params: URLSearchParams) {
  if (base === "/" || base === "/newsletter" || base === "/species" || base === "/method") {
    return base;
  }
  const area = params.get("area") ?? params.get("a");
  const theater = params.get("theater");
  const activity = params.get("activity");
  const date = params.get("date");
  const q = new URLSearchParams();
  if (theater) q.set("theater", theater);
  if (activity) q.set("activity", activity);
  if (date) q.set("date", date);
  if (base === "/compare" && area) {
    q.set("a", area);
    q.set("b", neighborArea(getArea(area)).id);
    return `${base}?${q}`;
  }
  if (area && (base === "/calendar" || base === "/map" || base === "/morning" || base === "/fundamentals" || base === "/book")) {
    q.set("area", area);
  }
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}

export function SiteHeader() {
  return (
    <Suspense fallback={<HeaderBar links={LINKS.map((l) => ({ ...l, href: l.href }))} />}>
      <HeaderWithWater />
    </Suspense>
  );
}

function HeaderWithWater() {
  const params = useSearchParams();
  const links = LINKS.map((l) => ({ ...l, href: navHref(l.href, params) }));
  return <HeaderBar links={links} />;
}

function HeaderBar({ links }: { links: { href: string; label: string; dek: string }[] }) {
  const pathname = usePathname();
  const onJoin = activePath(pathname, "/join");

  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--line)] bg-[color:var(--ink)]/80 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
        <a href="/" className="flex min-w-0 items-baseline gap-2">
          <span className="wordmark text-[color:var(--cream)]">{PRODUCT_NAME}</span>
          <span className="geo-lockup hidden text-[color:var(--sea)] sm:inline">Seven coasts</span>
        </a>
        <nav className="hidden items-center gap-0.5 xl:flex">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className={cn(
                "nav-link cursor-pointer whitespace-nowrap rounded-md px-2 py-1.5 text-[color:var(--cream)]/75 transition hover:bg-[color:var(--cream)]/6 hover:text-[color:var(--cream)]",
                activePath(pathname, l.href.split("?")[0] ?? l.href) && "text-[color:var(--cream)]",
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <JoinLink on={onJoin} compact />
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className="touch-manipulation text-[color:var(--cream)] hover:bg-[color:var(--cream)]/8 xl:hidden"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(100%,22rem)] gap-0 border-[color:var(--line)] bg-[color:var(--ink)] text-[color:var(--cream)]"
            >
              <SheetHeader className="border-b border-[color:var(--line)] pb-3">
                <p className="kicker text-[color:var(--copper)]">
                  The coast
                </p>
                <SheetTitle className="font-heading text-2xl text-[color:var(--cream)]">
                  {PRODUCT_NAME}
                </SheetTitle>
                <SheetDescription className="text-[color:var(--cream)]/50">
                  {PRODUCT_LINE}
                </SheetDescription>
              </SheetHeader>
              <Waterline className="px-4" />
              <div className="px-4 pt-3">
                <JoinLink on={onJoin} className="w-full">
                  Get the morning
                </JoinLink>
              </div>
              <nav className="flex flex-1 flex-col overflow-y-auto px-2 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
                {links.map((l) => {
                  const on = activePath(pathname, l.href.split("?")[0] ?? l.href);
                  return (
                    <a
                      key={l.label}
                      href={l.href}
                      className={cn(
                        "touch-manipulation rounded-xl px-3 py-3.5",
                        on
                          ? "bg-[color:var(--sea)]/15 text-[color:var(--cream)]"
                          : "text-[color:var(--cream)]/80 active:bg-[color:var(--cream)]/6",
                      )}
                    >
                      <span className="block font-heading text-xl">{l.label}</span>
                      <span className="mt-0.5 block text-xs text-[color:var(--cream)]/45">{l.dek}</span>
                    </a>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
