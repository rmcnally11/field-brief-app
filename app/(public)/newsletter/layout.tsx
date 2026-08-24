import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Field Letter — weekly desks",
  description:
    "A weekly letter from seven live desks: Galveston, Venice, Islamorada, Andros, Ascension, San Juan, and Alphonse. Peaks, closures, and the week’s water.",
};

export default function NewsletterLayout({ children }: { children: ReactNode }) {
  return children;
}
