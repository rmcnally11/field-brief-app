import type { ReactNode } from "react";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Seasonal fundamentals — region, type, species",
  description:
    "When Texas, the Keys, and the Bahamas actually line up: fly or spin, sight or marsh, peak months and cited regs.",
  path: "/fundamentals",
});

export default function FundamentalsLayout({ children }: { children: ReactNode }) {
  return children;
}
