"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthConfig, Message, PersonaId, Quest, Session } from "./types";

export type InteractionMode =
  | "idle"
  | "approaching"
  | "greeting"
  | "talking"
  | "returning";

export type InteractionState = {
  mode: InteractionMode;
  focusId: PersonaId | null;
};

type VerseState = {
  authConfig: AuthConfig | null;
  authenticated: boolean;
  username: string | null;
  accessToken: string | null;
  apiOnline: boolean;
  selectedPersona: PersonaId;
  session: Session | null;
  persistedSessionId: string | null;
  workspacePath: string;
  recentWorkspaces: string[];
  messages: Message[];
  quests: Quest[];
  busy: boolean;
  error: string | null;
  streamingHint: string | null;
  interaction: InteractionState;
  greetOnce: Partial<Record<PersonaId, boolean>>;
  subtitle: string | null;
  orbitLocked: boolean;
  chatFocusNonce: number;
  setAuthConfig: (c: AuthConfig | null) => void;
  setAuthenticated: (v: boolean, username?: string | null) => void;
  setAccessToken: (token: string | null) => void;
  setApiOnline: (v: boolean) => void;
  selectPersona: (id: PersonaId) => void;
  summonPersona: (id: PersonaId) => void;
  setSession: (s: Session | null) => void;
  setWorkspacePath: (path: string) => void;
  rememberWorkspace: (path: string) => void;
  setMessages: (m: Message[]) => void;
  appendMessage: (m: Message) => void;
  upsertMessage: (m: Message, appendContent?: boolean) => void;
  addQuest: (q: Quest) => void;
  updateQuest: (id: string, patch: Partial<Quest>) => void;
  setBusy: (v: boolean) => void;
  setError: (e: string | null) => void;
  setStreamingHint: (h: string | null) => void;
  setInteraction: (patch: Partial<InteractionState>) => void;
  markGreeted: (id: PersonaId) => void;
  setSubtitle: (text: string | null) => void;
  setOrbitLocked: (v: boolean) => void;
  bumpChatFocus: () => void;
};

const DEFAULT_WORKSPACE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE) ||
  "demo";

export const useVerseStore = create<VerseState>()(
  persist(
    (set, get) => ({
      authConfig: null,
      authenticated: false,
      username: null,
      accessToken: null,
      apiOnline: false,
      selectedPersona: "rajveer",
      session: null,
      persistedSessionId: null,
      workspacePath: DEFAULT_WORKSPACE,
      recentWorkspaces: [DEFAULT_WORKSPACE],
      messages: [],
      quests: [],
      busy: false,
      error: null,
      streamingHint: null,
      interaction: { mode: "idle", focusId: null },
      greetOnce: {},
      subtitle: null,
      orbitLocked: false,
      chatFocusNonce: 0,
      setAuthConfig: (c) => set({ authConfig: c }),
      setAuthenticated: (v, username = null) => set({ authenticated: v, username }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setApiOnline: (v) => set({ apiOnline: v }),
      selectPersona: (id) => set({ selectedPersona: id }),
      summonPersona: (id) => {
        const prev = get().interaction.focusId;
        if (prev && prev !== id) {
          set({
            selectedPersona: id,
            interaction: { mode: "approaching", focusId: id },
            orbitLocked: true,
            subtitle: null,
          });
          return;
        }
        set({
          selectedPersona: id,
          interaction: { mode: "approaching", focusId: id },
          orbitLocked: true,
        });
      },
      setSession: (s) =>
        set({
          session: s,
          persistedSessionId: s?.id ?? null,
          workspacePath: s?.workspacePath || get().workspacePath,
        }),
      setWorkspacePath: (path) => set({ workspacePath: path }),
      rememberWorkspace: (path) => {
        const trimmed = path.trim();
        if (!trimmed) return;
        const recent = [
          trimmed,
          ...get().recentWorkspaces.filter((p) => p !== trimmed),
        ].slice(0, 8);
        set({ workspacePath: trimmed, recentWorkspaces: recent });
      },
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
      setInteraction: (patch) =>
        set((s) => ({ interaction: { ...s.interaction, ...patch } })),
      markGreeted: (id) =>
        set((s) => ({ greetOnce: { ...s.greetOnce, [id]: true } })),
      setSubtitle: (text) => set({ subtitle: text }),
      setOrbitLocked: (v) => set({ orbitLocked: v }),
      bumpChatFocus: () => set((s) => ({ chatFocusNonce: s.chatFocusNonce + 1 })),
    }),
    {
      name: "agentverse-verse",
      partialize: (s) => ({
        selectedPersona: s.selectedPersona,
        persistedSessionId: s.persistedSessionId ?? s.session?.id ?? null,
        workspacePath: s.workspacePath,
        recentWorkspaces: s.recentWorkspaces,
        quests: s.quests,
        greetOnce: s.greetOnce,
      }),
    },
  ),
);
