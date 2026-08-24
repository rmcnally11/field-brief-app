import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Field Letter — weekly inshore desks",
  description:
    "A weekly letter from three live desks: Galveston, Islamorada, and Andros. Peaks, closures, and the week’s water.",
};

export default function NewsletterLayout({ children }: { children: ReactNode }) {
  return children;
}
