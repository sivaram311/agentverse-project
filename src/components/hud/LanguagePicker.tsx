"use client";

import { useVerseStore } from "@/lib/store";
import type { UiLanguage } from "@/lib/types";

const OPTIONS: { id: UiLanguage; label: string }[] = [
  { id: "ta", label: "தமிழ்" },
  { id: "hi", label: "हिंदी" },
  { id: "en", label: "EN" },
];

export function LanguagePicker() {
  const language = useVerseStore((s) => s.language);
  const setLanguage = useVerseStore((s) => s.setLanguage);

  return (
    <div className="lang-picker" role="group" aria-label="Language">
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          className={language === o.id ? "on" : undefined}
          onClick={() => setLanguage(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
