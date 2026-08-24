import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { GATE_PATH, hasGateCookie } from "@/lib/gate";

export default async function GatedLayout({ children }: { children: ReactNode }) {
  if (!(await hasGateCookie())) redirect(GATE_PATH);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6">{children}</main>
      <footer className="border-t border-[color:var(--line)] px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-xs text-[color:var(--cream)]/40">
        Field Brief is a conditions instrument, not a guarantee and not a chart for navigation.
        Verify TPWD, FWC, Bahamas, FKNMS, and NPS rules before you fish. Tight lines.
      </footer>
    </>
  );
}
