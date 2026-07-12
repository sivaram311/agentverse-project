# AgentVerse — Implementation Guide

**Status:** LIVE — **0.2.0** on PREPROD + PROD (2026-07-12)  
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
| TN office scene | `src/components/scene` (`OfficeEnvironment`, `DeskCluster`, `PersonaAvatar`, `useApproachBehavior`) |
| HUD | `src/components/hud` (language, projects, session tabs, chat, quests) |
| Portal client | `src/lib/api.ts` via `/api/portal` |
| Orchestrator | `src/lib/orchestrator.ts` (Rajesh routing + project deploy) |
| Office state | `src/lib/store.ts` (Zustand persist `agentverse-office-v2`) |
| Release launcher | `scripts/start-release.ps1` → copied as `start.ps1` on F:/G: |

## Office behavior

1. Agents sit at desks with work-loop animations and progress bars.
2. Click → stand → walk → greet (ta/hi/en) → chat focus → return → sit.
3. `new project: …` via Rajesh → satellite desk cluster + crew assignment.
4. Each directory can own a portal session (WorkspacePicker + SessionTabs).

## Promote

Follow MyAgent Q1/Q2 + project skill `.cursor/skills/agentverse-promote`.  
Evidence: `H:\releases\agentverse-<ver>\evidence\`.  
Current release: **0.2.0**.

## Crew / skills

- Manifest: `agents/crew-manifest.md`
- Role index: `agents/roles/office-crew.md`
- Skills: `agentverse-office`, `agentverse-promote` (plus MyAgent `promote-*`)
