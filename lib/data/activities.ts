import type { ActivityId } from "@/lib/types";

export const ACTIVITIES: {
  id: ActivityId;
  label: string;
  short: string;
  blurb: string;
}[] = [
  {
    id: "fly",
    label: "Fly",
    short: "Fly",
    blurb: "Sight and presentation. Wind is the tax. Fly when the day allows it.",
  },
  {
    id: "spin",
    label: "Spinning",
    short: "Spin",
    blurb: "The honest tool when the wind or the depth does not allow the fly.",
  },
  {
    id: "wade",
    label: "Wade",
    short: "Wade",
    blurb: "Feet on the flat. Needs water you can stand in and a tide that does not strand you.",
  },
  {
    id: "skiff",
    label: "Skiff",
    short: "Skiff",
    blurb: "Pole the skinny, run the guts. Needs enough water to float and enough calm to see.",
  },
  {
    id: "kayak",
    label: "Kayak",
    short: "Kayak",
    blurb: "Quiet access. More wind-sensitive than a skiff. Good in pocket bays.",
  },
  {
    id: "structure",
    label: "Jetty / pier",
    short: "Rocks",
    blurb: "Granite, pilings, passes. Sheep, bulls, current. Midday is legal.",
  },
  {
    id: "offshore",
    label: "Offshore",
    short: "Offshore",
    blurb: "Trolling, the edge, and deep jigging. Weedlines, humps, and banks — not the grass flat.",
  },
];
