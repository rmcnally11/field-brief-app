"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyLine({ text, label = "Copy the morning line" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="touch-manipulation border-[color:var(--line)] text-[color:var(--cream)]"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? "Copied" : label}
      </Button>
      <a
        className="text-xs text-[color:var(--sea)] underline decoration-[color:var(--sea)]/40"
        href={`mailto:?subject=On This Water&body=${encodeURIComponent(text)}`}
      >
        Mail it
      </a>
    </div>
  );
}
