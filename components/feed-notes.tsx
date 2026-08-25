import type { Area, Conditions } from "@/lib/types";
import { feedNotes, type FeedState } from "@/lib/feeds";

const TONE: Record<FeedState, string> = {
  live: "border-[color:var(--line)] text-[color:var(--cream)]/70",
  modeled: "border-amber-700/40 text-amber-900",
  quiet: "border-amber-700/40 text-amber-900",
  none: "border-[color:var(--line)] text-[color:var(--cream)]/45",
};

export function FeedNotes({ area, conditions }: { area: Area; conditions: Conditions }) {
  const notes = feedNotes(area, conditions);
  return (
    <ul className="flex flex-wrap gap-1.5">
      {notes.map((note) => (
        <li
          key={note.id}
          className={`rounded-full border px-2.5 py-1 text-[11px] leading-none ${TONE[note.state]}`}
        >
          {note.label}
        </li>
      ))}
    </ul>
  );
}
