# AgentVerse — Implementation Guide

**Status:** **0.4.2** on branch `feature/stable-v2` (side fleet **agentverse-v2**). Classic PROD remains **0.2.2-stable** on :5310.  
**Stack:** Next.js 15 + R3F / Three.js  
**API:** agent-portal DEV `:8080` / PREPROD `:4080` / PROD `:5080`  
**UI ports (stable-v2):** DEV **3311** · PREPROD **4311** · PROD **5311**  
**UI ports (classic — do not disturb):** DEV **3310** · PREPROD **4310** · PROD **5310**  
**Personas:** Rajesh, Karthik, Lavanya, Aravind, Meenakshi, Muthu, Kabilan (`src/prompts/personas.json`)

## Run

```powershell
# DEV (stable-v2 — port 3311)
cd E:\MyWorkspace\agentverse-project
npm install
npm run dev          # or: npm run dev:stack

# PREPROD (stable-v2 — do not use F:\apps\agentverse)
cd F:\apps\agentverse-v2
.\start.ps1 -EnvName preprod

# PROD (stable-v2)
cd G:\apps\agentverse-v2
.\start.ps1 -EnvName prod
```

Public URLs and classic fleet: [OPS.md](./OPS.md)

## Architecture

| Area | Path |
|------|------|
| App Router + health/proxies | `src/app` |
| TN office scene | `src/components/scene` (`OfficeEnvironment`, `DeskCluster`, `PersonaAvatar`, `useApproachBehavior`) |
| Camera framing | `src/lib/camera-framing.ts`, `FramingControls.tsx`, `FirstPersonControls.tsx` |
| View angle chrome | `src/components/hud/ViewAngles.tsx` |
| HUD | `src/components/hud` (language, projects, session tabs, chat, quests, Session Desk) |
| Portal client | `src/lib/api.ts` via `/api/portal` |
| Orchestrator | `src/lib/orchestrator.ts` (Rajesh routing + project deploy) |
| Office state | `src/lib/store.ts` (Zustand persist `agentverse-office-v2-stable`) |
| Release launcher | `scripts/start-release.ps1` → copied as `start.ps1` on F:/G: agentverse-v2 |

## Office behavior

1. Agents sit at desks with work-loop animations and progress bars.
2. Click → stand → walk → greet (ta/hi/en) → return → sit. Chat does **not** auto-open; use Talk / command strip / CommsDock / `openChat`.
3. `selectPersona` / `summonPersona` in `store.ts` must **not** set `chatOpen: true` (PREPROD-matched).
4. `new project: …` via Rajesh → satellite desk cluster + crew assignment.
5. Each directory can own a portal session (WorkspacePicker + SessionTabs).

## Session Desk (from 0.2.2 lineage)

In-app **Sessions** panel (`src/components/hud/SessionDesk.tsx`) — command strip / top chrome:

- **Active / Archived** filters
- **New** — create session on a workspace path
- **Open** — load into tabs + chat
- **Archive / Restore** — `POST /api/portal/sessions/{id}/archive|unarchive`

Env:

- `NEXT_PUBLIC_DEFAULT_WORKSPACE` — default path/name (e.g. `demo`)
- `NEXT_PUBLIC_WORKSPACE_ALLOWLIST` — optional comma-separated quick-picks; empty = unrestricted (portal root still applies)

## Stable-v2 (0.4.2)

Parallel product line off **`v0.2.2-stable`**: same Siruseri office scale, brighter day lighting, PREPROD-style camera UX, separate ship paths/ports so classic :4310/:5310 stay undisturbed. **0.4.2** restyles the plate as a bright industrial open-plan office.

### Bright industrial office (0.4.2)

| Piece | Role |
|-------|------|
| `src/lib/office-palette.ts` | Shared SoT — `PALETTE` + `INDUSTRIAL_BOUNDS` (walls/floor teal desks, black chairs, beams, lockers) |
| `IndustrialCeiling.tsx` | Exposed ceiling: I-beams/trusses, HVAC ducts/pipes, cool downlights |
| `OfficeStorage.tsx` | Perimeter lockers, cabinets, whiteboards (LOD-aware) |
| `HubScene.tsx` | Composes shell (`SiruseriOffice`) + `IndustrialCeiling` + `OfficeStorage` + hex collab + desks / avatars |

### Camera framing

| Piece | Role |
|-------|------|
| `OrbitShot` (`camera-framing.ts`) | Named orbit framings: floor S/N/E/W + diagonals, body shots (`shoulders`, `close`, `face`, `desk`, …) |
| `ORBIT_SHOTS` / `ORBIT_SHOT_ORDER` | Shot params + menu order for the Views bar |
| `FramingControls.tsx` | Applies selected `orbitShot` in overview/orbit mode |
| `FirstPersonControls.tsx` | Walk / FP mode when `cameraMode` is first-person |
| `ViewAngles.tsx` | HUD angle picker (shown when `cameraViewsVisible`) |

Store drives mode via `cameraMode` + `orbitShot`; `pickCameraView(view | "walk")` switches overview shot vs walk.

### Chrome toggles (TopBar)

| Store key | Default | UI |
|-----------|---------|-----|
| `joystickVisible` | `true` | TopBar **Joystick** — show/hide on-screen stick |
| `cameraViewsVisible` | `true` | TopBar **Views** — show/hide angle bar |

### Persist

Zustand `persist` name: **`agentverse-office-v2-stable`**.

Partialized camera/chrome fields include: `officeMood`, `cameraMode`, `orbitShot`, `joystickVisible`, `cameraViewsVisible` (plus language, sessions, projects, quests, …).

### Lighting

Default mood **day**; canvas exposure ≈ **1.32** for a bright office read.

### Deploy identity

- Ports: **3311 / 4311 / 5311**
- Paths: `F:\apps\agentverse-v2` · `G:\apps\agentverse-v2`
- Hosts: `agentverse-v2-staging.delena.buzz` · `agentverse-v2.delena.buzz`
- Ops: [OPS.md](./OPS.md) · continue: [HANDOFF.md](./HANDOFF.md)

## Promote

Follow MyAgent Q1/Q2 + project skill `.cursor/skills/agentverse-promote`.  
Evidence: `H:\releases\agentverse-<ver>\evidence\` (or `agentverse-v2-<ver>` when packing the side fleet).  
**Side deploy:** pack to agentverse-v2 paths only; never recycle classic :4310/:5310.  
Current side-fleet version: **0.4.2**. Classic PROD tag remains **v0.2.2-stable**.

## Crew / skills

- Manifest: `agents/crew-manifest.md`
- Role index: `agents/roles/office-crew.md`
- Skills: `agentverse-office`, `agentverse-promote` (plus MyAgent `promote-*`)
