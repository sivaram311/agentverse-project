---
name: agentverse-office
description: >-
  Extend or debug the AgentVerse Tamil Nadu 3D digital office — desks, approach
  FSM, multilingual greetings, projects, and per-directory sessions. Use when
  changing HubScene, personas, Zustand office store, or office HUD.
---

# AgentVerse office workplace

## Source of truth

- Personas: `src/prompts/personas.json` (Rajesh orchestrator + TN crew)
- Store: `src/lib/store.ts` (language, projects, sessionsByPath, agentStates)
- Scene: `HubScene.tsx`, `OfficeEnvironment.tsx`, `DeskCluster.tsx`, `PersonaAvatar.tsx`, `useApproachBehavior.ts`
- HUD: LanguagePicker, ProjectSwitcher, SessionTabs, WorkspacePicker, ChatPanel

## Behavior contract

1. Default pose: **sitting** + work-loop arm animation at desk.
2. Click/tap → stand → walk to approach spot → greet (SpeechSynthesis) → focus chat → return → sit.
3. Language: store `language` `ta` | `hi` | `en` → greetings + `ta-IN` / `hi-IN` / `en-IN`.
4. Projects: Rajesh prompt matching `new project:` → `deployProject` + satellite desk cluster.
5. Sessions: each workspace path maps to a portal session; switch via SessionTabs / WorkspacePicker.

## Performance

- Narrow (≤360px): `lod=simple`, lower DPR/stars, fewer Html labels.
- Prefer Suspense around Canvas; avoid rebuilding `.next` while DEV is running.

## Crew roles

See `agents/roles/` and `agents/crew-manifest.md`.
