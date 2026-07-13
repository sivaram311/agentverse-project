# AgentVerse — Implementation Guide

**Status:** PREPROD **0.2.5** mobile perf + first-person · PROD still **0.2.2** (2026-07-13)  
**Stack:** Next.js 15 + R3F / Three.js  
**API:** agent-portal DEV `:8080` / PREPROD `:4080` / PROD `:5080`  
**UI ports:** DEV **3310** · PREPROD **4310** · PROD **5310**  
**Personas:** Rajesh, Karthik, Lavanya, Aravind, Meenakshi, Muthu, Kabilan (`src/prompts/personas.json`)

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

## Architecture

| Area | Path |
|------|------|
| App Router + health/proxies | `src/app` |
| TN office scene | `src/components/scene` (`SiruseriOffice`, `CentralConference`, `TeamCluster`, `GlassCube`, `SideConferenceBlock`, `HubScene`) |
| HQ layout SoT | `src/lib/office-layout.ts` (`HQ_BOUNDS`, `TEAM_ZONES`, `ANCHORS`) |
| HUD | `src/components/hud` (language, projects, session tabs, chat, quests) |
| Portal client | `src/lib/api.ts` via `/api/portal` |
| Orchestrator | `src/lib/orchestrator.ts` (Rajesh routing + project deploy) |
| Office state | `src/lib/store.ts` (Zustand persist `agentverse-office-v2`) |
| Release launcher | `scripts/start-release.ps1` → copied as `start.ps1` on F:/G: |

## Expanded HQ (Bigger Mandala) — visual v1

Floor ≈ X±18, Z −16…+12 (`ceilingY` 4.35). Aesthetic lock: walls `#161c24`, floors `#0c1016`/`#121018`, gold `#E8A838`.

| Zone | Component |
|------|-----------|
| Shell + elevators + spine | `SiruseriOffice` + `ElevatorShaft` |
| Central conference (15 seats, TV, ideas) | `CentralConference` |
| 20 team pods (5 desks + orchestrator) | `TeamCluster` / `OrchestratorDesk` |
| Glass cube + 3 side rooms | `GlassCube` / `SideConferenceBlock` |

Isolation mounts: `/dev/office-shell`, `/dev/office-conference`, `/dev/office-teams`, `/dev/office-glass`.

### Expanded HQ perf

1. **Perf tiers** (`src/lib/perf-profile.ts`): phones/tablets → `low`/`medium` (force `lod=simple`, no HDR Environment, no ContactShadows, no walkers).
2. Team pods: distance cull + **proxy pads** (no desks) beyond near budget; max 4–6 mounted on mobile.
3. Throttle cluster React updates to ~5 Hz (avoid remount storms).
4. Shell: sparse LED cans on simple; ≤1 fill pointLight on mobile.
5. Desktop high: capped full clusters, fog, hashed assets.

## Office behavior

1. Agents sit at desks with work-loop animations and progress bars.
2. Click → stand → walk → greet (ta/hi/en) → chat focus → return → sit.
3. `new project: …` via Rajesh → satellite desk cluster + crew assignment.
4. Each directory can own a portal session (WorkspacePicker + SessionTabs).
5. Auth → first-person eye-level look+walk; toggle Overview (orbit HQ) via camera mode.

## Promote

Follow MyAgent Q1/Q2 + project skill `.cursor/skills/agentverse-promote`.  
Evidence: `H:\releases\agentverse-<ver>\evidence\`.  
Current release: **0.2.5** PREPROD (`Q1_PREPROD_OK_025`). PROD remains **0.2.2** until Q2.

## Crew / skills

- Manifest: `agents/crew-manifest.md`
- Role index: `agents/roles/office-crew.md`
- Hire: `agents/hires/2026-07-13-expanded-hq.md`
- Skills: `agentverse-office`, `agentverse-promote` (plus MyAgent `promote-*`)
