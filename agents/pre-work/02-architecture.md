# 02 - Technical Architecture

**Status:** APPROVED (GO 2026-07-12)  
**Project:** AgentVerse

## Stack

| Layer | Choice |
|-------|--------|
| App | Next.js 15 (App Router) + TypeScript |
| 3D | React Three Fiber + Drei + Three.js |
| State | Zustand |
| Auth | CSS via agent-portal `/api/auth/config` |
| API | Rewrite `/api/portal/*` → `http://127.0.0.1:8080/api/*` |
| DEV port | **3310** |
| PWA | manifest + service worker shell |

## Migration map (agent-portal → AgentVerse)

| Portal feature | AgentVerse v0.1 |
|----------------|-----------------|
| CSS login | LoginOverlay |
| Sessions create/list | ChatPanel bootstrap |
| Prompt + messages | ChatPanel + poll |
| Sub-agents / routing | Rajveer `orchestrator.ts` + personas.json |
| STOMP streaming | Phase follow-up (poll works) |
| Changes / Files / Monaco | Later missions |
| Angular UI | Replaced by 3D hub |

## Components

- HubScene, PersonaAvatar (low-poly + LOD-ish markers)
- TopBar, QuestPanel, ChatPanel, LoginOverlay

## Expanded HQ (Bigger Mandala) — 2026-07-13

**Layout SoT:** `src/lib/office-layout.ts` (`HQ_BOUNDS` halfW 18, backZ -16, openZ 12, ceilingY 4.35)

| Track | Files |
|-------|--------|
| Shell A | `SiruseriOffice.tsx`, `ElevatorShaft.tsx` |
| Conference B | `CentralConference.tsx` |
| Teams C | `TeamCluster.tsx`, `OrchestratorDesk.tsx` |
| Cube/Rooms D | `GlassCube.tsx`, `SideConferenceBlock.tsx` |
| Integrate E | `HubScene.tsx`, `camera-framing.ts`, player bounds |

Isolation: `/dev/office-shell`, `/dev/office-conference`, `/dev/office-teams`, `/dev/office-glass`

```
         Z+ open (12)
    WalkL | Teams L | Spine+Cube | Teams R | WalkR
          |         | Conference |         |
          |         | SideConfx3 |         |
         Z- back (-16)
```
