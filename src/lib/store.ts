"use client";

import { create } from "zustand";
import type { AuthConfig, Message, PersonaId, Quest, Session } from "./types";

type VerseState = {
  authConfig: AuthConfig | null;
  authenticated: boolean;
  username: string | null;
  accessToken: string | null;
  apiOnline: boolean;
  selectedPersona: PersonaId;
  session: Session | null;
  messages: Message[];
  quests: Quest[];
  busy: boolean;
  error: string | null;
  streamingHint: string | null;
  setAuthConfig: (c: AuthConfig | null) => void;
  setAuthenticated: (v: boolean, username?: string | null) => void;
  setAccessToken: (token: string | null) => void;
  setApiOnline: (v: boolean) => void;
  selectPersona: (id: PersonaId) => void;
  setSession: (s: Session | null) => void;
  setMessages: (m: Message[]) => void;
  appendMessage: (m: Message) => void;
  upsertMessage: (m: Message, appendContent?: boolean) => void;
  addQuest: (q: Quest) => void;
  updateQuest: (id: string, patch: Partial<Quest>) => void;
  setBusy: (v: boolean) => void;
  setError: (e: string | null) => void;
  setStreamingHint: (h: string | null) => void;
};

export const useVerseStore = create<VerseState>((set) => ({
  authConfig: null,
  authenticated: false,
  username: null,
  accessToken: null,
  apiOnline: false,
  selectedPersona: "rajveer",
  session: null,
  messages: [],
  quests: [],
  busy: false,
  error: null,
  streamingHint: null,
  setAuthConfig: (c) => set({ authConfig: c }),
  setAuthenticated: (v, username = null) => set({ authenticated: v, username }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setApiOnline: (v) => set({ apiOnline: v }),
  selectPersona: (id) => set({ selectedPersona: id }),
  setSession: (s) => set({ session: s }),
  setMessages: (m) => set({ messages: m }),
  appendMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  upsertMessage: (m, appendContent = false) =>
    set((s) => {
      const index = s.messages.findIndex((existing) => existing.id === m.id);
      if (index === -1) return { messages: [...s.messages, m] };

      const messages = [...s.messages];
      const previous = messages[index];
      messages[index] = {
        ...previous,
        ...m,
        content: appendContent ? `${previous.content}${m.content}` : m.content,
      };
      return { messages };
    }),
  addQuest: (q) => set((s) => ({ quests: [q, ...s.quests].slice(0, 12) })),
  updateQuest: (id, patch) =>
    set((s) => ({
      quests: s.quests.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    })),
  setBusy: (v) => set({ busy: v }),
  setError: (e) => set({ error: e }),
  setStreamingHint: (h) => set({ streamingHint: h }),
}));
