import type { ReactNode } from "react";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { NavBusy } from "@/components/nav-busy";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <NavBusy />
      </Suspense>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6">{children}</main>
      <footer className="border-t border-[color:var(--line)] px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-xs text-[color:var(--cream)]/40">
        On This Water is a conditions instrument, not a guarantee and not a chart for navigation.
        Verify TPWD, FWC, Bahamas, FKNMS, and NPS rules before you fish. Tight lines.
      </footer>
    </>
  );
}
