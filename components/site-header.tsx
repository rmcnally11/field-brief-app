"use client";

import { usePathname } from "next/navigation";
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
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Brief", dek: "Today’s water" },
  { href: "/calendar", label: "Calendar", dek: "Amazing days" },
  { href: "/compare", label: "Compare", dek: "Stay or drive" },
  { href: "/map", label: "Map", dek: "Marks and legal water" },
  { href: "/morning", label: "Morning", dek: "The one-line dispatch" },
  { href: "/species", label: "Species", dek: "Who is in play" },
  { href: "/method", label: "Method", dek: "How the score is built" },
  { href: "/newsletter", label: "Letter", dek: "Seven live desks" },
  { href: "/fundamentals", label: "Season", dek: "Month and coast" },
  { href: "/subscribers", label: "List", dek: "Who gets the 5am mail" },
];

function activePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--line)] bg-[color:var(--ink)]/80 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <a href="/" className="flex items-baseline gap-2">
          <span className="font-heading text-lg tracking-tight text-[color:var(--cream)]">
            Field Brief
          </span>
          <span className="hidden text-[10px] uppercase tracking-[0.22em] text-[color:var(--sea)] sm:inline">
            Seven theaters
          </span>
        </a>
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="cursor-pointer rounded-md px-2.5 py-1.5 text-[color:var(--cream)]/75 transition hover:bg-[color:var(--cream)]/6 hover:text-[color:var(--cream)]"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <Sheet>
          <SheetTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className="touch-manipulation text-[color:var(--cream)] hover:bg-[color:var(--cream)]/8 md:hidden"
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
              <p className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--copper)]">
                The coast
              </p>
              <SheetTitle className="font-heading text-2xl text-[color:var(--cream)]">
                Field Brief
              </SheetTitle>
              <SheetDescription className="text-[color:var(--cream)]/50">
                Seven theaters. Where, when, and why.
              </SheetDescription>
            </SheetHeader>
            <Waterline className="px-4" />
            <nav className="flex flex-1 flex-col overflow-y-auto px-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {LINKS.map((l) => {
                const on = activePath(pathname, l.href);
                return (
                  <a
                    key={l.href}
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
    </header>
  );
}
