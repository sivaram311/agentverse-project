"use client";

import { useVerseStore } from "@/lib/store";
import type { VoiceGenderPref } from "@/lib/speech";

const OPTIONS: { id: VoiceGenderPref; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "male", label: "♂" },
  { id: "female", label: "♀" },
];

export function VoicePicker() {
  const voiceGender = useVerseStore((s) => s.voiceGender);
  const setVoiceGender = useVerseStore((s) => s.setVoiceGender);

  return (
    <div className="voice-picker" role="group" aria-label="Voice">
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          className={voiceGender === o.id ? "on" : undefined}
          title={
            o.id === "auto"
              ? "Match agent gender"
              : o.id === "male"
                ? "Male voice"
                : "Female voice"
          }
          onClick={() => setVoiceGender(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
