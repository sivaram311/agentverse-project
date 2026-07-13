# AgentVerse — Implementation Guide

**Status:** PREPROD **0.3.11** (Intellect benches + freestyle cams + PROD dark shell) · PROD still **0.2.2** (2026-07-14)  
**Stack:** Next.js 15 + R3F / Three.js  
**API:** agent-portal DEV `:8080` / PREPROD `:4080` / PROD `:5080`  
**UI ports:** DEV **3310** · PREPROD **4310** · PROD **5310**  
**Personas:** Rajesh, Karthik, Lavanya, Aravind, Mathura, Muthu, Kabilan (`src/prompts/personas.json`)

## Run

```powershell
# DEV
cd E:\MyWorkspace\agentverse-project
npm install
npm run dev          # or: npm run dev:stack

# PREPROD
cd F:\apps\agentverse
.\start.ps1 -EnvName preprod

# PROD
cd G:\apps\agentverse
.\start.ps1 -EnvName prod
```

Public URLs: [OPS.md](./OPS.md)

## Architecture (current PREPROD)

| Area | Path |
|------|------|
| App Router + health/proxies | `src/app` |
| Main scene | `src/components/scene/HubScene.tsx` |
| Shell (walls/glass/floor/ceiling/pantry) | `SiruseriOffice.tsx` |
| Bench desks + NPC sitters | `IntellectBenches.tsx` + `src/lib/intellect-benches.ts` |
| Crew avatars | `PersonaAvatar.tsx` (seated via `personaHome`) |
| Camera | `FramingControls.tsx` + `src/lib/camera-framing.ts` + HUD `ViewAngles.tsx` |
| Lighting | `OfficeEnvironment.tsx` (PROD day mood) |
| HQ bounds SoT | `src/lib/office-layout.ts` |
| Portal client | `src/lib/api.ts` via `/api/portal` |
| Orchestrator | `src/lib/orchestrator.ts` |
| Office state | `src/lib/store.ts` (Zustand persist) |

**Legacy (not mounted in HubScene 0.3.11):** `HexCollabOffice`, `TeamCluster`, `CentralConference`, `GlassCube`, `ElevatorShaft`, `DeskCluster` ProjectCluster — keep for restore.

## Camera contract

1. User picks a view → camera **snaps once** to that preset (floor Front/Back/E/W/corners or body shot).
2. After snap → **OrbitControls freestyle** (rotate, zoom, pan).
3. **Walk** → first-person; exit returns to overview.

## Bench seating

Foreground (Front cam): Aravind · Rajesh (dual monitors) · Lavanya.  
Remaining crew on mid-row; NPC sitters fill other benches. Standing NPC on one back seat.

## Next iteration notes

- Further densify / detail benches vs photo (dupatta, cables, more phones)
- Optional restore hex/teams if product asks
- PROD promote only with Q2 evidence + EM GO

## Docs

- [OPS.md](./OPS.md) — env map + version trail  
- `agents/roles/office-crew.md` — crew brief
