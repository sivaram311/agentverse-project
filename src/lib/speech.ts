import type { PersonaId, UiLanguage } from "./types";

export type VoicePrefs = {
  lang?: string;
  rate?: number;
  pitch?: number;
};

export type VoiceGenderPref = "auto" | "male" | "female";

const LANG_MAP: Record<UiLanguage, string> = {
  ta: "ta-IN",
  hi: "hi-IN",
  en: "en-IN",
};

export function voiceLangFor(ui: UiLanguage, prefs?: VoicePrefs): string {
  return prefs?.lang ?? LANG_MAP[ui] ?? "en-IN";
}

function pickVoice(
  voices: SpeechSynthesisVoice[],
  lang: string,
  gender: "male" | "female",
): SpeechSynthesisVoice | undefined {
  const prefix = lang.slice(0, 2).toLowerCase();
  const localeMatches = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(prefix),
  );
  const pool = localeMatches.length ? localeMatches : voices;

  const femaleRe = /female|woman|zira|susan|heera|veena|priya|kalpana|google.uk.english.female|samantha|karen|moira/i;
  const maleRe = /male|man|david|ravi|mark|google.uk.english.male|daniel|fred|alex/i;

  if (gender === "female") {
    return (
      pool.find((v) => femaleRe.test(v.name)) ??
      pool.find((v) => /india|in-|tamil|hindi/i.test(`${v.lang} ${v.name}`)) ??
      pool[0]
    );
  }
  return (
    pool.find((v) => maleRe.test(v.name)) ??
    pool.find((v) => /india|in-|tamil|hindi/i.test(`${v.lang} ${v.name}`)) ??
    pool[0]
  );
}

/** Speak with UI language + male/female voice selection. */
export function speakPersona(
  _id: PersonaId,
  text: string,
  prefs?: VoicePrefs,
  uiLang: UiLanguage = "ta",
  voiceGender: VoiceGenderPref = "auto",
  personaGender: "male" | "female" = "male",
): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const lang = voiceLangFor(uiLang, prefs);
  utter.lang = lang;
  utter.rate = prefs?.rate ?? 1;
  const gender = voiceGender === "auto" ? personaGender : voiceGender;
  // Nudge pitch if OS has no gendered voice
  utter.pitch = prefs?.pitch ?? (gender === "female" ? 1.15 : 0.92);

  const voices = window.speechSynthesis.getVoices();
  const preferred = pickVoice(voices, lang, gender);
  if (preferred) utter.voice = preferred;

  window.speechSynthesis.speak(utter);
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}
