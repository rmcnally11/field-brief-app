import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { GATE_PATH, hasGateCookie } from "@/lib/gate";

export default async function SubscribersLayout({ children }: { children: ReactNode }) {
  if (!(await hasGateCookie())) redirect(GATE_PATH);
  return children;
}
