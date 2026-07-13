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
- HUD: LanguagePicker, ProjectSwitcher, SessionTabs, WorkspacePicker, **SessionDesk**, ChatPanel

## Behavior contract

1. Default pose: **sitting** + work-loop (typing arms, head look, screen glow) via `HumanoidFigure`.
2. Click/tap → stand → walk to approach spot → greet (SpeechSynthesis, gender-aware) → focus chat → return → sit.
3. Language: store `language` `ta` | `hi` | `en`; voice: `voiceGender` `auto` | `male` | `female`.
4. Projects: Rajesh `new project:` → `deployProject` + satellite desk cluster.
5. Sessions: each workspace path maps to a portal session; SessionTabs / WorkspacePicker / **SessionDesk** (list, create, archive, restore).
6. Optional allowlist: `NEXT_PUBLIC_WORKSPACE_ALLOWLIST` (comma-separated); see `src/lib/workspaces.ts`.

## Visual stack

- `OfficeEnvironment` — multi-ring mandala, pillars, warm lighting
- `DeskCluster` — holo monitors, edge glow, lamps (LOD)
- `HumanoidFigure` — stylized low-poly humans (skin/hair/gender from personas.json)
- `DataOrbs` + Sparkles — directory / project crystals

## Performance

- Narrow (≤360px): `lod=simple`, lower DPR/stars, fewer Html labels / pillars / lamps.
- Prefer Suspense around Canvas; avoid rebuilding `.next` while DEV is running.

## Crew roles

See `agents/roles/` and `agents/crew-manifest.md`.
