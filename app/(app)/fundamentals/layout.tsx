import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seasonal fundamentals — region, type, species",
  description:
    "When Texas, the Keys, and the Bahamas actually line up: fly or spin, sight or marsh, peak months and cited regs.",
};

export default function FundamentalsLayout({ children }: { children: ReactNode }) {
  return children;
}
