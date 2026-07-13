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
- Layout SoT: `src/lib/office-layout.ts` (`HQ_BOUNDS`, `TEAM_ZONES`, `ANCHORS`, `CONFERENCE`)
- Scene: `HubScene.tsx`, `SiruseriOffice.tsx`, `CentralConference.tsx`, `TeamCluster.tsx`, `GlassCube.tsx`, `SideConferenceBlock.tsx`, `ElevatorShaft.tsx`, `DeskCluster.tsx`, `PersonaAvatar.tsx`, `useApproachBehavior.ts`
- HUD: LanguagePicker, ProjectSwitcher, SessionTabs, WorkspacePicker, **SessionDesk**, ChatPanel
- Dev isolation: `/dev/office-shell`, `/dev/office-conference`, `/dev/office-teams`, `/dev/office-glass`

## Behavior contract

1. Default pose: **sitting** + work-loop (typing arms, head look, screen glow) via `HumanoidFigure`.
2. Click/tap → stand → walk to approach spot → greet (SpeechSynthesis, gender-aware) → focus chat → return → sit.
3. Language: store `language` `ta` | `hi` | `en`; voice: `voiceGender` `auto` | `male` | `female`.
4. Projects: Rajesh `new project:` → `deployProject` + satellite desk cluster.
5. Sessions: each workspace path maps to a portal session; SessionTabs / WorkspacePicker / **SessionDesk** (list, create, archive, restore).
6. Optional allowlist: `NEXT_PUBLIC_WORKSPACE_ALLOWLIST` (comma-separated); see `src/lib/workspaces.ts`.
7. Expanded HQ visual: central conference + 20 team clusters + glass cube + side conference block; HexCollab not mounted in HubScene (keep `HubChair` export).
8. Auth → `cameraMode: firstPerson` (eye-level look+walk); toggle Overview (`overview` orbit HQ) via `toggleCameraMode`.

## Visual stack

- `SiruseriOffice` — expanded shell, spine, walkways, elevators, glass curtains
- `CentralConference` — long table, 15 chairs, TV, ideas board, scaled MandalaPulse
- `TeamCluster` / `OrchestratorDesk` — 5× AgentDesk + orch board per zone
- `GlassCube` / `SideConferenceBlock` — transmission cube + half-frosted front rooms
- `DeskCluster` — holo monitors, edge glow, lamps (LOD)
- `HumanoidFigure` — stylized low-poly humans
- `DataOrbs` + Sparkles — directory / project crystals

## Performance

- Narrow (≤360px): `lod=simple`, lower DPR, fewer Html labels / lamps.
- Team distance LOD: max 6 full clusters near camera (&lt;14m); rest simple.
- Prefer Suspense around Canvas; avoid rebuilding `.next` while DEV is running.

## Crew roles

See `agents/roles/` and `agents/crew-manifest.md`. Hire: `agents/hires/2026-07-13-expanded-hq.md`.
