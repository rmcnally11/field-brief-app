import type { ReactNode } from "react";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Saturday on your water",
  description:
    "Saturday on the coasts you asked for — Galveston, Venice, Islamorada, Andros, Ascension, San Juan, Alphonse. A Texas list does not carry Seychelles.",
  path: "/newsletter",
});

export default function NewsletterLayout({ children }: { children: ReactNode }) {
  return children;
}
