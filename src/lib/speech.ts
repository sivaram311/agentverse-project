import type { PersonaId } from "./types";

export type VoicePrefs = {
  lang?: string;
  rate?: number;
  pitch?: number;
};

/** Speak a line with optional persona voice prefs. No-ops when speechSynthesis missing. */
export function speakPersona(
  _id: PersonaId,
  text: string,
  prefs?: VoicePrefs,
): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = prefs?.lang ?? "en-IN";
  utter.rate = prefs?.rate ?? 1;
  utter.pitch = prefs?.pitch ?? 1;

  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith((prefs?.lang ?? "en-IN").toLowerCase().slice(0, 2)) &&
        /india|en-in/i.test(v.lang + v.name),
    ) ??
    voices.find((v) =>
      v.lang.toLowerCase().startsWith((prefs?.lang ?? "en-IN").toLowerCase().slice(0, 2)),
    );
  if (preferred) utter.voice = preferred;

  window.speechSynthesis.speak(utter);
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}
