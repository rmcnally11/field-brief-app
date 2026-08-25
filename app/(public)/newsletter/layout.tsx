import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Saturday Letter — weekly desks",
  description:
    "A weekly letter from the desks you elect — Galveston, Venice, Islamorada, Andros, Ascension, San Juan, Alphonse. A Texas list does not carry Seychelles.",
};

export default function NewsletterLayout({ children }: { children: ReactNode }) {
  return children;
}
