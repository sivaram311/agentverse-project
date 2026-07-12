import type { PersonaId, UiLanguage } from "./types";

export type VoicePrefs = {
  lang?: string;
  rate?: number;
  pitch?: number;
};

const LANG_MAP: Record<UiLanguage, string> = {
  ta: "ta-IN",
  hi: "hi-IN",
  en: "en-IN",
};

/** Resolve BCP-47 voice locale from UI language preference. */
export function voiceLangFor(ui: UiLanguage, prefs?: VoicePrefs): string {
  return prefs?.lang ?? LANG_MAP[ui] ?? "en-IN";
}

/** Speak a line with UI language + optional persona voice prefs. */
export function speakPersona(
  _id: PersonaId,
  text: string,
  prefs?: VoicePrefs,
  uiLang: UiLanguage = "ta",
): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const lang = voiceLangFor(uiLang, prefs);
  utter.lang = lang;
  utter.rate = prefs?.rate ?? 1;
  utter.pitch = prefs?.pitch ?? 1;

  const voices = window.speechSynthesis.getVoices();
  const prefix = lang.slice(0, 2).toLowerCase();
  const preferred =
    voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith(prefix) &&
        /india|in-|tamil|hindi/i.test(`${v.lang} ${v.name}`),
    ) ?? voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
  if (preferred) utter.voice = preferred;

  window.speechSynthesis.speak(utter);
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}
