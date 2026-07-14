"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getPersona,
  nextClusterOffset,
  orchestratorId,
  projectColor,
} from "./orchestrator";
import type {
  AgentRuntimeState,
  AuthConfig,
  Message,
  OfficeProject,
  PersonaId,
  Quest,
  Session,
  SessionTab,
  UiLanguage,
} from "./types";
import type { VoiceGenderPref } from "./speech";

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

/** Cooler morning → neutral day → warmer evening LEDs */
export type OfficeMood = "morning" | "day" | "evening";

const OFFICE_MOODS: OfficeMood[] = ["morning", "day", "evening"];

const DEFAULT_WORKSPACE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE) ||
  "demo";

const HUB_PROJECT: OfficeProject = {
  id: "hub",
  name: "Office Hub",
  idea: "Main AgentVerse digital office",
  color: "#E8A838",
  clusterOffset: [0, 0, 0],
  managerId: "rajesh",
  crewIds: [
    "rajesh",
    "karthik",
    "lavanya",
    "aravind",
    "mathura",
    "muthu",
    "kabilan",
  ],
  createdAt: 0,
};

function defaultAgentStates(): Record<PersonaId, AgentRuntimeState> {
  const ids: PersonaId[] = [
    "rajesh",
    "karthik",
    "lavanya",
    "aravind",
    "mathura",
    "muthu",
    "kabilan",
  ];
  return Object.fromEntries(
    ids.map((id) => [
      id,
      {
        pose: "sitting" as const,
        status: "At desk",
        progress: 0,
        projectId: "hub",
        working: true,
      },
    ]),
  ) as Record<PersonaId, AgentRuntimeState>;
}

type VerseState = {
  authConfig: AuthConfig | null;
  authenticated: boolean;
  username: string | null;
  accessToken: string | null;
  apiOnline: boolean;
  language: UiLanguage;
  voiceGender: VoiceGenderPref;
  selectedPersona: PersonaId;
  session: Session | null;
  persistedSessionId: string | null;
  workspacePath: string;
  recentWorkspaces: string[];
  /** workspacePath → portal session id */
  sessionsByPath: Record<string, string>;
  sessionTabs: SessionTab[];
  activeTabSessionId: string | null;
  projects: OfficeProject[];
  activeProjectId: string;
  agentStates: Record<PersonaId, AgentRuntimeState>;
  messages: Message[];
  quests: Quest[];
  busy: boolean;
  error: string | null;
  streamingHint: string | null;
  interaction: InteractionState;
  greetOnce: Partial<Record<PersonaId, boolean>>;
  subtitle: string | null;
  orbitLocked: boolean;
  /** firstPerson = eye-level walk+look; overview = framed orbit shots */
  cameraMode: "firstPerson" | "overview";
  /** Framed orbit angle when overview (default head & shoulders) */
  orbitShot: import("@/lib/camera-framing").OrbitShot;
  chatFocusNonce: number;
  composeDraft: string;
  /** Full top chrome (lang, API, share, projects) — off by default for immersion */
  officeChromeOpen: boolean;
  /** Talk-to panel — opens on persona/desk tap or comms dock */
  chatOpen: boolean;
  /** Safe `return` from deep-link (allowlisted host). */
  returnUrl: string | null;
  /** Incident / hire brief from ProdDeck deep-link. */
  incidentBrief: string | null;
  incidentEvidence: string | null;
  incidentDismissed: boolean;
  /** True when `src=proddeck` even if brief empty. */
  incidentFromProdDeck: boolean;
  /** Bump to open Session Desk from deep-link. */
  sessionDeskRequestNonce: number;
  /** Tunable office lighting mood */
  officeMood: OfficeMood;
  /** Logged-in visitor on the floor */
  playerPosition: [number, number, number];
  /** WASD / joystick stick (−1..1) */
  playerMoveInput: { x: number; z: number };
  setAuthConfig: (c: AuthConfig | null) => void;
  setAuthenticated: (v: boolean, username?: string | null) => void;
  setAccessToken: (token: string | null) => void;
  setApiOnline: (v: boolean) => void;
  setLanguage: (lang: UiLanguage) => void;
  setVoiceGender: (g: VoiceGenderPref) => void;
  setReturnUrl: (url: string | null) => void;
  setIncidentBrief: (
    brief: string | null,
    evidence?: string | null,
    fromProdDeck?: boolean,
  ) => void;
  dismissIncident: () => void;
  requestSessionDesk: () => void;
  selectPersona: (id: PersonaId) => void;
  summonPersona: (id: PersonaId) => void;
  setSession: (s: Session | null) => void;
  setWorkspacePath: (path: string) => void;
  rememberWorkspace: (path: string) => void;
  registerSessionForPath: (path: string, sessionId: string, label?: string) => void;
  switchSessionTab: (sessionId: string) => void;
  closeSessionTab: (sessionId: string) => void;
  setActiveProject: (id: string) => void;
  deployProject: (name: string, idea: string) => OfficeProject;
  setAgentState: (id: PersonaId, patch: Partial<AgentRuntimeState>) => void;
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
  setCameraMode: (m: "firstPerson" | "overview") => void;
  setOrbitShot: (shot: import("@/lib/camera-framing").OrbitShot) => void;
  /** Menu picker: framed shots or walk */
  pickCameraView: (
    view: import("@/lib/camera-framing").OrbitShot | "walk",
  ) => void;
  toggleCameraMode: () => void;
  bumpChatFocus: () => void;
  setComposeDraft: (text: string) => void;
  consumeComposeDraft: () => string;
  setOfficeChromeOpen: (v: boolean) => void;
  toggleOfficeChrome: () => void;
  setChatOpen: (v: boolean) => void;
  openChat: () => void;
  closeChat: () => void;
  setOfficeMood: (m: OfficeMood) => void;
  cycleOfficeMood: () => void;
  setPlayerPosition: (p: [number, number, number]) => void;
  setPlayerMoveInput: (v: { x: number; z: number }) => void;
};

