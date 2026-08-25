"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyLine({
  text,
  url,
  label = "Copy the morning line",
}: {
  text: string;
  url?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const payload = url ? `${text}\n${url}` : text;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "On This Water", text, url });
      } else {
        await navigator.clipboard.writeText(payload);
      }
      setShared(true);
      setTimeout(() => setShared(false), 1600);
    } catch {
      try {
        await navigator.clipboard.writeText(payload);
        setShared(true);
        setTimeout(() => setShared(false), 1600);
      } catch {
        setShared(false);
      }
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="touch-manipulation border-[color:var(--line)] text-[color:var(--cream)]"
        onClick={copy}
      >
        {copied ? "Copied" : label}
      </Button>
      {url ? (
        <Button
          type="button"
          size="sm"
          className="touch-manipulation bg-[color:var(--sea)] text-white hover:bg-[color:var(--sea)]/90"
          onClick={share}
        >
          {shared ? "Shared" : "Share"}
        </Button>
      ) : (
        <a
          className="text-xs text-[color:var(--sea)] underline decoration-[color:var(--sea)]/40"
          href={`mailto:?subject=On This Water&body=${encodeURIComponent(text)}`}
        >
          Mail it
        </a>
      )}
    </div>
  );
}
