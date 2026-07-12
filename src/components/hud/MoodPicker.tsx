"use client";

import { useVerseStore, type OfficeMood } from "@/lib/store";

const LABELS: Record<OfficeMood, string> = {
  morning: "Morning",
  day: "Day",
  evening: "Evening",
};

/** Cycles cooler morning → day → warmer evening office LEDs. */
export function MoodPicker() {
  const mood = useVerseStore((s) => s.officeMood);
  const cycle = useVerseStore((s) => s.cycleOfficeMood);

  return (
    <button
      type="button"
      className="mood-picker"
      onClick={cycle}
      title="Cycle office lighting"
      aria-label={`Office lighting: ${LABELS[mood]}. Click to change.`}
    >
      <span className={`mood-dot mood-${mood}`} aria-hidden />
      {LABELS[mood]}
    </button>
  );
}