export const useVerseStore = create<VerseState>()(
  persist(
    (set, get) => ({
      authConfig: null,
      authenticated: false,
      username: null,
      accessToken: null,
      apiOnline: false,
      language: "ta",
      voiceGender: "auto",
      selectedPersona: orchestratorId,
      session: null,
      persistedSessionId: null,
      workspacePath: DEFAULT_WORKSPACE,
      recentWorkspaces: [DEFAULT_WORKSPACE],
      sessionsByPath: {},
      sessionTabs: [],
      activeTabSessionId: null,
      projects: [HUB_PROJECT],
      activeProjectId: "hub",
      agentStates: defaultAgentStates(),
      messages: [],
      quests: [],
      busy: false,
      error: null,
      streamingHint: null,
      interaction: { mode: "idle", focusId: null },
      greetOnce: {},
      subtitle: null,
      orbitLocked: false,
      cameraMode: "overview",
      orbitShot: "floorS",
      chatFocusNonce: 0,
      composeDraft: "",
      officeChromeOpen: false,
      chatOpen: false,
      returnUrl: null,
      incidentBrief: null,
      incidentEvidence: null,
      incidentDismissed: false,
      incidentFromProdDeck: false,
      sessionDeskRequestNonce: 0,
      officeMood: "day",
      playerPosition: [0, 0, 5.2],
      playerMoveInput: { x: 0, z: 0 },
      setAuthConfig: (c) => set({ authConfig: c }),
      setAuthenticated: (v, username = null) =>
        set({
          authenticated: v,
          username,
          // PROD-like default orbit overview (FP remains via toggle)
          cameraMode: "overview",
        }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setApiOnline: (v) => set({ apiOnline: v }),
      setLanguage: (language) => set({ language }),
      setVoiceGender: (voiceGender) => set({ voiceGender }),
      setReturnUrl: (url) => set({ returnUrl: url }),
      setIncidentBrief: (brief, evidence = null, fromProdDeck = false) =>
        set({
          incidentBrief: brief,
          incidentEvidence: evidence,
          incidentFromProdDeck: fromProdDeck,
          incidentDismissed: false,
        }),
      dismissIncident: () => set({ incidentDismissed: true }),
      requestSessionDesk: () =>
        set((s) => ({ sessionDeskRequestNonce: s.sessionDeskRequestNonce + 1 })),
      // Selection / summon never auto-opens chat — Talk / CommsDock only
      selectPersona: (id) => set({ selectedPersona: id }),
      summonPersona: (id) => {
        set({
          selectedPersona: id,
          interaction: { mode: "approaching", focusId: id },
          // Keep orbit free so the player can watch / keep walking nearby
          orbitLocked: false,
          subtitle: null,
        });
        get().setAgentState(id, {
          pose: "standing",
          working: false,
          status: "Approaching",
        });
      },
      setSession: (s) =>
        set({
          session: s,
          persistedSessionId: s?.id ?? null,
          workspacePath: s?.workspacePath || get().workspacePath,
          activeTabSessionId: s?.id ?? get().activeTabSessionId,
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
      registerSessionForPath: (path, sessionId, label) => {
        const short =
          label ||
          path.replace(/\\/g, "/").split("/").pop() ||
          path.slice(0, 16);
        const tabs = get().sessionTabs.filter((t) => t.sessionId !== sessionId);
        const nextTab: SessionTab = {
          sessionId,
          workspacePath: path,
          label: short,
        };
        set({
          sessionsByPath: { ...get().sessionsByPath, [path]: sessionId },
          sessionTabs: [nextTab, ...tabs].slice(0, 6),
          activeTabSessionId: sessionId,
        });
      },
      switchSessionTab: (sessionId) => {
        const tab = get().sessionTabs.find((t) => t.sessionId === sessionId);
        if (!tab) return;
        set({
          activeTabSessionId: sessionId,
          workspacePath: tab.workspacePath,
        });
      },
      closeSessionTab: (sessionId) => {
        const tabs = get().sessionTabs.filter((t) => t.sessionId !== sessionId);
        const active =
          get().activeTabSessionId === sessionId
            ? (tabs[0]?.sessionId ?? null)
            : get().activeTabSessionId;
        set({ sessionTabs: tabs, activeTabSessionId: active });
      },
      setActiveProject: (id) => set({ activeProjectId: id }),
      deployProject: (name, idea) => {
        const existing = get().projects.filter((p) => p.id !== "hub");
        const id = `proj-${Date.now().toString(36)}`;
        const project: OfficeProject = {
          id,
          name: name.slice(0, 48) || "New Project",
          idea: idea.slice(0, 200),
          color: projectColor(existing.length),
          clusterOffset: nextClusterOffset(existing.length),
          managerId: "muthu",
          crewIds: ["muthu", "aravind", "karthik", "kabilan"],
          createdAt: Date.now(),
        };
        set({
          projects: [...get().projects, project],
          activeProjectId: id,
        });
        // Light up crew as working on the new project
        for (const pid of project.crewIds) {
          get().setAgentState(pid, {
            projectId: id,
            working: true,
            status: `On ${project.name}`,
            progress: 12,
            pose: "sitting",
          });
        }
        getPersona("muthu"); // warm import side-effects / validate
        return project;
      },
      setAgentState: (id, patch) =>
        set((s) => ({
          agentStates: {
            ...s.agentStates,
            [id]: { ...s.agentStates[id], ...patch },
          },
        })),
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
      addQuest: (q) => {
        set((s) => ({ quests: [q, ...s.quests].slice(0, 12) }));
        get().setAgentState(q.assignee, {
          working: true,
          status: q.title,
          progress: q.progress ?? 10,
          projectId: q.projectId ?? get().activeProjectId,
        });
      },
      updateQuest: (id, patch) =>
        set((s) => {
          const quests = s.quests.map((q) => (q.id === id ? { ...q, ...patch } : q));
          const q = quests.find((x) => x.id === id);
          if (q && typeof patch.progress === "number") {
            const agentStates = {
              ...s.agentStates,
              [q.assignee]: {
                ...s.agentStates[q.assignee],
                progress: patch.progress,
                working: patch.status !== "done",
                status:
                  patch.status === "done" ? "At desk" : s.agentStates[q.assignee].status,
              },
            };
            return { quests, agentStates };
          }
          if (q && patch.status === "done") {
            return {
              quests,
              agentStates: {
                ...s.agentStates,
                [q.assignee]: {
                  ...s.agentStates[q.assignee],
                  progress: 100,
                  working: false,
                  status: "At desk",
                  pose: "sitting",
                },
              },
            };
          }
          return { quests };
        }),
      setBusy: (v) => set({ busy: v }),
      setError: (e) => set({ error: e }),
      setStreamingHint: (h) => set({ streamingHint: h }),
      setInteraction: (patch) =>
        set((s) => ({ interaction: { ...s.interaction, ...patch } })),
      markGreeted: (id) =>
        set((s) => ({ greetOnce: { ...s.greetOnce, [id]: true } })),
      setSubtitle: (text) => set({ subtitle: text }),
      setOrbitLocked: (v) => set({ orbitLocked: v }),
      setCameraMode: (m) => set({ cameraMode: m }),
      setOrbitShot: (orbitShot) => set({ orbitShot, cameraMode: "overview" }),
      pickCameraView: (view) => {
        if (view === "walk") {
          set({ cameraMode: "firstPerson" });
          return;
        }
        set({ cameraMode: "overview", orbitShot: view });
      },
      toggleCameraMode: () =>
        set((s) => ({
          cameraMode:
            s.cameraMode === "firstPerson" ? "overview" : "firstPerson",
        })),
      bumpChatFocus: () =>
        set((s) => ({ chatFocusNonce: s.chatFocusNonce + 1 })),
      setComposeDraft: (composeDraft) => set({ composeDraft }),
      consumeComposeDraft: () => {
        const text = get().composeDraft;
        set({ composeDraft: "" });
        return text;
      },
      setOfficeChromeOpen: (officeChromeOpen) => set({ officeChromeOpen }),
      toggleOfficeChrome: () =>
        set((s) => ({ officeChromeOpen: !s.officeChromeOpen })),
      setChatOpen: (chatOpen) => set({ chatOpen }),
      openChat: () => set({ chatOpen: true }),
      closeChat: () => set({ chatOpen: false }),
      setOfficeMood: (officeMood) => set({ officeMood }),
      cycleOfficeMood: () =>
        set((s) => {
          const i = OFFICE_MOODS.indexOf(s.officeMood);
          return { officeMood: OFFICE_MOODS[(i + 1) % OFFICE_MOODS.length] };
        }),
      setPlayerPosition: (playerPosition) => set({ playerPosition }),
      setPlayerMoveInput: (playerMoveInput) => set({ playerMoveInput }),
    }),
    {
      name: "agentverse-office-v2",
      partialize: (s) => ({
        language: s.language,
        voiceGender: s.voiceGender,
        selectedPersona: s.selectedPersona,
        persistedSessionId: s.persistedSessionId ?? s.session?.id ?? null,
        workspacePath: s.workspacePath,
        recentWorkspaces: s.recentWorkspaces,
        sessionsByPath: s.sessionsByPath,
        sessionTabs: s.sessionTabs,
        activeTabSessionId: s.activeTabSessionId,
        projects: s.projects,
        activeProjectId: s.activeProjectId,
        quests: s.quests,
        greetOnce: s.greetOnce,
        officeMood: s.officeMood,
        cameraMode: s.cameraMode,
        orbitShot: s.orbitShot,
      }),
    },
  ),
);
