# AgentVerse — Implementation Guide

**Status:** DEV **0.3.0** on `feature/upgradation-functionality` (base `v0.2.2-stable`). Classic PREPROD/PROD remain **0.2.x** until Q1/Q2.  
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

# PREPROD / PROD — after promote GO only
cd F:\apps\agentverse   # or G:\apps\agentverse
.\start.ps1 -EnvName preprod   # or prod
```

Public URLs: [OPS.md](./OPS.md) · Deep-links: [DEEP-LINK-CONTRACT.md](./DEEP-LINK-CONTRACT.md) · Promote: [PROMOTE-UPGRADATION.md](./PROMOTE-UPGRADATION.md)

## Architecture

| Area | Path |
|------|------|
| App Router + health/proxies | `src/app` (+ `/desk` deep-link entry) |
| TN office scene | `src/components/scene` |
| HUD | `src/components/hud` (Session Desk, chat, quests, incident strip) |
| Portal client | `src/lib/api.ts` via `/api/portal` |
| Deep-links | `src/lib/session-share.ts` |
| Orchestrator | `src/lib/orchestrator.ts` |
| Office state | `src/lib/store.ts` (Zustand persist `agentverse-office-v2`; projects remain local flavor until durable conventions) |
| Release launcher | `scripts/start-release.ps1` |

## Upgradation behavior (0.3.0)

1. Session Desk: search, status filters, cancel run, title-at-create.
2. Busy resume: cancel-first then reuse; fork only as last resort.
3. Quests bind `sessionId`; status from portal (no fake % SoT).
4. Chat: status chip, cancel, permission Allow/Deny when portal pending APIs respond.
5. `/desk` deep-link hire/brief/return (allowlisted).
6. Env + Portal/CSS health in TopBar.

## Promote

MyAgent Q1/Q2 + `.cursor/skills/agentverse-promote` + **field-ops**.  
Evidence: `H:\releases\agentverse-0.3.0\evidence\`.

## Crew / skills

- Manifest: `agents/crew-manifest.md`
- Hire: `agents/hires/2026-07-15-upgradation-functionality.md`
- Pre-work: `agents/pre-work/waves/upgradation/`
